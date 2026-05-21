import {
  CAP_FABRIC_MATERIALS,
  CAP_MODEL_CONFIGS,
  type CapModelType,
} from "@/lib/cap-colors";

/** Nodo principal de tela (corona / paneles frontales) en el GLTF cerrado */
export const CAP_CLOTH_MESH_NAME = "Cloth";

/** Mesh de tela en el GLB abierto (maya) */
export const CAP_ABIERTA_CLOTH_MESH_NAME = "linen_mesh_cap";

export { CAP_FABRIC_MATERIALS };

export const CAP_LOGO_ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml";
export const CAP_LOGO_MAX_BYTES = 5 * 1024 * 1024;

/** Extremos del slider de tamaño (equivalente a pequeño y grande) */
export const CAP_LOGO_SCALE_MIN = 0.5;
export const CAP_LOGO_SCALE_MAX = 0.9;
export const CAP_LOGO_SCALE_DEFAULT =
  CAP_LOGO_SCALE_MIN + (CAP_LOGO_SCALE_MAX - CAP_LOGO_SCALE_MIN) * 0.5;

const CAP_LOGO_SCALE_SPAN = CAP_LOGO_SCALE_MAX - CAP_LOGO_SCALE_MIN;

/** 0 en mínimo del slider → 1 en máximo */
export function normalizeLogoScale(scaleFactor: number): number {
  const t = (scaleFactor - CAP_LOGO_SCALE_MIN) / CAP_LOGO_SCALE_SPAN;
  return Math.max(0, Math.min(1, t));
}

export type CapLogoFrontCrownFilters = {
  minY: number;
  minZ: number;
  maxZ: number;
  minNormalZ: number;
  maxAbsNormalY: number;
  maxAbsNormalX: number;
};

export type CapLogoRelaxedFilters = {
  minY: number;
  minZ: number;
  maxZ: number;
  minNormalZ: number;
  maxAbsNormalY: number;
  nyMin: number;
};

export type CapLogoSurfaceOutset = {
  minAtSmall: number;
  minAtLarge: number;
  byPanelDepth: number;
};

export type CapLogoPlacementProfile = {
  clothMeshName: string;
  frontCrownFilters: CapLogoFrontCrownFilters;
  relaxedFilters: CapLogoRelaxedFilters;
  fallback: {
    position: readonly [number, number, number];
    width: number;
    height: number;
  };
  minPlaneWidth: number;
  minPlaneHeight: number;
  widthFactor: number;
  heightFactor: number;
  /** Escala final del plano del logo (p. ej. compensar mesh local vs cerrada) */
  planeSizeMultiplier: number;
  /** 0 = borde inferior del panel, 1 = superior */
  panelYRatio: number;
  /** Desplazamiento extra en Y local del mesh (subir logo) */
  positionYOffset: number;
  /** Un solo tamaño base (el panel abierto es muy bajo en Y) */
  uniformPlaneScale: boolean;
  surfaceOutset: CapLogoSurfaceOutset;
};

/** Tamaños del plano del logo en coords locales del mesh (referencia: gorra cerrada) */
const CERRADA_LOGO_PLANE = {
  minWidth: 1.2,
  minHeight: 1.2,
  fallbackWidth: 4.2,
  fallbackHeight: 4.6,
  widthFactor: 0.48,
  heightFactor: 0.44,
} as const;

function cerradaLogoSizeToMeshLocal(
  cerradaSize: number,
  modelType: CapModelType
): number {
  const sceneScale = CAP_MODEL_CONFIGS[modelType].sceneScale;
  const cerradaSceneScale = CAP_MODEL_CONFIGS.tela.sceneScale;
  return cerradaSize * (cerradaSceneScale / sceneScale);
}

/** Ancla vertical del centro del logo en el panel (0 = abajo, 1 = arriba) */
export const CAP_LOGO_PANEL_Y_RATIO = 0.26;

/** Gorra cerrada (GLTF): coords ~0–200, frente +Z */
const CERRADA_LOGO_PROFILE: CapLogoPlacementProfile = {
  clothMeshName: CAP_CLOTH_MESH_NAME,
  frontCrownFilters: {
    minY: 176.5,
    minZ: 2.5,
    maxZ: 11.5,
    minNormalZ: 0.72,
    maxAbsNormalY: 0.22,
    maxAbsNormalX: 0.4,
  },
  relaxedFilters: {
    minY: 176,
    minZ: 2,
    maxZ: 12,
    minNormalZ: 0.55,
    maxAbsNormalY: 0.35,
    nyMin: -0.12,
  },
  fallback: {
    position: [0.2, 179, 7.2],
    width: CERRADA_LOGO_PLANE.fallbackWidth,
    height: CERRADA_LOGO_PLANE.fallbackHeight,
  },
  minPlaneWidth: CERRADA_LOGO_PLANE.minWidth,
  minPlaneHeight: CERRADA_LOGO_PLANE.minHeight,
  widthFactor: CERRADA_LOGO_PLANE.widthFactor,
  heightFactor: CERRADA_LOGO_PLANE.heightFactor,
  planeSizeMultiplier: 1,
  panelYRatio: CAP_LOGO_PANEL_Y_RATIO,
  positionYOffset: 0,
  uniformPlaneScale: false,
  surfaceOutset: {
    minAtSmall: 2.15,
    minAtLarge: 2.25,
    byPanelDepth: 0.14,
  },
};

/** Gorra abierta (GLB): coords ~0–0.15, frente +Z hacia cámara */
const ABIERTA_LOGO_PROFILE: CapLogoPlacementProfile = {
  clothMeshName: CAP_ABIERTA_CLOTH_MESH_NAME,
  frontCrownFilters: {
    minY: 0.052,
    minZ: 0.038,
    maxZ: 0.066,
    minNormalZ: 0.55,
    maxAbsNormalY: 0.28,
    maxAbsNormalX: 0.38,
  },
  relaxedFilters: {
    minY: 0.045,
    minZ: 0.03,
    maxZ: 0.075,
    minNormalZ: 0.5,
    maxAbsNormalY: 0.35,
    nyMin: -0.12,
  },
  fallback: {
    position: [0, 0.059, 0.06],
    width: cerradaLogoSizeToMeshLocal(CERRADA_LOGO_PLANE.fallbackWidth, "maya"),
    height: cerradaLogoSizeToMeshLocal(
      CERRADA_LOGO_PLANE.fallbackHeight,
      "maya"
    ),
  },
  minPlaneWidth: cerradaLogoSizeToMeshLocal(CERRADA_LOGO_PLANE.minWidth, "maya"),
  minPlaneHeight: cerradaLogoSizeToMeshLocal(
    CERRADA_LOGO_PLANE.minHeight,
    "maya"
  ),
  widthFactor: CERRADA_LOGO_PLANE.widthFactor * 2.5,
  heightFactor: CERRADA_LOGO_PLANE.heightFactor * 2.5,
  planeSizeMultiplier: 0.7,
  panelYRatio: 0.55,
  positionYOffset: 0.01,
  uniformPlaneScale: true,
  surfaceOutset: {
    minAtSmall: 0.0018,
    minAtLarge: 0.0024,
    byPanelDepth: 0.14,
  },
};

export const CAP_LOGO_PLACEMENT_PROFILES: Record<
  CapModelType,
  CapLogoPlacementProfile
> = {
  tela: CERRADA_LOGO_PROFILE,
  maya: ABIERTA_LOGO_PROFILE,
};

export function getCapLogoPlacementProfile(
  modelType: CapModelType
): CapLogoPlacementProfile {
  return CAP_LOGO_PLACEMENT_PROFILES[modelType];
}

export function getCapLogoSurfaceOutsetMin(
  scaleFactor: number,
  profile: CapLogoPlacementProfile
): number {
  const t = normalizeLogoScale(scaleFactor);
  const { minAtSmall, minAtLarge } = profile.surfaceOutset;
  return minAtSmall + (minAtLarge - minAtSmall) * t;
}

/** Curvatura superior del logo */
export const CAP_LOGO_CROWN_BEND = {
  amountFactor: 0.18,
  widthSegments: 28,
  heightSegments: 36,
  power: 2.2,
} as const;
