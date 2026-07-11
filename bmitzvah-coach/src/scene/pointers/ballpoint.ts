import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  Group,
  Mesh,
  MeshStandardNodeMaterial,
  Vector3,
} from 'three/webgpu';
import type { PointerVisual } from './types';

/** An office ballpoint: blue barrel, chrome tip, pocket clip. */
export function buildBallpoint(): PointerVisual {
  const group = new Group();
  const blue = new MeshStandardNodeMaterial({ color: '#2b4c8c', roughness: 0.5, metalness: 0.1 });
  const white = new MeshStandardNodeMaterial({ color: '#e8e6e0', roughness: 0.5, metalness: 0.05 });
  const chrome = new MeshStandardNodeMaterial({ color: '#c9ccd2', roughness: 0.2, metalness: 0.85 });

  const barrel = new Mesh(new CylinderGeometry(0.007, 0.0075, 0.16, 16), blue);
  barrel.position.y = 0.105;

  const band = new Mesh(new CylinderGeometry(0.0078, 0.0078, 0.012, 16), white);
  band.position.y = 0.17;

  const tip = new Mesh(new ConeGeometry(0.006, 0.026, 14), chrome);
  tip.rotation.x = Math.PI; // apex down
  tip.position.y = 0.013;

  const clip = new Mesh(new BoxGeometry(0.0035, 0.05, 0.006), chrome);
  clip.position.set(0.009, 0.155, 0);

  group.add(barrel, band, tip, clip);

  return {
    group,
    tipLocal: new Vector3(0, 0, 0),
    restRotation: new Euler(0.55, 0, -0.6),
    hoverHeight: 0.01,
    lean: { gainX: 0.5, gainZ: 0.5 }, // a pen wags
    shadow: true,
  };
}
