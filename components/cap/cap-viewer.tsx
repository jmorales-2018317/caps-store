"use client";

import { Canvas } from "@react-three/fiber";
import {
  Bounds,
  ContactShadows,
  Environment,
  OrbitControls,
  PerspectiveCamera,
  useProgress,
} from "@react-three/drei";
import { Loader2 } from "lucide-react";
import { Suspense, useEffect, useRef } from "react";
import { CapModel } from "@/components/cap/cap-model";
import { CAP_MODEL_CONFIGS, type CapModelType } from "@/lib/cap-colors";

function CapViewerLoadingOverlay() {
  const { active, progress } = useProgress();
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    if (!active) hasLoadedOnce.current = true;
  }, [active]);

  const show = active || !hasLoadedOnce.current;
  if (!show) return null;

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-surface/90 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Cargando modelo 3D"
    >
      <Loader2 className="size-8 animate-spin text-muted" aria-hidden />
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
        Cargando modelo 3D
      </p>
      {progress > 0 && progress < 100 ? (
        <div
          className="h-0.5 w-28 overflow-hidden bg-border"
          aria-hidden
        >
          <div
            className="h-full bg-primary transition-[width] duration-200 ease-out"
            style={{ width: `${Math.round(progress)}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

type CapViewerProps = {
  modelType: CapModelType;
  fabricColor: string;
  buttonColor: string;
  logoUrl: string | null;
  logoScale: number;
};

function Scene({
  modelType,
  fabricColor,
  buttonColor,
  logoUrl,
  logoScale,
}: CapViewerProps) {
  const { orbitMinDistance, orbitMaxDistance } = CAP_MODEL_CONFIGS[modelType];

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={42} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} />
      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.15} maxDuration={0.5}>
          <CapModel
            modelType={modelType}
            fabricColor={fabricColor}
            buttonColor={buttonColor}
            logoUrl={logoUrl}
            logoScale={logoScale}
          />
        </Bounds>
        <Environment preset="studio" />
      </Suspense>
      <ContactShadows
        position={[0, -0.55, 0]}
        opacity={0.35}
        scale={12}
        blur={2.5}
        far={1.2}
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={orbitMinDistance}
        maxDistance={orbitMaxDistance}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.8}
        target={[0, 0, 0]}
      />
    </>
  );
}

export function CapViewer({
  modelType,
  fabricColor,
  buttonColor,
  logoUrl,
  logoScale,
}: CapViewerProps) {
  return (
    <div className="relative h-full w-full">
      <CapViewerLoadingOverlay />
      <Canvas
        className="h-full w-full touch-none"
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene
          modelType={modelType}
          fabricColor={fabricColor}
          buttonColor={buttonColor}
          logoUrl={logoUrl}
          logoScale={logoScale}
        />
      </Canvas>
    </div>
  );
}
