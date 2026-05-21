import {
  Box3,
  Quaternion,
  Vector3,
  type Mesh,
} from "three";
import type { CapModelType } from "@/lib/cap-colors";
import {
  getCapLogoPlacementProfile,
  getCapLogoSurfaceOutsetMin,
  type CapLogoPlacementProfile,
} from "@/lib/cap-logo";

const _box = new Box3();
const _center = new Vector3();
const _size = new Vector3();
const _vertex = new Vector3();
const _normal = new Vector3();
const _normalSum = new Vector3();
const _defaultNormal = new Vector3(0, 0, 1);
const _quat = new Quaternion();

export type CrownLogoPlacement = {
  position: Vector3;
  quaternion: Quaternion;
  width: number;
  height: number;
};

type PanelSample = { position: Vector3; normal: Vector3 };

function collectFrontCrownPanelSamples(
  mesh: Mesh,
  profile: CapLogoPlacementProfile
): PanelSample[] {
  const geometry = mesh.geometry;
  const positionAttr = geometry.attributes.position;
  const normalAttr = geometry.attributes.normal;
  if (!positionAttr || !normalAttr) return [];

  const F = profile.frontCrownFilters;
  const samples: PanelSample[] = [];

  for (let i = 0; i < positionAttr.count; i++) {
    _vertex.set(
      positionAttr.getX(i),
      positionAttr.getY(i),
      positionAttr.getZ(i)
    );
    _normal.set(
      normalAttr.getX(i),
      normalAttr.getY(i),
      normalAttr.getZ(i)
    );
    if (_normal.lengthSq() === 0) continue;
    _normal.normalize();

    const { x, y, z } = _vertex;
    const { x: nx, y: ny, z: nz } = _normal;

    if (y < F.minY) continue;
    if (z < F.minZ || z > F.maxZ) continue;
    if (nz < F.minNormalZ) continue;
    if (Math.abs(ny) > F.maxAbsNormalY) continue;
    if (Math.abs(nx) > F.maxAbsNormalX) continue;
    if (ny < -0.08) continue;

    samples.push({
      position: _vertex.clone(),
      normal: _normal.clone(),
    });
  }

  return samples;
}

function collectFrontCrownPanelSamplesRelaxed(
  mesh: Mesh,
  profile: CapLogoPlacementProfile
): PanelSample[] {
  const geometry = mesh.geometry;
  const positionAttr = geometry.attributes.position;
  const normalAttr = geometry.attributes.normal;
  if (!positionAttr || !normalAttr) return [];

  const R = profile.relaxedFilters;
  const samples: PanelSample[] = [];

  for (let i = 0; i < positionAttr.count; i++) {
    _vertex.set(
      positionAttr.getX(i),
      positionAttr.getY(i),
      positionAttr.getZ(i)
    );
    _normal.set(
      normalAttr.getX(i),
      normalAttr.getY(i),
      normalAttr.getZ(i)
    );
    if (_normal.lengthSq() === 0) continue;
    _normal.normalize();

    const { y, z } = _vertex;
    const { y: ny, z: nz } = _normal;

    if (y < R.minY) continue;
    if (z < R.minZ || z > R.maxZ) continue;
    if (nz < R.minNormalZ) continue;
    if (Math.abs(ny) > R.maxAbsNormalY) continue;
    if (ny < R.nyMin) continue;

    samples.push({
      position: _vertex.clone(),
      normal: _normal.clone(),
    });
  }

  return samples;
}

function computeLogoPlaneSize(
  panelSize: Vector3,
  scaleFactor: number,
  profile: CapLogoPlacementProfile
): { width: number; height: number } {
  const baseWidth = Math.max(
    panelSize.x * profile.widthFactor,
    profile.minPlaneWidth
  );
  const baseHeight = Math.max(
    panelSize.y * profile.heightFactor,
    profile.minPlaneHeight
  );

  let width: number;
  let height: number;

  if (profile.uniformPlaneScale) {
    const base = Math.max(baseWidth, baseHeight);
    width = base;
    height =
      base *
      (profile.fallback.height / profile.fallback.width);
  } else {
    width = baseWidth;
    height = baseHeight;
  }

  width *= scaleFactor * profile.planeSizeMultiplier;
  height *= scaleFactor * profile.planeSizeMultiplier;

  return { width, height };
}

function placementFromSamples(
  samples: PanelSample[],
  scaleFactor: number,
  profile: CapLogoPlacementProfile
): CrownLogoPlacement {
  _box.makeEmpty();
  _normalSum.set(0, 0, 0);

  for (const sample of samples) {
    _box.expandByPoint(sample.position);
    _normalSum.add(sample.normal);
  }

  _box.getCenter(_center);
  _box.getSize(_size);
  _normalSum.normalize();

  _quat.setFromUnitVectors(_defaultNormal, _normalSum);

  const { width, height } = computeLogoPlaneSize(_size, scaleFactor, profile);

  const anchorY = _box.min.y + _size.y * profile.panelYRatio;
  const position = new Vector3(
    _center.x,
    anchorY + profile.positionYOffset,
    _center.z
  );

  const outset = Math.max(
    _size.z * profile.surfaceOutset.byPanelDepth,
    getCapLogoSurfaceOutsetMin(scaleFactor, profile)
  );
  position.addScaledVector(_normalSum, outset);

  return {
    position,
    quaternion: _quat.clone(),
    width,
    height,
  };
}

export function computeCrownLogoPlacement(
  mesh: Mesh,
  scaleFactor: number,
  modelType: CapModelType
): CrownLogoPlacement {
  const profile = getCapLogoPlacementProfile(modelType);
  const samples = collectFrontCrownPanelSamples(mesh, profile);

  if (samples.length >= 12) {
    return placementFromSamples(samples, scaleFactor, profile);
  }

  const relaxed = collectFrontCrownPanelSamplesRelaxed(mesh, profile);
  if (relaxed.length >= 8) {
    return placementFromSamples(relaxed, scaleFactor, profile);
  }

  const fb = profile.fallback;
  _quat.identity();
  const width = fb.width * scaleFactor * profile.planeSizeMultiplier;
  const height = fb.height * scaleFactor * profile.planeSizeMultiplier;
  const position = new Vector3(...fb.position);
  position.y += profile.positionYOffset;
  position.z += getCapLogoSurfaceOutsetMin(scaleFactor, profile);
  return {
    position,
    quaternion: _quat.clone(),
    width,
    height,
  };
}
