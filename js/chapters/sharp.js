// Chapter 2: sharp and wide. Same force, tiny area: huge pressure (knives, nails). Same weight, big area:
// small pressure (snowshoes, fat low-pressure tyres, a bed of nails).
// Knife: the edge touching a tomato is L = 4 cm long and w wide. A freshly sharpened kitchen edge is a
//   few micrometres across at the very tip; the flat that carries the load is taken here as 0.02 mm, a
//   dull one 0.5 mm or more. The tomato's skin is taken to split above 1 MPa: an illustrative figure
//   chosen so that a dull knife needs about 20 N and squashes the fruit first, as every cook knows.
// Bed of nails: 1 mm² blunted tips (performers file them), a 70 kg person, W = 687 N shared by n nails.
//   Skin is taken to be pierced above about 10 N on a 1 mm² blunt tip, 10 MPa (order of magnitude from
//   needle-insertion studies; illustrative). So below about 70 nails it hurts.
// Snow: fresh powder sinks under the pressure of each foot; d = 60 cm × (1 − e^(−P ÷ 12 kPa)) is an
//   illustrative fit (knee-deep in boots, ankle-deep on snowshoes). Boot sole ≈ 30 × 10 cm = 0.03 m²,
//   snowshoe ≈ 76 × 25 cm ≈ 0.17 m², cross-country ski ≈ 170 × 8 cm ≈ 0.14 m², weight on both feet.
// Tyres: to a first approximation a tyre's contact patch carries its load at the inflation pressure,
//   so patch area ≈ wheel load ÷ gauge pressure (the stiff sidewalls carry a little too, so real patches
//   are somewhat bigger). Car: 1,350 kg laden ÷ 4 ≈ 3.3 kN per wheel, 185/65 R15, 2.2 bar (typical
//   placard, see CarClear). Bicycle: 90 kg rider and bike, 60% on the rear, 700×28c at 4–7 bar
//   (see CycleClear). Tractor: 2,200 kg, 60% on two rear 13.6-28 tyres (≈ 6.5 kN each) at about 0.8–1.2 bar.
import { THREE, M, box, sphere, torus } from '../kit.js';
import {
  G, BAR, board, panelBg, title, axes, line, dot, tag, COL, fitNarrow, inReel, focusView, placeBoard,
  force, makeBed, makePerson, fmt, fmtP, fmtN, fmtArea, clamp, approach,
} from '../pressure.js';

const NX = 20, SX = 40, TX = 60;
const KNIFE = { L: 0.04, cut: 1e6 };
const NAILS = { m: 70, tip: 1e-6, pierce: 10e6, max: 1600 };
const SHOES = { boots: { a: 0.03, name: 'boots' }, snowshoes: { a: 0.17, name: 'snowshoes' }, skis: { a: 0.136, name: 'skis' } };
const VEH = {
  car: { name: 'car tyre', load: 1350 * G / 4, R: 0.31, w: 0.15, sec: 0.185, tube: 0.06, def: 2.2, col: 0x16181d },
  bike: { name: 'bicycle tyre', load: 90 * G * 0.6, R: 0.34, w: 0.022, sec: 0.028, tube: 0.014, def: 6, col: 0x1b1d22 },
  tractor: { name: 'tractor tyre', load: 2200 * G * 0.6 / 2, R: 0.66, w: 0.32, sec: 0.345, tube: 0.15, def: 1, col: 0x202226 },
};
export const knifeP = (s) => s.kF / (KNIFE.L * s.edge * 1e-3);
export const nailP = (s) => (NAILS.m * G) / (s.nails * NAILS.tip);
export const snowP = (s) => (s.mass * G) / (2 * SHOES[s.shoe].a);
const snowDepth = (P) => 0.6 * (1 - Math.exp(-P / 12e3));
export const patch = (s) => VEH[s.veh].load / (s.tp * BAR);

const VIEWS = {
  knife: { pos: [0.16, 0.24, 0.5], target: [0.14, 0.07, 0] },
  nails: { pos: [NX - 0.3, 1.5, 2.4], target: [NX + 0.4, 0.3, 0] },
  snow: { pos: [SX + 0.4, 1.9, 4.4], target: [SX + 0.55, 0.7, 0] },
  tyre_car: { pos: [TX + 0.55, 0.85, 1.75], target: [TX + 0.35, 0.28, 0] },
  tyre_bike: { pos: [TX + 0.55, 0.85, 1.75], target: [TX + 0.35, 0.28, 0] },
  tyre_tractor: { pos: [TX + 0.9, 1.7, 3.4], target: [TX + 0.6, 0.6, 0] },
};
const REEL = {
  knife: { pos: [0.12, 0.26, 0.36], target: [0.12, 0.16, 0] },
  tyre_car: { pos: [TX + 0.1, 0.8, 1.6], target: [TX + 0.1, 0.45, 0] },
};

export default {
  id: 'sharp',
  short: 'Sharp and wide',
  title: 'Sharp things cut, wide things float',
  subtitle: 'Knives and nails squeeze a force onto a tiny area. Snowshoes, beds of nails and fat tyres spread it out.',
  view: VIEWS.knife,
  learn: `<p>Every <b>cutting</b> tool is a pressure machine. A sharp knife touches the tomato along an edge maybe a fiftieth of a millimetre wide, so a gentle 10 N push becomes a pressure of many <b>megapascals</b>, and the skin splits. A <b>blunt</b> knife spreads the same push over an edge 25 times wider: the pressure is 25 times smaller, and the tomato squashes instead.</p>
    <p>A <b>nail</b> works the same way. The hammer hits the wide head (about 50 mm²) and the same force comes out of the point (about 0.5 mm²): <b>a hundred times the pressure</b>, enough to part the wood fibres.</p>
    <p>Flip it round to <b>spread</b> a weight. <b>Snowshoes</b> put your weight on six times the area of your boots, so you stay on top of fresh snow. A <b>bed of nails</b> is safe for the same reason: a thousand points share your weight, so each presses gently. Just one would go straight through.</p>
    <p><b>Tyres</b> are the neat case: the patch touching the road grows until <b>load ÷ area ≈ air pressure</b>. A car tyre at <b>2.2 bar</b> needs a patch about the size of your palm. A racing bike at 6 bar (CycleClear) touches with less than a postage stamp. A tractor runs its huge tyres at only about 1 bar, so it spreads its weight and doesn't pack down the soil.</p>
    <p class="tip"><b>Try it:</b> blunt the knife until it can't cut, then push harder. Take nails away from the bed until it hurts. Swap boots for snowshoes. Let air out of the car tyre and watch the patch grow.</p>`,
  terms: [
    { t: 'Edge', d: 'The thin line where a blade’s two faces meet. The thinner it is, the higher the pressure for the same push.' },
    { t: 'Contact patch', d: 'The part of a tyre touching the road. Its area is roughly the load divided by the tyre pressure.' },
    { t: 'Gauge pressure', d: 'Pressure above the air around us, what a tyre gauge shows. 2.2 bar gauge is about 3.2 bar in total.' },
    { t: 'Ground pressure', d: 'A vehicle’s or animal’s weight divided by the area it stands on. Low ground pressure means less sinking.' },
    { t: 'Soil compaction', d: 'Squashing farm soil so roots and water can’t get in. Low-pressure tyres reduce it.' },
  ],
  defaults: { focus: 'knife', kF: 10, edge: 0.02, nails: 1000, mass: 80, shoe: 'boots', veh: 'car', tp: 2.2 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'knife', label: 'Knife' }, { v: 'nails', label: 'Bed of nails' }, { v: 'snow', label: 'Snow' }, { v: 'tyre', label: 'Tyres' }] },
    { key: 'edge', type: 'log', label: 'Knife: width of the edge', min: 0.01, max: 1, ends: ['razor sharp', 'blunt'], fmt: (v) => fmt(v, v < 0.1 ? 3 : 2) + ' mm' },
    { key: 'kF', type: 'range', label: 'Knife: how hard you press', min: 2, max: 40, step: 1, ends: ['2 N', '40 N'], fmt: (v) => v + ' N' },
    { key: 'nails', type: 'log', label: 'Bed: number of nails under you', min: 1, max: 1600, ends: ['1', '1,600'], fmt: (v) => fmt(Math.round(v), 0) },
    { key: 'mass', type: 'range', label: 'Snow: you plus your pack', min: 30, max: 110, step: 1, ends: ['30 kg', '110 kg'], fmt: (v) => v + ' kg' },
    { key: 'shoe', type: 'seg', label: 'Snow: on your feet', options: [{ v: 'boots', label: 'Boots' }, { v: 'snowshoes', label: 'Snowshoes' }, { v: 'skis', label: 'Skis' }] },
    { key: 'veh', type: 'seg', label: 'Tyres: which tyre', options: [{ v: 'car', label: 'Car' }, { v: 'bike', label: 'Bicycle' }, { v: 'tractor', label: 'Tractor' }] },
    { key: 'tp', type: 'range', label: 'Tyres: pressure on the gauge', min: 0.6, max: 8, step: 0.1, ends: ['0.6 bar', '8 bar'], fmt: (v) => `${fmt(v, 1)} bar (${fmt(v * 14.5, 0)} psi)` },
  ],
  onChange(s, key) {
    if (['edge', 'kF'].includes(key)) s.focus = 'knife';
    if (key === 'nails') { s.focus = 'nails'; s.nails = Math.round(s.nails); }
    if (['mass', 'shoe'].includes(key)) s.focus = 'snow';
    if (key === 'tp') s.focus = 'tyre';
    if (key === 'veh') { s.focus = 'tyre'; s.tp = VEH[s.veh].def; }
  },
  quiz: [
    { q: 'You push a knife with 10 N. Its edge touches along 4 cm and is 0.02 mm wide. What is the pressure on the tomato?', options: ['About 12.5 kPa', 'About 12.5 MPa', 'About 400 Pa', 'About 10 N'], answer: 1, why: 'Area = 0.04 m × 0.00002 m = 8 × 10⁻⁷ m². P = 10 ÷ 0.0000008 = 12,500,000 Pa, 12.5 MPa. That is why a gentle push cuts.' },
    { q: 'Why is a bed of 1,000 nails safe to lie on when a single nail is not?', options: ['The nails are softer when there are many', 'Your weight is shared, so the force on each point, and the pressure under it, is 1,000 times smaller', 'Many nails make you lighter', 'It is a trick with hidden padding'], answer: 1, why: 'Same weight, a thousand times the area: each tip presses with under 1 N instead of about 700 N.' },
    { q: 'A 3.3 kN wheel load sits on a car tyre at 2.2 bar (220 kPa). Roughly how big is the contact patch?', options: ['About 1.5 cm²', 'About 150 cm²', 'About 1.5 m²', 'About 15 m²'], answer: 1, why: 'Area ≈ load ÷ pressure = 3,300 ÷ 220,000 = 0.015 m², 150 cm². About the size of a hand.' },
  ],
  reel: [
    { ms: 5000, caption: 'A sharp edge squeezes a gentle push onto a tiny area: millions of pascals, and the tomato splits.', set: { focus: 'knife', kF: 10 }, anim: { edge: [0.6, 0.02, true] }, view: REEL.knife, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gK = new THREE.Group(), gN = new THREE.Group(), gS = new THREE.Group(), gT = new THREE.Group(); root.add(gK, gN, gS, gT);
    gN.position.x = NX; gS.position.x = SX; gT.position.x = TX;

    // ------------------------------------------------ knife and tomato
    const cb = box(0.34, 0.02, 0.22, M.matte(0xc99a5b)); cb.position.set(0.1, 0.01, 0); gK.add(cb);
    const tomato = new THREE.Group(); tomato.position.set(0.1, 0.02, 0); gK.add(tomato);
    const tomM = M.plastic(0xd9302a, { roughness: 0.35 }), inM = M.matte(0xf06a4a);
    const halves = [-1, 1].map((sd) => {
      const h = new THREE.Mesh(new THREE.SphereGeometry(0.036, 32, 16, sd < 0 ? Math.PI : 0, Math.PI), tomM); h.castShadow = true;
      const cap = new THREE.Mesh(new THREE.CircleGeometry(0.036, 32), inM); cap.rotation.y = sd < 0 ? Math.PI / 2 : -Math.PI / 2; h.add(cap);
      h.rotation.y = Math.PI / 2; h.position.y = 0.034; tomato.add(h); return h;
    });
    const stalk = box(0.006, 0.01, 0.006, M.matte(0x3f7a2c)); stalk.position.y = 0.072; tomato.add(stalk);
    const knife = new THREE.Group(); gK.add(knife);
    const blade = box(0.2, 0.04, 0.0025, M.metal(0xd6dbe3, { roughness: 0.18 })); blade.position.set(0, 0.02, 0); knife.add(blade);
    const bevel = box(0.2, 0.008, 0.0012, M.metal(0xf2f4f7, { roughness: 0.1 })); bevel.position.set(0, 0.004, 0); knife.add(bevel);
    const handle = box(0.11, 0.028, 0.016, M.matte(0x2a1c14)); handle.position.set(0.155, 0.03, 0); knife.add(handle);
    const edgeLine = box(0.2, 0.001, 0.003, M.glow(0x8ef0ff)); edgeLine.position.set(0, 0.0005, 0); knife.add(edgeLine);
    const aK = force(0xffb547, 0.004, 0.018); gK.add(aK);
    const lK = stage.label('', [0.1, 0.2, 0], gK, 'hot'); lK.element.style.setProperty('--c', COL.p);

    // ------------------------------------------------ bed of nails
    const plank = box(1.9, 0.04, 0.6, M.matte(0x6b4a2e)); plank.position.set(0.4, 0.24, 0); gN.add(plank);
    for (const x of [-0.45, 1.25]) for (const z of [-0.25, 0.25]) { const l = box(0.05, 0.22, 0.05, M.matte(0x4a3320)); l.position.set(x, 0.11, z); gN.add(l); }
    const nailGeo = new THREE.CylinderGeometry(0.0012, 0.003, 0.06, 6); nailGeo.translate(0, 0.03, 0);
    const nails = new THREE.InstancedMesh(nailGeo, M.metal(0xc9ced8), NAILS.max); nails.frustumCulled = false; gN.add(nails);
    const lier = makePerson({ shirt: 0xf2f2f2, pants: 0xe07b2a, skin: 0x8d5a3b }); lier.rotation.set(0, 0, Math.PI / 2); gN.add(lier);
    const lN = stage.label('', [0.4, 0.8, 0], gN, 'hot'); lN.element.style.setProperty('--c', COL.p);
    const o3 = new THREE.Object3D();

    // ------------------------------------------------ snow
    const snow = makeBed(2.4, 1.6, { color: 0xdfe6f0, side: 0xc9d4e3, seg: 110, thick: 0.6, rim: 0.12, shadeDepth: 0.4 }); snow.position.y = 0.01; gS.add(snow);
    const hiker = makePerson({ shirt: 0x2f6fd8, pants: 0x2b3242, skin: 0xc68b64 }); hiker.position.x = 0.2; gS.add(hiker);
    const pack = box(0.14, 0.4, 0.3, M.matte(0xd8332f)); pack.position.set(-0.2, 1.25, 0); hiker.add(pack);
    const shoeM = { snowshoes: M.matte(0x2a3140), skis: M.plastic(0xffb547) };
    const feet = [-0.1, 0.1].map((z) => {
      const f = new THREE.Group(); f.position.set(0.2, 0, z); gS.add(f);
      const ss = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.02, 24), shoeM.snowshoes); ss.scale.set(0.76, 1, 0.25); f.add(ss); ss.castShadow = true;
      const sk = box(1.7, 0.02, 0.08, shoeM.skis); f.add(sk);
      f.ss = ss; f.sk = sk; return f;
    });
    const lS = stage.label('', [0, 0, 0], gS, 'hot'); lS.element.style.setProperty('--c', COL.p);

    // ------------------------------------------------ tyre on the road
    const road = box(3, 0.4, 1.4, M.matte(0x3a3d44)); road.position.set(0.3, -0.2, 0); gT.add(road);
    const wheel = new THREE.Group(); gT.add(wheel);
    const tyreMesh = torus(1, 1, M.matte(0x16181d), 64); wheel.add(tyreMesh);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 32), M.metal(0x7d8591, { roughness: 0.4 })); rim.rotation.x = Math.PI / 2; wheel.add(rim);
    const patchM = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), M.glow(0xff5a8a, { transparent: true, opacity: 0.85 })); patchM.rotation.x = -Math.PI / 2; patchM.position.y = 0.003; gT.add(patchM);
    const aW = force(0xffb547, 0.015, 0.06); gT.add(aW);
    const lT = stage.label('', [0, 0, 0], gT, 'hot'); lT.element.style.setProperty('--c', COL.hot);
    const lLoad = stage.label('', [0, 0, 0], gT);

    // ------------------------------------------------ board
    let cur = null;
    const chart = board(root, 1.6, 1.0, 800, 500, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur) return;
      const f = cur.f;
      if (f === 'knife') {
        title(g, 'Pressure under the edge', `push ${cur.kF} N along 4 cm`);
        const A = axes(g, w, h, { x0: 100, y1: 80, xMin: -2, xMax: 0, yMin: 4, yMax: 8, logX: true, logY: true, xTicks: [0.01, 0.1, 1], yTicks: [1e4, 1e5, 1e6, 1e7, 1e8], xFmt: (v) => v + ' mm', yFmt: fmtP, xLabel: 'edge width →' });
        const pts = []; for (let e = -2; e <= 0.001; e += 0.02) pts.push([10 ** e, clamp(cur.kF / (KNIFE.L * 10 ** e * 1e-3), 1e4, 1e8)]);
        line(g, pts, A.X, A.Y, COL.p, 5);
        g.strokeStyle = COL.warn; g.setLineDash([7, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(A.x0, A.Y(KNIFE.cut)); g.lineTo(A.x1, A.Y(KNIFE.cut)); g.stroke(); g.setLineDash([]);
        tag(g, 'skin splits (about 1 MPa)', A.x1 - 230, A.Y(KNIFE.cut) - 10, COL.warn, '16px sans-serif');
        dot(g, A.X(cur.edge), A.Y(clamp(cur.P, 1e4, 1e8)), cur.P >= KNIFE.cut ? COL.a : COL.hot, 11);
      } else if (f === 'nails') {
        title(g, 'Pressure on each nail tip', '70 kg shared by n nails, 1 mm² tips');
        const A = axes(g, w, h, { x0: 100, y1: 80, xMin: 0, xMax: Math.log10(1600), yMin: 5, yMax: 9, logX: true, logY: true, xTicks: [1, 10, 100, 1000], yTicks: [1e5, 1e6, 1e7, 1e8, 1e9], xFmt: String, yFmt: fmtP, xLabel: 'number of nails →' });
        const pts = []; for (let e = 0; e <= Math.log10(1600); e += 0.03) pts.push([10 ** e, (NAILS.m * G) / (10 ** e * NAILS.tip)]);
        line(g, pts, A.X, A.Y, COL.p, 5);
        g.strokeStyle = COL.warn; g.setLineDash([7, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(A.x0, A.Y(NAILS.pierce)); g.lineTo(A.x1, A.Y(NAILS.pierce)); g.stroke(); g.setLineDash([]);
        tag(g, 'skin pierced (about 10 MPa)', A.x1 - 240, A.Y(NAILS.pierce) - 10, COL.warn, '16px sans-serif');
        dot(g, A.X(cur.n), A.Y(cur.P), cur.P > NAILS.pierce ? COL.hot : COL.a, 11);
      } else if (f === 'snow') {
        title(g, 'How deep you sink in fresh snow', `${cur.mass} kg on both feet`);
        Object.entries(SHOES).forEach(([k, q], i) => {
          const P = (cur.mass * G) / (2 * q.a), d = snowDepth(P), y = 110 + i * 120;
          g.globalAlpha = k === cur.shoe ? 1 : 0.45;
          g.font = 'bold 20px sans-serif'; g.fillStyle = '#e8eef8'; g.fillText(`${q.name}: ${fmtArea(q.a)} each`, 30, y);
          g.fillStyle = COL.p; g.fillRect(30, y + 12, (P / 20e3) * 380, 26); g.fillStyle = '#e8eef8'; g.font = '18px sans-serif'; g.fillText(fmtP(P), 40 + (P / 20e3) * 380, y + 32);
          g.fillStyle = '#c9d6ea'; g.fillRect(560, y - 20, 60, 90); g.fillStyle = '#4a6fa5'; g.fillRect(560, y - 20, 60, (d / 0.6) * 90);
          g.fillStyle = '#e8eef8'; g.fillText(`${fmt(d * 100, 0)} cm`, 640, y + 30);
          g.globalAlpha = 1;
        });
        g.font = '16px sans-serif'; g.fillStyle = 'rgba(255,255,255,.55)'; g.fillText('Sinking depths are an illustration; real snow varies a lot.', 30, h - 24);
      } else {
        const v = VEH[cur.veh];
        title(g, `Contact patch of a ${v.name}`, `area ≈ load ÷ pressure, load ${fmtN(v.load)}`);
        const aMax = { car: 400, bike: 20, tractor: 1600 }[cur.veh];
        const A = axes(g, w, h, { x0: 100, y1: 80, xMin: 0, xMax: 8, yMax: aMax, xTicks: [0, 2, 4, 6, 8], yTicks: [0, aMax / 4, aMax / 2, (aMax * 3) / 4, aMax], xFmt: (q) => q + ' bar', yFmt: (q) => fmt(q, 0) + ' cm²', xLabel: 'tyre pressure →' });
        const pts = []; for (let p = 0.3; p <= 8; p += 0.05) { const a = (v.load / (p * BAR)) * 1e4; if (a <= aMax) pts.push([p, a]); }
        line(g, pts, A.X, A.Y, COL.hot, 5);
        const a = (v.load / (cur.tp * BAR)) * 1e4; if (a <= aMax) dot(g, A.X(cur.tp), A.Y(a), COL.p, 11);
        tag(g, { car: 'typical: 2.2 bar', bike: 'road bikes: 5–7 bar', tractor: 'field: about 1 bar' }[cur.veh], A.X(4), A.Y(aMax * 0.85), COL.dim, '17px sans-serif');
      }
    }, [0, 0, 0]);
    const BOARD = {
      knife: [0.34, 0.14, -0.14, 0.14, -0.5], nails: [NX + 1.7, 0.9, -0.5, 0.75, -0.4], snow: [SX + 1.9, 1.3, -0.6, 0.95, -0.45],
      tyre_car: [TX + 0.95, 0.5, -0.4, 0.5, -0.45], tyre_bike: [TX + 0.95, 0.5, -0.4, 0.5, -0.45], tyre_tractor: [TX + 1.75, 1.0, -0.6, 0.95, -0.45],
    };
    const RB = { knife: [0.1, 0.24, -0.15, 0.17, 0], tyre_car: [TX + 0.1, 0.95, -0.5, 0.55, 0] };

    const st = {};
    let lastBoard = '', t = 0, cutY = 0, squash = 1, sinkN = 0, dSnow = 0, tpNow = 2.2;
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        const fk = s.focus === 'tyre' ? 'tyre_' + s.veh : s.focus;
        focusView(stage, st, fk, VIEWS);
        const narrow = fitNarrow(stage, [lLoad]);
        const f = s.focus;
        gK.visible = f === 'knife'; gN.visible = f === 'nails'; gS.visible = f === 'snow'; gT.visible = f === 'tyre';
        placeBoard(chart, fk, BOARD, RB, narrow);
        let P = 0;
        if (f === 'knife') {
          P = knifeP(s); const cuts = P >= KNIFE.cut;
          const ph = (t % 3.2) / 3.2;                         // lower, press, lift
          const topY = 0.02 + 0.072;
          let y;
          if (ph < 0.25) y = topY + 0.05 * (1 - ph / 0.25);
          else if (ph < 0.8) { const k = (ph - 0.25) / 0.55; y = cuts ? topY - k * 0.074 : topY - k * 0.018 * Math.min(1, s.kF / 30); }
          else y = topY + ((ph - 0.8) / 0.2) * 0.05;
          const pressing = ph >= 0.25 && ph < 0.8;
          cutY = y;
          knife.position.set(0.1, Math.max(0.021, cutY), 0);
          const sq = !cuts && pressing ? 1 - 0.28 * Math.min(1, s.kF / 30) * Math.min(1, (ph - 0.25) / 0.2) : 1;
          squash = approach(squash, sq, 8, dt);
          tomato.scale.set(1 + (1 - squash) * 0.6, squash, 1 + (1 - squash) * 0.6);
          const open = cuts && pressing && y < topY - 0.06 ? Math.min(1, (topY - 0.06 - y) / 0.01) : cuts && ph >= 0.8 ? 1 - (ph - 0.8) / 0.2 : 0;
          halves[0].position.z = -open * 0.006; halves[1].position.z = open * 0.006;
          aK.aim([0.1, cutY + 0.11, 0], [0, -1, 0], pressing ? 0.03 + s.kF * 0.0015 : 0.001);
          lK.position.set(0.1, 0.19, 0); lK.element.innerHTML = `P = <b>${fmtP(P)}</b> · ${cuts ? 'cuts' : 'squashes'}`;
        } else if (f === 'nails') {
          P = nailP(s); const n = s.nails, top = 0.26;
          const cols = Math.max(1, Math.round(Math.sqrt(n * 1.7 / 0.42))), rows = Math.max(1, Math.ceil(n / cols));
          const dx = 1.55 / Math.max(1, cols), dz = 0.42 / Math.max(1, rows);
          for (let i = 0; i < NAILS.max; i++) {
            if (i < n) { const c = i % cols, r = Math.floor(i / cols); o3.position.set(0.4 - 0.775 + dx * (c + 0.5), top, -0.21 + dz * (r + 0.5)); o3.scale.setScalar(1); }
            else o3.scale.setScalar(0.0001);
            o3.updateMatrix(); nails.setMatrixAt(i, o3.matrix);
          }
          nails.instanceMatrix.needsUpdate = true;
          sinkN = approach(sinkN, P > NAILS.pierce ? 0.03 : 0, 4, dt);
          lier.position.set(1.2, top + 0.06 + 0.165 - sinkN, 0);
          lN.position.set(0.4, 0.75, 0); lN.element.innerHTML = `${fmt(n, 0)} nails · <b>${fmtP(P)}</b> per tip${P > NAILS.pierce ? ' · ouch!' : ''}`;
        } else if (f === 'snow') {
          P = snowP(s); dSnow = approach(dSnow, snowDepth(P), 3, dt);
          const a = SHOES[s.shoe], hw = s.shoe === 'boots' ? 0.15 : s.shoe === 'skis' ? 0.85 : 0.38, hd = s.shoe === 'boots' ? 0.05 : s.shoe === 'skis' ? 0.04 : 0.125;
          snow.setDents(feet.map((ft) => ({ x: 0.25, z: ft.position.z, hw, hd, depth: dSnow, rim: 0.1 })));
          const top = 0.01 - dSnow;
          hiker.position.y = top + (s.shoe === 'boots' ? 0.035 : 0.055);
          feet.forEach((ft) => { ft.position.set(0.25, top + 0.01, ft.position.z); ft.ss.visible = s.shoe === 'snowshoes'; ft.sk.visible = s.shoe === 'skis'; });
          lS.position.set(0.25, top + 2.05, 0); lS.element.innerHTML = `${a.name}: <b>${fmtP(P)}</b> · sank ${fmt(dSnow * 100, 0)} cm`;
        } else {
          const v = VEH[s.veh]; tpNow = approach(tpNow, s.tp, 6, dt);
          P = s.tp * BAR;
          const A = v.load / (tpNow * BAR), L = Math.min(A / v.w, v.R * 1.4), sag = v.R - Math.sqrt(Math.max(0, v.R * v.R - (L / 2) ** 2));
          const Rm = v.R - v.tube;
          tyreMesh.scale.set(Rm, Rm, 1); tyreMesh.geometry.dispose(); tyreMesh.geometry = new THREE.TorusGeometry(1, v.tube / Rm, 16, 64);
          tyreMesh.scale.z = (v.sec / 2) / v.tube * Rm;
          tyreMesh.material.color.setHex(v.col);
          rim.scale.set(Rm - v.tube * 0.85, v.sec * 0.7, Rm - v.tube * 0.85);
          wheel.position.set(0, v.R - sag, 0);
          patchM.scale.set(L, v.w, 1); patchM.position.set(0, 0.003, 0);
          aW.aim([0, v.R * 2 + 0.05 + v.R * 0.4, 0], [0, -1, 0], v.R * 0.4);
          lLoad.position.set(0, v.R * 2.55, 0); lLoad.element.innerHTML = `load ${fmtN(v.load)}`;
          lT.position.set(0, 0.02, v.sec * 0.9 + 0.06); lT.element.innerHTML = `patch <b>${fmtArea(A)}</b>`;
        }
        const bk = `${fk}|${s.kF}|${s.edge}|${s.nails}|${s.mass}|${s.shoe}|${s.tp}`;
        if (bk !== lastBoard) { lastBoard = bk; cur = { f, P, kF: s.kF, edge: s.edge, n: s.nails, mass: s.mass, shoe: s.shoe, veh: s.veh, tp: s.tp }; chart.redraw(); }
      },
      readout(s) {
        const f = s.focus;
        if (f === 'knife') {
          const P = knifeP(s), A = KNIFE.L * s.edge * 1e-3;
          return `<div class="big">${fmtP(P)} under the edge</div>
            <div class="row"><span>Your push</span><b>${s.kF} N</b></div>
            <div class="row"><span>Edge area, 4 cm × ${fmt(s.edge, s.edge < 0.1 ? 3 : 2)} mm</span><b>${fmtArea(A)}</b></div>
            <div class="row"><span>Force to cut (at 1 MPa)</span><b>${fmtN(KNIFE.cut * A)}</b></div>
            <small>${P >= KNIFE.cut ? '<span class="ok">Sharp enough: the skin splits.</span>' : '<span class="no">Too blunt: the tomato squashes first.</span>'} The 1 MPa limit is illustrative.</small>`;
        }
        if (f === 'nails') {
          const P = nailP(s), per = (NAILS.m * G) / s.nails;
          return `<div class="big">${fmtP(P)} per nail</div>
            <div class="row"><span>Your weight, 70 kg</span><b>${fmtN(NAILS.m * G)}</b></div>
            <div class="row"><span>Shared by</span><b>${fmt(s.nails, 0)} nails</b></div>
            <div class="row"><span>Force on each 1 mm² tip</span><b>${fmtN(per)}</b></div>
            <small>${P > NAILS.pierce ? '<span class="no">Too few nails: they would pierce skin.</span>' : '<span class="ok">Safe: each point presses gently.</span>'} Pain limit about 10 N per tip, illustrative.</small>`;
        }
        if (f === 'snow') {
          const P = snowP(s), a = SHOES[s.shoe];
          return `<div class="big">${fmtP(P)} on the snow</div>
            <div class="row"><span>Weight</span><b>${fmtN(s.mass * G)}</b></div>
            <div class="row"><span>Area, two ${a.name}</span><b>${fmtArea(2 * a.a)}</b></div>
            <div class="row"><span>You sink about</span><b>${fmt(snowDepth(P) * 100, 0)} cm</b></div>
            <small>Walking puts all your weight on one foot: twice the pressure.</small>`;
        }
        const v = VEH[s.veh], A = v.load / (s.tp * BAR);
        return `<div class="big">Patch ≈ ${fmtArea(A)}</div>
          <div class="row"><span>Load on this ${v.name}</span><b>${fmtN(v.load)}</b></div>
          <div class="row"><span>Pressure (gauge)</span><b>${fmt(s.tp, 1)} bar = ${fmt(s.tp * 100, 0)} kPa</b></div>
          <div class="row"><span>Patch = load ÷ pressure</span><b>${fmt(A * 1e4, A * 1e4 < 20 ? 1 : 0)} cm²</b></div>
          <small>${s.veh === 'car' ? 'Under-inflated tyres flex, heat up and waste fuel (CarClear).' : s.veh === 'bike' ? 'Hard tyres roll easily on smooth roads; softer ones grip rough tracks (CycleClear).' : 'Low pressure spreads the weight and saves the soil from packing down.'}</small>`;
      },
    };
  },
};
