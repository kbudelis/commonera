import {
  BoxGeometry,
  Euler,
  Group,
  Mesh,
  MeshBasicNodeMaterial,
  Vector3,
} from 'three/webgpu';
import type { PointerVisual } from './types';

/** A blinking phosphor block cursor, gliding flat on the glass. */
export function buildBlockCursor(): PointerVisual {
  const group = new Group();
  const block = new Mesh(
    new BoxGeometry(0.03, 0.052, 0.004),
    new MeshBasicNodeMaterial({ color: '#39ff6a', transparent: true, opacity: 0.85 }),
  );
  group.add(block);

  return {
    group,
    tipLocal: new Vector3(0, 0, 0),
    restRotation: new Euler(0, 0, 0),
    hoverHeight: 0.004,
    lean: false,
    shadow: false,
    update({ t }) {
      block.visible = Math.sin(t * 6) > -0.4;
    },
  };
}
