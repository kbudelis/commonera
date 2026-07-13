import { levelCopy } from '../content/copy';
import { resolveEra } from '../scene/eras';
import type { AppShared } from '../appShared';
import { LEVELS, levelByIndex, type LevelDef } from './levels';
import { MiniLevelSession } from './session';

/**
 * Drives the journey: timeline map → level intro → session → back to the map.
 * Level 7 hands off to the untouched scroll arc (built lazily, once); leaving
 * it goes through a full page reload — the one boundary where in-page
 * teardown isn't worth the risk.
 */
export class LevelController {
  private session: MiniLevelSession | null = null;
  private arc: { begin(): void } | null = null;

  constructor(
    private shared: AppShared,
    private startScroll: () => { begin(): void },
  ) {}

  showMap() {
    const { machine, screens, progress, params } = this.shared;
    machine.go({ name: 'map' });
    const unlockAll = params.has('unlockAll');
    const firstOpen = LEVELS.findIndex((l) => !progress.levelsCompleted.includes(l.id));
    const nodes = LEVELS.map((l, i) => {
      const c = levelCopy[l.id];
      const done = progress.levelsCompleted.includes(l.id);
      const status: 'done' | 'current' | 'locked' =
        done ? 'done' : unlockAll || i === firstOpen ? 'current' : 'locked';
      return { index: l.index, era: c.name, year: c.year, status };
    });
    screens.timelineMap(nodes, (index) => this.startLevel(index));
  }

  startLevel(index: number) {
    const level = levelByIndex(index);
    if (!level) return;
    const { machine, screens } = this.shared;
    this.session?.dispose();
    this.session = null;
    machine.go({ name: 'levelIntro', level: index });
    const c = levelCopy[level.id];
    screens.levelIntro(c.introKicker, c.introTitle, c.introBody, c.introChallenge, c.introCta, () => {
      if (level.kind === 'scroll') {
        this.arc ??= this.startScroll();
        this.arc.begin();
        this.addTimelineReturn();
      } else {
        this.session = new MiniLevelSession(this.shared, level, resolveEra(level.eraId), () =>
          this.complete(level),
        );
        this.session.start();
      }
    });
  }

  /** Way back from the scroll to the map — a clean page reload; tearing the
      full arc down in-page isn't worth the risk. Shown in restful states only. */
  private addTimelineReturn() {
    if (document.getElementById('tl-return')) return;
    const { ui, machine } = this.shared;
    ui.insertAdjacentHTML(
      'beforeend',
      `<button id="tl-return" style="position:fixed;top:16px;left:18px;z-index:5;
        pointer-events:auto;background:none;border:0;color:var(--dim);cursor:pointer;
        font:500 13px Rubik,system-ui;text-decoration:underline;display:none">⟵ Timeline</button>`,
    );
    const btn = ui.querySelector<HTMLButtonElement>('#tl-return')!;
    btn.addEventListener('click', () => {
      location.href = location.pathname;
    });
    machine.onChange((s) => {
      btn.style.display = ['explore', 'celebration'].includes(s.name) ? '' : 'none';
    });
  }

  private complete(level: LevelDef) {
    const { progress, persist } = this.shared;
    if (!progress.levelsCompleted.includes(level.id)) progress.levelsCompleted.push(level.id);
    progress.currentLevel = Math.min(level.index + 1, LEVELS.length);
    persist();
    this.session?.dispose();
    this.session = null;
    this.showMap();
  }
}
