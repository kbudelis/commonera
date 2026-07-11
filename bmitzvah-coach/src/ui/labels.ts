import type { Camera } from 'three/webgpu';
import { Vector3 } from 'three/webgpu';
import type { BakedWord } from '../text/bake';
import type { LevelToken } from '../levels/synth';

interface Entry {
  baked: BakedWord;
  token: LevelToken;
  el: HTMLDivElement;
}

/**
 * Persistent DOM labels under every token — letter names on the tablet,
 * transliteration on the laptop. Reprojected each frame like the learner
 * strip; touched tokens get a check and dim out.
 */
export class TokenLabels {
  private container: HTMLDivElement;
  private entries: Entry[];
  private tmp = new Vector3();

  constructor(
    root: HTMLElement,
    entries: { baked: BakedWord; token: LevelToken }[],
    private anchor: (u: number, v: number) => { x: number; y: number; z: number },
  ) {
    this.container = document.createElement('div');
    this.container.id = 'token-labels';
    this.container.innerHTML = `<style>
      #token-labels { position: fixed; inset: 0; pointer-events: none; z-index: 4; }
      #token-labels .tok { position: absolute; left: 0; top: 0; transform: translate(-50%, 10px);
        text-align: center; font-family: Rubik, system-ui; white-space: nowrap;
        transition: opacity 0.4s ease; }
      #token-labels .tok .main { display: block; font-weight: 600; font-size: 14px;
        color: var(--accent); letter-spacing: 0.02em; }
      #token-labels .tok.touched { opacity: 0.45; }
      #token-labels .tok.touched .main::after { content: ' ✓'; }
    </style>`;
    this.entries = entries.map(({ baked, token }) => {
      const el = document.createElement('div');
      el.className = 'tok';
      el.innerHTML = `<span class="main"></span>`;
      el.querySelector('.main')!.textContent = token.translit;
      this.container.appendChild(el);
      return { baked, token, el };
    });
    root.appendChild(this.container);
  }

  markTouched(id: string) {
    this.entries.find((e) => e.token.id === id)?.el.classList.add('touched');
  }

  /** Re-project every label under its token's ink rect. */
  update(camera: Camera) {
    for (const { baked, el } of this.entries) {
      const p = this.anchor((baked.uvRect.u0 + baked.uvRect.u1) / 2, baked.uvRect.v0);
      const ndc = this.tmp.set(p.x, p.y, p.z).project(camera);
      const x = (ndc.x * 0.5 + 0.5) * innerWidth;
      const y = (-ndc.y * 0.5 + 0.5) * innerHeight;
      el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(-50%, 10px)`;
    }
  }

  dispose() {
    this.container.remove();
  }
}
