import {
  CylinderGeometry,
  Euler,
  Group,
  Mesh,
  MeshStandardNodeMaterial,
  SphereGeometry,
  Vector3,
} from 'three/webgpu';
import type { PointerVisual } from './types';

/** A schoolmaster's wooden pointer with a brass ferrule. */
export function buildWoodPointer(): PointerVisual {
  const group = new Group();
  const wood = new MeshStandardNodeMaterial({ color: '#6b4a2a', roughness: 0.6, metalness: 0.05 });
  const brass = new MeshStandardNodeMaterial({ color: '#a8862a', roughness: 0.35, metalness: 0.7 });

  const shaft = new Mesh(new CylinderGeometry(0.011, 0.0065, 0.26, 20), wood);
  shaft.position.y = 0.155;

  const ferrule = new Mesh(new CylinderGeometry(0.0075, 0.0075, 0.022, 16), brass);
  ferrule.position.y = 0.028;

  const tip = new Mesh(new SphereGeometry(0.008, 16, 12), wood);
  tip.position.y = 0.008;

  group.add(shaft, ferrule, tip);

  return {
    group,
    tipLocal: new Vector3(0, 0, 0),
    restRotation: new Euler(0.55, 0, -0.6),
    hoverHeight: 0.012,
    lean: { gainX: 0.35, gainZ: 0.35 },
    shadow: true,
  };
}
