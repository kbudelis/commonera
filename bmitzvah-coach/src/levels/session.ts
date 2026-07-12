import { CanvasTexture, Vector3 } from 'three/webgpu';
import { ScrubPlayer } from '../audio/scrub';
import { levelCopy } from '../content/copy';
import { toScrollText } from '../content/types';
import { ScrollPointer } from '../interaction/pointer';
import type { EraDef, EraScene } from '../scene/eras/types';
import { POINTERS } from '../scene/pointers';
import { Yad } from '../scene/yad';
import { bakeColumn, type BakedColumn, type BakedWord } from '../text/bake';
import { WordIndex } from '../text/wordIndex';
import { TokenLabels } from '../ui/labels';
import { applyEraTheme, resetEraTheme } from '../ui/theme';
import type { AppShared } from '../appShared';
import type { LevelDef } from './levels';
import { synthesize, type LevelToken } from './synth';

/**
 * One mini level: a single era surface, one pointer, one bake.
 * Touch every counting token to complete. Everything built here is torn
 * down in dispose() — sessions come and go, the AppShared lives on.
 */
export class MiniLevelSession {
  private tokens: LevelToken[] = [];
  private tokenById = new Map<string, LevelToken>();
  private baked!: BakedColumn;
  private era!: EraScene;
  private yad!: Yad;
  private pointer!: ScrollPointer;
  private scrub: ScrubPlayer;
  private labels: TokenLabels | null = null;
  private touched = new Set<string>();
  private playedChunks = new Set<string>();
  private completed = false;
  private frameHook: ((t: number, dt: number) => void) | null = null;
  private onResize = () => this.frameCamera();
  private tmp = new Vector3();
  /** Where the camera would sit with the pointer centered. */
  private camBase = new Vector3();
  /** Pointer in NDC, drifting the camera a few percent — sells the 3D. */
  private parallax = { x: 0, y: 0 };
  private onPointerDrift = (e: PointerEvent) => {
    this.parallax.x = (e.clientX / innerWidth) * 2 - 1;
    this.parallax.y = -((e.clientY / innerHeight) * 2 - 1);
  };
  private onPointerGone = () => {
    this.parallax.x = 0;
    this.parallax.y = 0;
  };
  /** Fills in as words are first touched; era materials tint visited ink. */
  private visitedCanvas = document.createElement('canvas');
  private visitedTexture!: CanvasTexture;

  private markVisited(word: BakedWord) {
    const g = this.visitedCanvas.getContext('2d')!;
    const { width: w, height: h } = this.visitedCanvas;
    const { u0, v0, u1, v1 } = word.uvRect;
    const pad = 0.004;
    g.fillStyle = '#fff';
    g.fillRect(
      (u0 - pad) * w,
      (1 - v1 - pad) * h,
      (u1 - u0 + pad * 2) * w,
      (v1 - v0 + pad * 2) * h,
    );
    this.visitedTexture.needsUpdate = true;
  }

  constructor(
    private shared: AppShared,
    private level: LevelDef,
    private eraDef: EraDef,
    private onComplete: () => void,
  ) {
    this.scrub = new ScrubPlayer(shared.engine, level.audioTrack);
  }

  start() {
    const { shared, level, eraDef } = this;
    const { scene, camera } = shared.ctx;
    const typo = level.typography;

    this.tokens = synthesize(level.content);
    this.tokenById = new Map(this.tokens.map((t) => [t.id, t]));

    const bakeW = shared.bakeSize;
    const bakeH = Math.round(bakeW / eraDef.bake.aspect);
    this.baked = bakeColumn(this.tokens, {
      ...eraDef.bake,
      width: bakeW,
      height: bakeH,
      fontPx: Math.round(bakeW * 0.0635 * (typo.fontScale ?? 1)),
      font: typo.font,
      textOf: typo.script === 'pointed' ? (w) => w.hePointed : toScrollText,
      descentFactor: typo.script === 'pointed' ? 0.45 : undefined,
      hitPadFactor: level.interaction.hitPadFactor,
      debugRects: shared.params.has('debugRects'),
    });

    this.visitedCanvas.width = 512;
    this.visitedCanvas.height = Math.round(512 / eraDef.bake.aspect);
    this.visitedTexture = new CanvasTexture(this.visitedCanvas);

    this.era = eraDef.create({
      inkTexture: this.baked.texture,
      visited: this.visitedTexture,
      pbr: shared.textures,
      quality: { bakeSize: shared.bakeSize },
    });
    scene.add(this.era.group);
    scene.environment = this.era.environment.texture;
    scene.environmentIntensity = this.era.environment.intensity;
    applyEraTheme(eraDef.id, eraDef.theme);

    this.yad = new Yad(POINTERS[eraDef.pointer]());
    scene.add(this.yad.group);

    shared.strip.configure(typo.strip);
    if (typo.labels) {
      this.labels = new TokenLabels(
        shared.ui,
        this.baked.words
          .map((bw) => ({ baked: bw, token: this.tokenById.get(bw.id)! }))
          .filter((e) => e.token && !e.token.line),
        (u, v) => this.era.surface.surfacePoint(u, v),
      );
    }

    this.pointer = new ScrollPointer(
      shared.canvas,
      camera,
      [{ mesh: this.era.surface.mesh, index: new WordIndex(this.baked.words), pid: level.id }],
      // Hover was chaos — words only register while pressing/dragging.
      { requirePress: true },
    );
    this.wirePointer();

    shared.machine.go({ name: 'mini', level: level.index });
    this.frameCamera();
    if (camera.position.lengthSq() < 1e-6) camera.position.copy(shared.camTarget);
    addEventListener('resize', this.onResize);
    shared.canvas.addEventListener('pointermove', this.onPointerDrift);
    shared.canvas.addEventListener('pointerleave', this.onPointerGone);

    this.frameHook = (t, dt) => {
      // Subtle orbit around the device — the pointer steers the eye a few
      // degrees; the shared camera lerp smooths the position and lookAt
      // keeps the device the focal point. This hook runs after the lerp.
      const r = this.camBase.z;
      const yaw = this.parallax.x * 0.1;
      const pitch = this.parallax.y * 0.07;
      shared.camTarget.set(
        r * Math.sin(yaw) * Math.cos(pitch),
        r * Math.sin(pitch),
        r * Math.cos(yaw) * Math.cos(pitch),
      );
      camera.lookAt(0, 0, 0);
      this.yad.update(dt);
      this.era.lighting.update(t);
      this.era.update?.(t, dt);
      const h = this.era.surface.handles;
      h.highlight.update(dt);
      h.trail.update(dt);
      h.aux.update(dt);
      this.labels?.update(camera);
    };
    shared.frameHooks.add(this.frameHook);

    Object.assign(shared.dev, {
      wordScreenPos: (id: string) => {
        const w = this.baked.words.find((b) => b.id === id);
        if (!w) return null;
        return this.screenPos((w.uvRect.u0 + w.uvRect.u1) / 2, (w.uvRect.v0 + w.uvRect.v1) / 2);
      },
      wordIds: () => this.tokens.filter((t) => t.counts).map((t) => t.id),
      touched: () => [...this.touched],
    });
  }

  private screenPos(u: number, v: number) {
    const { camera } = this.shared.ctx;
    const p = this.era.surface.surfacePoint(u, v);
    const ndc = this.tmp.set(p.x, p.y, p.z).project(camera);
    return { x: (ndc.x * 0.5 + 0.5) * innerWidth, y: (-ndc.y * 0.5 + 0.5) * innerHeight };
  }

  private frameCamera() {
    const { width, height } = this.era.fitSize;
    this.camBase.set(0, 0, this.shared.fitDist(width, height));
    this.shared.camTarget.copy(this.camBase);
  }

  private wirePointer() {
    const { machine, strip } = this.shared;
    const active = () => machine.is('mini') && !this.completed;

    this.pointer
      .on('surfacemove', ({ point, uv }) => {
        if (!active()) return;
        this.yad.setTarget(point, this.era.surface.surfaceNormal(uv.u, uv.v));
      })
      .on('surfaceleave', () => {
        this.yad.hide();
        strip.hide();
      })
      .on('wordenter', ({ word }) => {
        if (!active()) return;
        const token = this.tokenById.get(word.id);
        if (!token) return;

        this.era.surface.handles.highlight.show(word.uvRect);
        if (token.audioRef) this.scrub.wordEnter(token.audioRef.wordId);

        const anchor = this.era.surface.surfacePoint(
          (word.uvRect.u0 + word.uvRect.u1) / 2,
          word.uvRect.v0,
        );
        if (token.line) strip.showLine(token.line, anchor);
        else strip.show(token, anchor);

        const first = token.counts && !this.touched.has(token.id);
        if (first) {
          this.touched.add(token.id);
          this.markVisited(word);
          this.labels?.markTouched(token.id);
          if (token.group) this.maybePlayChunk(token.group);
          if (this.tokens.every((t) => !t.counts || this.touched.has(t.id))) this.complete();
        }
      })
      .on('wordhold', ({ word }) => {
        if (!active()) return;
        const token = this.tokenById.get(word.id);
        if (token?.audioRef) this.scrub.wordHold(token.audioRef.wordId);
      })
      .on('wordleave', () => {
        this.scrub.wordLeave();
        this.era.surface.handles.highlight.hide();
      });
  }

  /** First full trace of a phrase chunk: play the whole phrase back. */
  private maybePlayChunk(group: string) {
    if (!this.level.interaction.chunkPlayback || this.playedChunks.has(group)) return;
    const chunk = this.tokens.filter((t) => t.group === group && t.audioRef);
    if (!chunk.every((t) => this.touched.has(t.id))) return;
    this.playedChunks.add(group);
    const { engine } = this.shared;
    const track = this.level.audioTrack;
    const first = engine.wordSlice(track, chunk[0].audioRef!.wordId);
    const last = engine.wordSlice(track, chunk[chunk.length - 1].audioRef!.wordId);
    if (first && last) {
      setTimeout(() => engine.playSegment(track, first.start, last.end), 500);
    }
  }

  private complete() {
    this.completed = true;
    const { screens, strip } = this.shared;
    strip.hide();
    this.yad.hide();
    // A full-surface pulse, then the era's completion card.
    const aux = this.era.surface.handles.aux;
    aux.show({ u0: 0.04, v0: 0.04, u1: 0.96, v1: 0.96 });
    setTimeout(() => aux.hide(), 1400);
    const c = levelCopy[this.level.id];
    setTimeout(() => {
      screens.levelComplete(c.doneKicker, c.doneTitle, c.doneBody, c.doneCta, () =>
        this.onComplete(),
      );
    }, 1100);
  }

  dispose() {
    const { scene } = this.shared.ctx;
    removeEventListener('resize', this.onResize);
    this.shared.canvas.removeEventListener('pointermove', this.onPointerDrift);
    this.shared.canvas.removeEventListener('pointerleave', this.onPointerGone);
    if (this.frameHook) this.shared.frameHooks.delete(this.frameHook);
    this.shared.camTarget.copy(this.camBase);
    // The scroll arc assumes an unrotated camera looking down -z.
    this.shared.ctx.camera.quaternion.set(0, 0, 0, 1);
    this.pointer.dispose();
    this.scrub.stop();
    scene.remove(this.era.group, this.yad.group);
    this.era.dispose();
    this.baked.texture.dispose();
    this.visitedTexture.dispose();
    this.yad.dispose();
    this.labels?.dispose();
    this.shared.strip.hide();
    this.shared.strip.configure({ he: true, translit: true, gloss: true });
    scene.environment = null;
    scene.environmentIntensity = 1;
    resetEraTheme();
  }
}
