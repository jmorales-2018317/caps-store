type CapMaterial = {
  name: string;
  clone: () => CapMaterial;
  color?: { set: (hex: string) => void };
  transparent?: boolean;
  opacity?: number;
  depthWrite?: boolean;
  alphaTest?: number;
  needsUpdate?: boolean;
};

type CapMesh = {
  isMesh?: boolean;
  name?: string;
  material?: CapMaterial | CapMaterial[];
  geometry?: CapBufferGeometry;
};

type CapPositionAttribute = {
  getX: (i: number) => number;
  getY: (i: number) => number;
  getZ: (i: number) => number;
};

type CapBufferGeometry = {
  index?: { count: number; getX: (i: number) => number };
  getAttribute: (name: string) => CapPositionAttribute | undefined;
  clearGroups: () => void;
  addGroup: (start: number, count: number, materialIndex: number) => void;
  setIndex: (indices: number[]) => void;
};

const ABIERTA_CLASP_MATERIAL = "fabric_clasp";

/** Límites en coords locales del GLB Abierta (solo la cinta, sin malla lateral) */
const ABIERTA_STRAP = {
  vertexMaxX: 0.03,
  minY: 0,
  maxY: 0.0205,
  minZ: -0.083,
} as const;

function isVertexInAbiertaStrapZone(x: number, y: number, z: number) {
  return (
    z < ABIERTA_STRAP.minZ &&
    y >= ABIERTA_STRAP.minY &&
    y <= ABIERTA_STRAP.maxY &&
    Math.abs(x) <= ABIERTA_STRAP.vertexMaxX
  );
}

/** Solo triángulos 100 % dentro de la cinta (evita dientes que invaden la malla). */
function isAbiertaBackStrapTriangle(
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
  cx: number,
  cy: number,
  cz: number
) {
  return (
    isVertexInAbiertaStrapZone(ax, ay, az) &&
    isVertexInAbiertaStrapZone(bx, by, bz) &&
    isVertexInAbiertaStrapZone(cx, cy, cz)
  );
}

type CapObject3D = {
  clone: (recursive?: boolean) => CapObject3D;
  traverse: (callback: (obj: CapObject3D) => void) => void;
};

function cloneMaterials(root: CapObject3D) {
  root.traverse((obj) => {
    const mesh = obj as CapMesh;
    if (!mesh.isMesh || !mesh.material) return;

    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((m) => m.clone());
      return;
    }

    mesh.material = mesh.material.clone();
  });
}

export function cloneCapScene(scene: CapObject3D) {
  const clone = scene.clone(true);
  cloneMaterials(clone);
  return clone;
}

type CapMaterialExtended = CapMaterial & {
  metalness?: number;
  roughness?: number;
  envMapIntensity?: number;
  specularIntensity?: number;
  specularColor?: { set: (hex: string) => void };
};

function applyColorToMaterial(material: CapMaterial, hex: string) {
  if (!material.color) return;
  material.color.set(hex);
  material.needsUpdate = true;
}

/** Mantiene textura maya/malla; solo baja brillo para que el tinte no se vea gris */
function tuneAbiertaMaterialRendering(mat: CapMaterialExtended) {
  mat.metalness = 0;
  if (typeof mat.roughness === "number") {
    mat.roughness = Math.max(mat.roughness, 0.88);
  }
  mat.envMapIntensity = 0.3;
  if (typeof mat.specularIntensity === "number") {
    mat.specularIntensity = 0.6;
  }
  if (mat.specularColor) {
    mat.specularColor.set("#1a1a1a");
  }
}

/** Gorra abierta: color × textura original del GLB */
function applyAbiertaFabricTint(material: CapMaterial, hex: string) {
  const mat = material as CapMaterialExtended;
  applyColorToMaterial(mat, hex);
  tuneAbiertaMaterialRendering(mat);
  mat.needsUpdate = true;
}

/** Cinta trasera: misma lógica, conserva mapa */
function applyAbiertaClaspTint(material: CapMaterial, hex: string) {
  applyAbiertaFabricTint(material, hex);
}

/**
 * El GLB Abierta trae un solo material; separamos la cinta trasera (broche)
 * para poder teñirla aparte (fabric_clasp).
 */
export function splitAbiertaClaspGeometry(root: CapObject3D) {
  root.traverse((obj) => {
    const mesh = obj as CapMesh;
    if (!mesh.isMesh || !mesh.geometry || !mesh.material) return;
    if (Array.isArray(mesh.material)) return;

    const geometry = mesh.geometry;
    const index = geometry.index;
    const position = geometry.getAttribute("position");
    if (!index || !position) return;

    const fabricIndices: number[] = [];
    const claspIndices: number[] = [];

    for (let i = 0; i < index.count; i += 3) {
      const ia = index.getX(i);
      const ib = index.getX(i + 1);
      const ic = index.getX(i + 2);
      const isStrap = isAbiertaBackStrapTriangle(
        position.getX(ia),
        position.getY(ia),
        position.getZ(ia),
        position.getX(ib),
        position.getY(ib),
        position.getZ(ib),
        position.getX(ic),
        position.getY(ic),
        position.getZ(ic)
      );
      const target = isStrap ? claspIndices : fabricIndices;
      target.push(ia, ib, ic);
    }

    if (claspIndices.length === 0) return;

    const base = mesh.material;
    const fabricMat = base.clone();
    fabricMat.name = "fabric";
    const claspMat = base.clone();
    claspMat.name = ABIERTA_CLASP_MATERIAL;

    geometry.setIndex([...fabricIndices, ...claspIndices]);
    geometry.clearGroups();
    if (fabricIndices.length > 0) {
      geometry.addGroup(0, fabricIndices.length, 0);
    }
    geometry.addGroup(fabricIndices.length, claspIndices.length, 1);

    mesh.material = [fabricMat, claspMat];
  });
}

/** Gorra abierta: BLEND de malla + depthWrite para evitar fantasma en el frente */
export function configureAbiertaMeshMaterial(root: CapObject3D) {
  root.traverse((obj) => {
    const mesh = obj as CapMesh;
    if (!mesh.isMesh || !mesh.material) return;

    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];

    for (const material of materials) {
      const mat = material as CapMaterialExtended;
      mat.transparent = true;
      mat.opacity = 1;
      mat.depthWrite = true;
      mat.alphaTest = 0;
      tuneAbiertaMaterialRendering(mat);
      mat.needsUpdate = true;
    }
  });
}

export function applyCapColors(
  root: CapObject3D,
  {
    fabricHex,
    buttonHex,
    fabricMaterialNames,
    claspMaterialNames,
    meshFabricTint = false,
  }: {
    fabricHex: string;
    buttonHex: string;
    fabricMaterialNames: readonly string[];
    claspMaterialNames: readonly string[];
    meshFabricTint?: boolean;
  }
) {
  const fabricSet = new Set(fabricMaterialNames);
  const claspSet = new Set(claspMaterialNames);

  root.traverse((obj) => {
    const mesh = obj as CapMesh;
    if (!mesh.isMesh || !mesh.material) return;

    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];

    for (const material of materials) {
      if (fabricSet.has(material.name)) {
        if (meshFabricTint) {
          applyAbiertaFabricTint(material, fabricHex);
        } else {
          applyColorToMaterial(material, fabricHex);
        }
      } else if (claspSet.has(material.name)) {
        if (meshFabricTint) {
          applyAbiertaClaspTint(material, buttonHex);
        } else {
          applyColorToMaterial(material, buttonHex);
        }
      }
    }
  });
}
