import {
  CanvasTexture,
  Euler,
  Group,
  Mesh,
  MeshBasicNodeMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  Vector3,
} from 'three/webgpu';
import type { PointerVisual } from './types';

/** Soft radial dot + ring, like a touch-point indicator. */
function touchTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 2, 64, 64, 34);
  grad.addColorStop(0, 'rgba(45, 108, 223, 0.55)');
  grad.addColorStop(0.7, 'rgba(45, 108, 223, 0.28)');
  grad.addColorStop(1, 'rgba(45, 108, 223, 0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = 'rgba(45, 108, 223, 0.5)';
  g.lineWidth = 3;
  g.beginPath();
  g.arc(64, 64, 46, 0, Math.PI * 2);
  g.stroke();
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** The tablet's pointer: a gently pulsing radial touch cursor. */
export function buildTouchCursor(): PointerVisual {
  const group = new Group();
  const dot = new Mesh(
    new PlaneGeometry(0.085, 0.085),
    new MeshBasicNodeMaterial({ map: touchTexture(), transparent: true, depthWrite: false }),
  );
  group.add(dot);

  return {
    group,
    tipLocal: new Vector3(0, 0, 0),
    restRotation: new Euler(0, 0, 0), // flat on the glass
    hoverHeight: 0.004,
    lean: false,
    shadow: false,
    update({ t }) {
      const pulse = 1 + 0.1 * Math.sin(t * 3.2);
      dot.scale.setScalar(pulse);
    },
  };
}
