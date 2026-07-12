import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  PlaneGeometry,
  PointLight,
  SRGBColorSpace,
} from 'three/webgpu';
import { makeEnvTexture } from '../lighting';
import { createParchmentMaterial } from '../parchmentMaterial';
import { deviceMaterial, roundedBox } from './deviceKit';
import type { EraDef, EraScene } from './types';

const PAGE_W = 1.05;
const PAGE_H = 1.4;
/** Gentle outward bow of an open book page. */
const bowZ = (u: number) => 0.028 * Math.sin(u * Math.PI);

/** The stacked-page fore-edge: fine cream lines across the block's thickness. */
function pageEdgeTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 16;
  const g = c.getContext('2d')!;
  g.fillStyle = '#e6dbbd';
  g.fillRect(0, 0, 128, 16);
  for (let x = 0; x < 128; x += 2) {
    const shade = 208 + ((x * 7919) % 28);
    g.fillStyle = `rgb(${shade}, ${shade - 14}, ${shade - 48})`;
    g.fillRect(x, 0, 1, 16);
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Printer's headpiece: double rules + simple fleurons, drawn — never downloaded. */
function ornamentTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 96;
  const g = c.getContext('2d')!;
  g.strokeStyle = '#241505';
  g.fillStyle = '#241505';
  g.lineWidth = 3;
  for (const y of [30, 66]) {
    g.beginPath();
    g.moveTo(20, y);
    g.lineTo(492, y);
    g.stroke();
  }
  // Center fleuron: diamond + dots, mirrored arcs either side.
  g.save();
  g.translate(256, 48);
  g.beginPath();
  g.moveTo(0, -14);
  g.lineTo(11, 0);
  g.lineTo(0, 14);
  g.lineTo(-11, 0);
  g.closePath();
  g.fill();
  for (const dx of [-30, 30]) {
    g.beginPath();
    g.arc(dx, 0, 5, 0, Math.PI * 2);
    g.fill();
  }
  for (const dx of [-70, 70]) {
    g.beginPath();
    g.ellipse(dx, 0, 22, 7, 0, 0, Math.PI * 2);
    g.stroke();
  }
  g.restore();
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** A 1565 printed siddur: whiter stock, printer's ornaments, leather binding. */
export const eraSiddur: EraDef = {
  id: 'siddur1565',
  pointer: 'woodPointer',
  theme: {
    tokens: {
      accent: '#c09a3a',
      bg: '#221a10',
      paper: '#efe4c8',
    },
    vignette: true,
  },
  bake: { aspect: PAGE_W / PAGE_H },
  create({ inkTexture, pbr }) {
    const group = new Group();
    const disposables: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(d: T): T => (disposables.push(d), d);

    // The text page, bowed like a real open book (CPU verts — raycast-true).
    const parchment = createParchmentMaterial(inkTexture, pbr, {
      ageTintCenter: [1.0, 0.97, 0.9],
      ageTintEdge: [0.98, 0.92, 0.8],
      blotch: 0.04,
      edgeVignette: 0.85,
    });
    track(parchment.material);
    const pageGeo = track(new PlaneGeometry(PAGE_W, PAGE_H, 48, 12));
    const pos = pageGeo.attributes.position;
    const uvAttr = pageGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, bowZ(uvAttr.getX(i)));
    pos.needsUpdate = true;
    pageGeo.computeVertexNormals();
    const page = new Mesh(pageGeo, parchment.material);

    // Binding: page block + tooled leather cover + a hint of the facing page.
    const cream = track(new MeshStandardNodeMaterial({ color: '#e6dbbd', roughness: 0.9 }));
    const block = new Mesh(track(new BoxGeometry(1.16, 1.46, 0.09)), cream);
    block.position.z = -0.055;
    // The fore-edge: stacked-page striping on the block's visible right face.
    const edgeTex = track(pageEdgeTexture());
    const foreEdge = new Mesh(
      track(new PlaneGeometry(0.09, 1.44)),
      track(new MeshStandardNodeMaterial({ map: edgeTex, roughness: 0.95 })),
    );
    foreEdge.position.set(0.581, 0, -0.055);
    foreEdge.rotation.y = Math.PI / 2;
    const leather = track(
      deviceMaterial({ tex: 'leather', albedo: false, color: '#4a2c16', repeat: 2, normalScale: 1.2 }),
    );
    const cover = new Mesh(track(roundedBox(1.3, 1.56, 0.055, 0.028)), leather);
    cover.position.z = -0.115;
    // Spine roll along the gutter edge.
    const spine = new Mesh(track(new CylinderGeometry(0.045, 0.045, 1.56, 18)), leather);
    spine.position.set(-0.64, 0, -0.115);
    group.add(spine);
    // Brass clasps wrapping the fore-edge.
    const brass = track(
      deviceMaterial({ tex: 'metal', color: '#d9ae55', metalness: 0.75, roughness: 0.55, normalScale: 0.6 }),
    );
    for (const y of [-0.42, 0.42]) {
      const clasp = new Mesh(track(roundedBox(0.09, 0.11, 0.03, 0.012)), brass);
      clasp.position.set(0.63, y, -0.09);
      group.add(clasp);
    }
    // The facing page lifts off the block with a gentle curl.
    const facingGeo = track(new PlaneGeometry(0.42, 1.4, 12, 1));
    const fpos = facingGeo.attributes.position;
    const fuv = facingGeo.attributes.uv;
    for (let i = 0; i < fpos.count; i++) fpos.setZ(i, 0.05 * Math.sin(fuv.getX(i) * Math.PI));
    fpos.needsUpdate = true;
    facingGeo.computeVertexNormals();
    const facing = new Mesh(facingGeo, cream);
    facing.position.set(-0.72, 0, -0.02);
    facing.rotation.y = 0.5;

    // Printer's headpiece above the text — its OWN plane so the WordIndex
    // never sees non-word ink.
    const ornTex = track(ornamentTexture());
    const ornament = new Mesh(
      track(new PlaneGeometry(0.7, 0.13)),
      track(new MeshBasicNodeMaterial({ map: ornTex, transparent: true })),
    );
    ornament.position.set(0, 0.655, bowZ(0.5) + 0.002);

    group.add(page, block, foreEdge, cover, facing, ornament);

    // Print-shop light: whiter, steadier than the scroll's candle.
    const lamp = new PointLight('#ffd9a8', 5, 0, 2);
    lamp.position.set(-0.5, 0.7, 1.3);
    const fill = new HemisphereLight('#c8c2b8', '#3a3026', 0.7);
    group.add(lamp, fill);
    const env = track(makeEnvTexture());
    const base = lamp.intensity;

    const scene: EraScene = {
      id: 'siddur1565',
      group,
      surface: {
        mesh: page,
        surfacePoint: (u, v) => ({
          x: (u - 0.5) * PAGE_W,
          y: (v - 0.5) * PAGE_H,
          z: bowZ(u),
        }),
        surfaceNormal: () => ({ x: 0, y: 0, z: 1 }),
        handles: {
          highlight: parchment.highlight,
          trail: parchment.trail,
          aux: parchment.aux,
        },
      },
      environment: { texture: env, intensity: 0.25 },
      lighting: {
        update(t) {
          lamp.intensity = base * (1 + 0.025 * Math.sin(t * 6.1));
        },
      },
      fitSize: { width: 1.6, height: 1.62 },
      dispose() {
        for (const d of disposables) d.dispose();
      },
    };
    return scene;
  },
};
