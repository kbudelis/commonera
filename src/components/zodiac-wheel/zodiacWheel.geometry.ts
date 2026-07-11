export const WHEEL_SIZE = 720;
export const CENTER = WHEEL_SIZE / 2;
export const SECTOR_ANGLE = 360 / 12;

export type Direction = 1 | -1;

export function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

export function wrapIndex(index: number) {
  return ((index % 12) + 12) % 12;
}

export function sectorAngle(index: number) {
  return wrapIndex(index) * SECTOR_ANGLE;
}

export function polar(radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: CENTER + Math.sin(radians) * radius,
    y: CENTER - Math.cos(radians) * radius
  };
}

export function planSettledAngle(
  current: number,
  targetIndex: number,
  turns: number,
  direction: Direction
) {
  const target = normalizeAngle(-sectorAngle(targetIndex));
  const currentNormalized = normalizeAngle(current);

  if (direction === 1) {
    const distance = normalizeAngle(target - currentNormalized);
    return current + distance + turns * 360;
  }

  const distance = normalizeAngle(currentNormalized - target);
  return current - distance - turns * 360;
}
