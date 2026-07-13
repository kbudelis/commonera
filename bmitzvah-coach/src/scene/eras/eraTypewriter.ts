import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  Mesh,
  PlaneGeometry,
  PointLight,
} from 'three/webgpu';
import { makeEnvTexture } from '../lighting';
import { createPaperMaterial } from '../paperMaterial';
import { deviceMaterial, roundedBox } from './deviceKit';
import type { EraDef, EraScene } from './types';

const SHEET_W = 1.15;
const SHEET_H = 1.32;
/** Sheet center sits above the platen. */
const SHEET_Y = 0.24;
/** The sheet wraps backward around the platen at its bottom edge. */
function curlZ(v: number) {
  const t = Math.min(1, Math.max(0, (0.16 - v) / 0.16));
  const s = t * t * (3 - 2 * t);
  return -0.11 * s * s;
}

/** 1958: a practice sheet rolled into a mid-century Hebrew typewriter. */
export const eraTypewriter: EraDef = {
  id: 'typewriter1958',
  pointer: 'ballpoint',
  theme: {
    tokens: {
      accent: '#c8842d',
      bg: '#241d16',
      paper: '#f2ecdc',
    },
    vignette: true,
  },
  bake: { aspect: SHEET_W / SHEET_H, inkColor: '#26221f' },
  create({ inkTexture, visited, pbr }) {
    const group = new Group();
    const disposables: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(d: T): T => (disposables.push(d), d);

    // Plain typing stock — no green bars, faint fiber from the parchment normal.
    const paperMat = createPaperMaterial(inkTexture, {
      colors: [
        [0.945, 0.93, 0.885],
        [0.945, 0.93, 0.885],
      ],
      normal: pbr.normal,
      normalScale: 0.25,
      visited: { map: visited, tint: [0.6, 0.15, 0.11] }, // red ribbon
    });
    track(paperMat.material);
    const sheetGeo = track(new PlaneGeometry(SHEET_W, SHEET_H, 24, 48));
    const spos = sheetGeo.attributes.position;
    const suv = sheetGeo.attributes.uv;
    for (let i = 0; i < spos.count; i++) spos.setZ(i, curlZ(suv.getY(i)));
    spos.needsUpdate = true;
    sheetGeo.computeVertexNormals();
    const sheet = new Mesh(sheetGeo, paperMat.material);
    sheet.position.y = SHEET_Y;

    // Black-lacquer machine body with the classic stepped key bank.
    const lacquer = track(
      deviceMaterial({
        tex: 'plastic',
        albedo: false,
        color: '#282320',
        repeat: 2,
        roughness: 0.55,
        normalScale: 0.5,
      }),
    );
    const rubber = track(
      deviceMaterial({ tex: 'plastic', albedo: false, color: '#181518', normalScale: 0.4 }),
    );
    const chrome = track(
      deviceMaterial({ tex: 'metal', color: '#cfd2d6', metalness: 0.9, roughness: 0.6 }),
    );

    const body = new Mesh(track(roundedBox(1.75, 0.38, 0.8, 0.06)), lacquer);
    body.position.set(0, -0.98, 0.15);

    // Carriage: rail, rubber platen, end knobs, return lever (on the right —
    // a Hebrew carriage runs the other way).
    const rail = new Mesh(track(roundedBox(1.95, 0.11, 0.16, 0.04)), lacquer);
    rail.position.set(0, -0.62, -0.04);
    const platen = new Mesh(track(new CylinderGeometry(0.095, 0.095, 1.7, 24)), rubber);
    platen.rotation.z = Math.PI / 2;
    platen.position.set(0, -0.51, -0.03);
    for (const side of [-1, 1]) {
      const knob = new Mesh(track(new CylinderGeometry(0.055, 0.055, 0.09, 18)), lacquer);
      knob.rotation.z = Math.PI / 2;
      knob.position.set(side * 0.92, -0.51, -0.03);
      group.add(knob);
    }
    const leverArm = new Mesh(track(roundedBox(0.2, 0.022, 0.022, 0.01)), chrome);
    leverArm.position.set(1.0, -0.5, 0.05);
    leverArm.rotation.z = 0.35;
    const leverTip = new Mesh(track(roundedBox(0.03, 0.07, 0.026, 0.012)), chrome);
    leverTip.position.set(1.09, -0.44, 0.05);

    // Paper bail: a chrome rod resting across the sheet.
    const bail = new Mesh(track(new CylinderGeometry(0.008, 0.008, 1.26, 12)), chrome);
    bail.rotation.z = Math.PI / 2;
    bail.position.set(0, -0.36, curlZ((-0.36 - (SHEET_Y - SHEET_H / 2)) / SHEET_H) + 0.014);

    // Type bars fanned up from behind the body toward the strike point.
    const barGeo = track(new BoxGeometry(0.012, 0.24, 0.008));
    const bars = new InstancedMesh(barGeo, chrome, 9);
    const m = new Matrix4();
    for (let i = 0; i < 9; i++) {
      const a = (i / 8 - 0.5) * 1.0;
      m.makeRotationZ(a);
      m.setPosition(Math.sin(a) * -0.18, -0.68 + Math.cos(a) * 0.1, 0.05);
      bars.setMatrixAt(i, m);
    }
    group.add(bars);

    // Round keys in three stepped rows + a space bar.
    const keyBody = track(new CylinderGeometry(0.03, 0.036, 0.022, 14));
    const keyTop = track(new CylinderGeometry(0.027, 0.027, 0.007, 14));
    const ivory = track(
      deviceMaterial({ tex: 'plastic', albedo: false, color: '#e8e2d2', normalScale: 0.3 }),
    );
    const rows: [number, number, number][] = [
      [10, -0.68, -0.08],
      [9, -0.73, 0.05],
      [10, -0.78, 0.18],
    ];
    const totalKeys = rows.reduce((a, [n]) => a + n, 0);
    const bodies = new InstancedMesh(keyBody, lacquer, totalKeys);
    const tops = new InstancedMesh(keyTop, ivory, totalKeys);
    let k = 0;
    for (const [count, y, z] of rows) {
      for (let i = 0; i < count; i++) {
        const x = (i - (count - 1) / 2) * 0.085;
        m.makeRotationX(0.35);
        m.setPosition(x, y, z + 0.28);
        bodies.setMatrixAt(k, m);
        m.setPosition(x, y + 0.012, z + 0.284);
        tops.setMatrixAt(k, m);
        k++;
      }
    }
    const spaceBar = new Mesh(track(roundedBox(0.5, 0.018, 0.05, 0.008)), ivory);
    spaceBar.position.set(0, -0.83, 0.5);
    spaceBar.rotation.x = 0.35;
    group.add(bodies, tops, spaceBar);
    // A desk to ground the machine.
    const desk = new Mesh(
      track(new BoxGeometry(3.2, 0.04, 1.6)),
      track(deviceMaterial({ tex: 'wood', color: '#8a6f52', repeat: 2 })),
    );
    desk.position.set(0, -1.19, 0.1);
    group.add(desk);

    group.add(sheet, body, rail, platen, leverArm, leverTip, bail);

    // Desk-lamp warmth over a quiet study.
    const lamp = new PointLight('#ffe2b8', 3.2, 0, 2);
    lamp.position.set(0.45, 0.7, 1.4);
    const fill = new HemisphereLight('#c6c2cc', '#241d16', 0.62);
    group.add(lamp, fill);
    const env = track(
      makeEnvTexture({
        sky: '#241d16',
        floor: '#120d09',
        glowColor: '255, 214, 170',
        glowPos: [34, 12],
        glowRadius: 44,
        glowAlpha: 0.7,
      }),
    );

    const scene: EraScene = {
      id: 'typewriter1958',
      group,
      surface: {
        mesh: sheet,
        surfacePoint: (u, v) => ({
          x: (u - 0.5) * SHEET_W,
          y: (v - 0.5) * SHEET_H + SHEET_Y,
          z: curlZ(v),
        }),
        surfaceNormal: () => ({ x: 0, y: 0, z: 1 }),
        handles: {
          highlight: paperMat.highlight,
          trail: paperMat.trail,
          aux: paperMat.aux,
        },
      },
      environment: { texture: env, intensity: 0.4 },
      lighting: { update() {} },
      fitSize: { width: 1.9, height: 2.0 },
      dispose() {
        bars.dispose();
        bodies.dispose();
        tops.dispose();
        for (const d of disposables) d.dispose();
      },
    };
    return scene;
  },
};
