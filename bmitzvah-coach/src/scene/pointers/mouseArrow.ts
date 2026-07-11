import {
  Euler,
  Group,
  Mesh,
  MeshBasicNodeMaterial,
  Shape,
  ShapeGeometry,
  Vector3,
} from 'three/webgpu';
import type { PointerVisual } from './types';

/** The classic white mouse arrow, black-outlined, gliding flat on the screen. */
export function buildMouseArrow(): PointerVisual {
  const group = new Group();

  // Classic cursor outline, tip at (0,0), pointing up-left, y-down converted to y-up.
  const pts: [number, number][] = [
    [0, 0],
    [0, -0.052],
    [0.0125, -0.041],
    [0.0205, -0.058],
    [0.0275, -0.055],
    [0.0195, -0.038],
    [0.0355, -0.037],
  ];
  const makeShape = (scale: number) => {
    const s = new Shape();
    pts.forEach(([x, y], i) => (i === 0 ? s.moveTo(x * scale, y * scale) : s.lineTo(x * scale, y * scale)));
    s.closePath();
    return s;
  };

  const outline = new Mesh(
    new ShapeGeometry(makeShape(1.22)),
    new MeshBasicNodeMaterial({ color: '#1c1c22' }),
  );
  outline.position.set(-0.0018, 0.0018, 0);
  const fill = new Mesh(
    new ShapeGeometry(makeShape(1)),
    new MeshBasicNodeMaterial({ color: '#f5f5f2' }),
  );
  fill.position.z = 0.0006;
  group.add(outline, fill);

  return {
    group,
    tipLocal: new Vector3(0, 0, 0),
    restRotation: new Euler(0, 0, 0), // flat in the screen plane
    hoverHeight: 0.004,
    lean: false,
    shadow: false,
  };
}
