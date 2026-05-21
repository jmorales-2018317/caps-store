"use client";

import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef, useState } from "react";
import {
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  type Object3D,
} from "three";
import type { CapModelType } from "@/lib/cap-colors";
import { createCurvedLogoGeometry } from "@/lib/cap-logo-geometry";
import { computeCrownLogoPlacement } from "@/lib/cap-logo-placement";
import { getCapLogoPlacementProfile } from "@/lib/cap-logo";

function findClothMesh(
  root: Object3D,
  fabricMaterialNames: readonly string[],
  clothMeshName: string
): Mesh | null {
  const fabricSet = new Set(fabricMaterialNames);
  let cloth: Mesh | null = null;
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh || cloth) return;

    if (mesh.name === clothMeshName) {
      cloth = mesh;
      return;
    }

    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    if (materials.some((m) => fabricSet.has(m.name))) {
      cloth = mesh;
    }
  });
  return cloth;
}

function disposeLogoPlane(plane: Mesh | null) {
  if (!plane) return;
  plane.geometry.dispose();
  const material = plane.material;
  if (Array.isArray(material)) {
    material.forEach((m) => m.dispose());
  } else {
    material.dispose();
  }
}

function planeSizeForTexture(
  placementWidth: number,
  placementHeight: number,
  texture: Texture
) {
  const image = texture.image as
    | { width?: number; height?: number }
    | undefined;
  const iw = image?.width ?? 1;
  const ih = image?.height ?? 1;
  const aspect = iw / ih;

  let width = placementWidth;
  let height = placementHeight;

  if (width / height > aspect) {
    width = height * aspect;
  } else {
    height = width / aspect;
  }

  return { width, height };
}

type CapLogoDecalProps = {
  model: Object3D;
  modelType: CapModelType;
  logoUrl: string | null;
  logoScale: number;
  fabricMaterialNames: readonly string[];
};

/**
 * Plano con el logo en el panel frontal vertical de la corona (no en la visera).
 */
export function CapLogoDecal({
  model,
  modelType,
  logoUrl,
  logoScale,
  fabricMaterialNames,
}: CapLogoDecalProps) {
  const { invalidate } = useThree();
  const planeRef = useRef<Mesh | null>(null);
  const [texture, setTexture] = useState<Texture | null>(null);
  const placementProfile = getCapLogoPlacementProfile(modelType);

  useLayoutEffect(() => {
    if (!logoUrl) {
      setTexture((prev) => {
        prev?.dispose();
        return null;
      });
      return;
    }

    let cancelled = false;
    const loader = new TextureLoader();

    loader.load(
      logoUrl,
      (loaded) => {
        if (cancelled) {
          loaded.dispose();
          return;
        }
        loaded.colorSpace = SRGBColorSpace;
        loaded.anisotropy = 4;
        loaded.premultiplyAlpha = true;
        setTexture((prev) => {
          prev?.dispose();
          return loaded;
        });
      },
      undefined,
      () => {
        if (!cancelled) setTexture(null);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [logoUrl]);

  useLayoutEffect(() => {
    const cloth = findClothMesh(
      model,
      fabricMaterialNames,
      placementProfile.clothMeshName
    );

    const removePlane = () => {
      if (planeRef.current && cloth) {
        cloth.remove(planeRef.current);
        disposeLogoPlane(planeRef.current);
        planeRef.current = null;
        invalidate();
      }
    };

    if (!cloth || !logoUrl || !texture) {
      removePlane();
      return removePlane;
    }

    const placement = computeCrownLogoPlacement(cloth, logoScale, modelType);
    const { width, height } = planeSizeForTexture(
      placement.width,
      placement.height,
      texture
    );

    removePlane();

    const material = new MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.06,
      depthWrite: false,
      depthTest: true,
      toneMapped: false,
      side: DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -12,
    });

    const plane = new Mesh(
      createCurvedLogoGeometry(width, height),
      material
    );
    plane.position.copy(placement.position);
    plane.quaternion.copy(placement.quaternion);
    plane.renderOrder = 50;

    cloth.add(plane);
    planeRef.current = plane;
    invalidate();

    return removePlane;
  }, [
    model,
    modelType,
    logoUrl,
    logoScale,
    texture,
    invalidate,
    fabricMaterialNames,
    placementProfile.clothMeshName,
  ]);

  return null;
}
