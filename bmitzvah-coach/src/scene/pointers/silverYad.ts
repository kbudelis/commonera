import {
  BoxGeometry,
  CylinderGeometry,
  Euler,
  Group,
  Mesh,
  MeshStandardNodeMaterial,
  SphereGeometry,
  Vector3,
} from 'three/webgpu';
import type { PointerVisual } from './types';

/** The sterling silver "True Yad" — tapered shaft, collar, cuff, pointing finger. */
export function buildSilverYad(): PointerVisual {
  const group = new Group();
  const silver = new MeshStandardNodeMaterial({
    color: '#c8c4bc',
    metalness: 0.9,
    roughness: 0.25,
  });

  const shaft = new Mesh(new CylinderGeometry(0.008, 0.013, 0.24, 24), silver);
  shaft.position.y = 0.17;

  const collar = new Mesh(new SphereGeometry(0.016, 24, 16), silver);
  collar.position.y = 0.06;

  const cuff = new Mesh(new BoxGeometry(0.022, 0.05, 0.02), silver);
  cuff.position.y = 0.028;

  const finger = new Mesh(new CylinderGeometry(0.005, 0.0035, 0.045, 16), silver);
  finger.position.y = 0.0;

  group.add(shaft, collar, cuff, finger);

  return {
    group,
    tipLocal: new Vector3(0, -0.0225, 0),
    // Rest pose: tilted like a hand holding it from the upper right.
    restRotation: new Euler(0.55, 0, -0.6),
    hoverHeight: 0.012,
    lean: { gainX: 0.35, gainZ: 0.35 },
    shadow: true,
  };
}
