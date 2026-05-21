export const CAP_FABRIC_MATERIALS = ["Crown,Visor_1331"] as const;
export const CAP_CLASP_MATERIALS = ["Snap_1334", "Snap button_1336"] as const;

export const DEFAULT_CAP_FABRIC_COLOR = "#1a1a1a";
export const DEFAULT_CAP_BUTTON_COLOR = "#1a1a1a";

export type CapModelType = "tela" | "maya";

/** Modelo mostrado al entrar en personalizar */
export const DEFAULT_CAP_MODEL_TYPE: CapModelType = "maya";

export const CAP_MODEL_CONFIGS: Record<
  CapModelType,
  {
    path: string;
    label: string;
    fabricMaterials: string[];
    claspMaterials: string[];
    /** Escala en escena (Maya exporta en ~0.2 u; Tela en ~14 u) */
    sceneScale: number;
    orbitMinDistance: number;
    orbitMaxDistance: number;
    /** Ajuste de material malla (BLEND + depthWrite) sin quitar el look trasero */
    configureMeshMaterial: boolean;
  }
> = {
  tela: {
    path: "/models/cap/Female_Mid-Profile_Half-curved_gltf_thick.gltf",
    label: "Cerrada",
    fabricMaterials: ["Crown,Visor_1331"],
    claspMaterials: ["Snap_1334", "Snap button_1336"],
    sceneScale: 1,
    orbitMinDistance: 1.5,
    orbitMaxDistance: 5,
    configureMeshMaterial: false,
  },
  maya: {
    path: "/models/cap/uploads_files_7087718_White_Linen_Mesh_Cap_6a7e7b35-bfe0-473c-89ad-267b09fbc9de.glb",
    label: "Abierta",
    fabricMaterials: ["fabric"],
    claspMaterials: ["fabric_clasp"],
    sceneScale: 60,
    orbitMinDistance: 1.5,
    orbitMaxDistance: 5,
    configureMeshMaterial: true,
  },
};
