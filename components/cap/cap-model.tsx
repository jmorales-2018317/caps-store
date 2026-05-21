"use client";

import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useMemo } from "react";
import type { Object3D } from "three";
import { CAP_MODEL_CONFIGS, type CapModelType } from "@/lib/cap-colors";
import { CapLogoDecal } from "@/components/cap/cap-logo-decal";
import {
  applyCapColors,
  cloneCapScene,
  configureAbiertaMeshMaterial,
  splitAbiertaClaspGeometry,
} from "@/lib/cap-materials";

Object.values(CAP_MODEL_CONFIGS).forEach((cfg) => useGLTF.preload(cfg.path));

type CapModelProps = {
  modelType: CapModelType;
  fabricColor: string;
  buttonColor: string;
  logoUrl: string | null;
  logoScale: number;
};

function CapModelInner({
  modelType,
  fabricColor,
  buttonColor,
  logoUrl,
  logoScale,
}: CapModelProps) {
  const config = CAP_MODEL_CONFIGS[modelType];
  const { scene } = useGLTF(config.path);

  const model = useMemo(() => {
    const clone = cloneCapScene(scene);
    if (config.configureMeshMaterial) {
      splitAbiertaClaspGeometry(clone);
      configureAbiertaMeshMaterial(clone);
    }
    return clone;
  }, [scene, config.configureMeshMaterial]);

  useLayoutEffect(() => {
    applyCapColors(model, {
      fabricHex: fabricColor,
      buttonHex: buttonColor,
      fabricMaterialNames: config.fabricMaterials,
      claspMaterialNames: config.claspMaterials,
      meshFabricTint: config.configureMeshMaterial,
    });
  }, [model, fabricColor, buttonColor, config]);

  return (
    <group scale={config.sceneScale}>
      <primitive object={model} />
      <CapLogoDecal
        model={model as Object3D}
        modelType={modelType}
        logoUrl={logoUrl}
        logoScale={logoScale}
        fabricMaterialNames={config.fabricMaterials}
      />
    </group>
  );
}

export function CapModel(props: CapModelProps) {
  return <CapModelInner key={props.modelType} {...props} />;
}
