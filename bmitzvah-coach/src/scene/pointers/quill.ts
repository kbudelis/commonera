import {
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Euler,
  Group,
  Mesh,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  Shape,
  ShapeGeometry,
  Vector3,
} from 'three/webgpu';
import type { PointerVisual } from './types';

function featherShape(): Shape {
  const s = new Shape();
  s.moveTo(0, 0.07);
  s.quadraticCurveTo(0.034, 0.13, 0.024, 0.21);
  s.quadraticCurveTo(0.012, 0.27, 0, 0.29);
  s.quadraticCurveTo(-0.012, 0.27, -0.024, 0.21);
  s.quadraticCurveTo(-0.034, 0.13, 0, 0.07);
  return s;
}

/** A writing quill: pale crossed vanes, thin shaft, iron-dark nib. */
export function buildQuill(): PointerVisual {
  const group = new Group();

  const shaft = new Mesh(
    new CylinderGeometry(0.0035, 0.0055, 0.28, 12),
    new MeshStandardNodeMaterial({ color: '#d8cfb8', roughness: 0.6 }),
  );
  shaft.position.y = 0.15;

  const vaneMat = new MeshBasicNodeMaterial({ color: '#e8dfca', side: DoubleSide });
  const vaneGeo = new ShapeGeometry(featherShape());
  const vaneA = new Mesh(vaneGeo, vaneMat);
  const vaneB = new Mesh(vaneGeo, vaneMat);
  vaneB.rotation.y = Math.PI / 2;

  const nib = new Mesh(
    new ConeGeometry(0.004, 0.03, 10),
    new MeshStandardNodeMaterial({ color: '#241505', roughness: 0.4 }),
  );
  nib.rotation.x = Math.PI; // point down
  nib.position.y = 0.015;

  group.add(shaft, vaneA, vaneB, nib);

  return {
    group,
    tipLocal: new Vector3(0, 0, 0),
    restRotation: new Euler(0.55, 0, -0.6),
    hoverHeight: 0.012,
    lean: { gainX: 0.6, gainZ: 0.6 }, // feathery flutter
    shadow: true,
  };
}
