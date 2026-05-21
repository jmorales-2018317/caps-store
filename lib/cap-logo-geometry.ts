import { PlaneGeometry } from "three";
import { CAP_LOGO_CROWN_BEND } from "@/lib/cap-logo";

export function createCurvedLogoGeometry(
  width: number,
  height: number,
) {
  const { widthSegments, heightSegments, power, amountFactor } =
    CAP_LOGO_CROWN_BEND;

  const geometry = new PlaneGeometry(
    width,
    height,
    widthSegments,
    heightSegments
  );
  const position = geometry.attributes.position;
  const bendAmount = height * amountFactor;

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);

    const v = (y + height / 2) / height;
    const t = Math.pow(Math.max(0, Math.min(1, v)), power);
    const curve = bendAmount * t;

    position.setXYZ(i, x, y, z - curve);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();

  return geometry;
}
