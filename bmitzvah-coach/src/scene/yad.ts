import {
  CanvasTexture,
  Group,
  Material,
  Mesh,
  MeshBasicNodeMaterial,
  PlaneGeometry,
  Vector3,
} from 'three/webgpu';
import { buildSilverYad } from './pointers/silverYad';
import type { PointerVisual } from './pointers/types';

/**
 * The pointer that follows the finger/mouse with a hand-held feel:
 * frame-rate-independent damped lag plus a lean into its velocity.
 * The LOOK is a swappable PointerVisual (silver yad, fingertip, mouse
 * arrow, quill…); the feel lives here and is shared by every era.
 */
export class Yad {
  readonly group = new Group();
  private target = new Vector3();
  private velocity = new Vector3();
  private prev = new Vector3();
  private shadow: Mesh | null = null;
  private t = 0;
  visible = false;

  constructor(private visual: PointerVisual = buildSilverYad()) {
    this.group.add(visual.group);

    if (visual.shadow) {
      // Fake contact shadow: radial-gradient sprite hugging the surface.
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const g = c.getContext('2d')!;
      const grad = g.createRadialGradient(64, 64, 4, 64, 64, 62);
      grad.addColorStop(0, 'rgba(30,15,5,0.4)');
      grad.addColorStop(1, 'rgba(30,15,5,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
      this.shadow = new Mesh(
        new PlaneGeometry(0.09, 0.09),
        new MeshBasicNodeMaterial({ map: new CanvasTexture(c), transparent: true, depthWrite: false }),
      );
      this.group.add(this.shadow);
    }

    this.group.rotation.copy(visual.restRotation);
    this.group.visible = false;
  }

  /** Point the visual's tip at a world position (surface point + hover height). */
  setTarget(point: { x: number; y: number; z: number }, normal?: { x: number; y: number; z: number }) {
    const hover = this.visual.hoverHeight;
    this.target.set(
      point.x + (normal?.x ?? 0) * hover,
      point.y + (normal?.y ?? 0) * hover,
      point.z + (normal?.z ?? 1) * hover,
    );
    if (!this.visible) {
      this.tipPos.copy(this.target);
      this.prev.copy(this.target);
      this.visible = true;
      this.group.visible = true;
    }
  }

  hide() {
    this.visible = false;
    this.group.visible = false;
  }

  private tipPos = new Vector3();

  update(dt: number) {
    this.t += dt;
    if (!this.visible) return;
    const k = 1 - Math.exp(-dt * 9);
    this.tipPos.lerp(this.target, k);

    this.velocity.copy(this.tipPos).sub(this.prev).divideScalar(Math.max(dt, 1e-4));
    this.prev.copy(this.tipPos);

    // Lean into travel direction; settle back to rest pose.
    const rest = this.visual.restRotation;
    if (this.visual.lean) {
      const { gainX, gainZ } = this.visual.lean;
      const leanX = Math.max(-0.25, Math.min(0.25, -this.velocity.y * gainX));
      const leanZ = Math.max(-0.3, Math.min(0.3, -this.velocity.x * gainZ));
      this.group.rotation.x = rest.x + leanX;
      this.group.rotation.z = rest.z + leanZ;
    }

    // Anchor the visual's TIP (not the group origin) to the smoothed target.
    const tipOffset = this.visual.tipLocal.clone().applyEuler(this.group.rotation);
    this.group.position.copy(this.tipPos).sub(tipOffset);

    if (this.shadow) {
      // Shadow hugs the surface just below the tip, counter-rotated to lie flat.
      this.shadow.position.copy(this.visual.tipLocal).add(new Vector3(0, -0.002, -0.004));
      this.shadow.rotation.set(-this.group.rotation.x, 0, -this.group.rotation.z);
    }

    this.visual.update?.({ t: this.t, dt });
  }

  /** Free GPU resources — sessions own their Yad and drop it on teardown. */
  dispose() {
    this.group.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.geometry.dispose();
        const mats: Material[] = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const m of mats) {
          if ('map' in m && m.map instanceof CanvasTexture) m.map.dispose();
          m.dispose();
        }
      }
    });
  }
}
