// Chapter 5: surprises and myths.
// Gauge vs absolute: a tyre gauge reads the pressure above the air around it. Absolute = gauge + 1 atm.
//   A "flat" tyre (0 on the gauge) still holds air at 1 atm; the molecules per cube drawn are
//   proportional to absolute pressure (ideal gas at one temperature, n ÷ V = P ÷ kT; see GasLawClear).
// Suction: a suction cup holds because the outside air pushes on it. With a perfect seal and no air
//   left behind, the most it can hold is P_outside × A. Cup 6 cm across (28 cm²). Pressures: sea level
//   101 kPa, Leh ≈ 65 kPa (ISA 3,500 m), Everest summit ≈ 33.7 kPa (measured, West 1983), Mars ≈ 0.6 kPa
//   (NASA Mars fact sheet, mean surface 6.36 mbar; gravity 3.71 m/s²), the Moon essentially 0 (gravity 1.62 m/s²).
//   The bag's weight uses each place's own gravity.
// Deep sea: Challenger Deep, Mariana Trench, about 10,935 m (NOAA / 2021 survey 10,935 ± 6 m), with a
//   pressure of about 1,086 bar (Wikipedia, "Mariana Trench"). Seawater gets slightly denser with depth
//   and g changes a little, so instead of a fixed ρ the model scales linearly to that measured value:
//   P = 1 atm + (1,086 bar − 1 atm) × depth ÷ 10,935 m. Trieste reached the bottom on 23 January 1960.
//   Polystyrene cups shrink as the gas in their foam is squeezed out: the shrink curve here is an
//   illustration (roughly half size by a few thousand metres, as ocean-science outreach cruises show).
// Hydrostatic paradox (Stevin, 1586): vessels of different shapes filled to the same depth have the
//   same pressure at the bottom, P = ρ g h, whatever their width. Bases here are all 10 cm across.
import { THREE, M, box, sphere, torus, latheX } from '../kit.js';
import {
  G, ATM, BAR, RHO_W, board, panelBg, title, axes, line, dot, tag, logBars, COL, fitNarrow, inReel, focusView, placeBoard,
  force, arrowSet, makeGas, waterMat, fmt, fmtP, fmtN, isaP, clamp, approach, TAU,
} from '../pressure.js';

const VX = 20, TX = 40, PX = 60;
const CUP = { d: 0.06, A: Math.PI * 0.03 * 0.03, load: 5 };
const WHERE = { sea: { P: ATM, name: 'sea level' }, leh: { P: isaP(3500), name: 'Leh, 3,500 m' }, everest: { P: 33700, name: 'Everest summit' }, mars: { P: 636, name: 'Mars', g: 3.71 }, moon: { P: 0, name: 'the Moon', g: 1.62 } };
const DEEP = { h: 10935, P: 1086 * BAR, S: 1 / 4000 };
export const deepP = (d) => ATM + (DEEP.P - ATM) * (d / DEEP.h);
const cupShrink = (P) => 1 - 0.5 * (1 - Math.exp(-P / (100 * BAR)));
const VESSELS = [
  { name: 'straight', top: 0.05 }, { name: 'wide at the top', top: 0.22 }, { name: 'narrow at the top', top: 0.012 },
];
const frustum = (h, r1, r2) => (Math.PI * h * (r1 * r1 + r1 * r2 + r2 * r2)) / 3;

const VIEWS = {
  gauge: { pos: [-0.2, 0.75, 2.0], target: [0.45, 0.5, 0] },
  vacuum: { pos: [VX + 0.95, 0.62, 1.3], target: [VX - 0.04, 0.36, 0.12] },
  trench: { pos: [TX - 0.2, 1.6, 5.6], target: [TX - 0.25, 1.3, 0] },
  paradox: { pos: [PX - 0.2, 0.8, 2.0], target: [PX + 0.35, 0.45, 0] },
};
const REEL = {
  gauge: { pos: [0.45, 1.0, 1.8], target: [0.45, 0.8, 0] },
  paradox: { pos: [PX + 0.1, 0.95, 2.2], target: [PX + 0.1, 0.72, 0] },
  trench: { pos: [TX, 2.2, 2.3], target: [TX, 2.0, 0] },
};

export default {
  id: 'limits',
  short: 'Myths and extremes',
  title: 'Flat tyres, “suction” and the deepest sea',
  subtitle: 'What a gauge really reads, why nothing sucks, 1,086 bar in the Mariana Trench, and a famous paradox.',
  view: VIEWS.gauge,
  learn: `<p><b>Myth: “a flat tyre is empty.”</b> A tyre gauge shows <b>gauge pressure</b>: how much more than the air around it. A flat tyre reads 0, but it is still full of air at 1 atm. Real, or <b>absolute</b>, pressure is gauge plus about 1 bar. A car tyre at 2.2 bar on the gauge holds 3.2 bar of air (CarClear).</p>
    <p><b>Myth: “suction pulls.”</b> A vacuum can't pull anything. When you press a suction cup to a tile, you squeeze the air out from under it, and the <b>air outside pushes</b> it on. So a suction cup is only as strong as the air around it: weaker in Leh, useless on Mars, and it drops straight off on the Moon. Straws, vacuum cleaners and your own breathing all work by letting the outside push.</p>
    <p><b>Extremes.</b> At the bottom of the <b>Mariana Trench</b>, almost 11 km down, the water presses at about <b>1,086 bar</b>: a tonne on every square centimetre. In 1960 Jacques Piccard and Don Walsh went down in the <b>Trieste</b>, inside a steel ball with walls 12.7 cm thick. Polystyrene cups sent down come back shrunk to doll size.</p>
    <p><b>Myth: “a bigger tank gives more pressure.”</b> Fill vessels of any shape to the same depth and the pressure at the bottom is <b>exactly the same</b>, because P = ρ g h only cares about depth. This is the <b>hydrostatic paradox</b>, noticed by Simon Stevin in 1586. A huge tank on your roof gives the same tap pressure as a small one at the same height. It just lasts longer.</p>
    <p class="tip"><b>Try it:</b> let the tyre down to zero and count the molecules. Take the suction cup to Mars. Send the cup to the bottom of the trench. Change the depth of the three vessels and check the gauges.</p>`,
  terms: [
    { t: 'Absolute pressure', d: 'Pressure measured from a perfect vacuum. Air at sea level is about 101 kPa absolute.' },
    { t: 'Gauge pressure', d: 'Pressure above the surrounding air, as a tyre gauge shows. Absolute = gauge + 1 atm.' },
    { t: 'Suction', d: 'Not a pull at all: lower pressure on one side lets the higher pressure on the other side push.' },
    { t: 'Hydrostatic paradox', d: 'The pressure at the bottom of a liquid depends only on depth, not on the container’s shape or size.' },
    { t: 'Bathyscaphe', d: 'A deep-diving craft with a thick steel crew sphere and a float of petrol, like the Trieste.' },
  ],
  defaults: { focus: 'gauge', gp: 2.2, where: 'sea', depth: 10935, h: 0.5 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'gauge', label: 'Flat tyre' }, { v: 'vacuum', label: 'Suction' }, { v: 'trench', label: 'Deep sea' }, { v: 'paradox', label: 'Paradox' }] },
    { key: 'gp', type: 'range', label: 'Flat tyre: what the gauge reads', min: 0, max: 3, step: 0.1, ends: ['0 (flat)', '3 bar'], fmt: (v) => fmt(v, 1) + ' bar' },
    { key: 'where', type: 'seg', label: 'Suction: where is the cup?', options: Object.entries(WHERE).map(([v, w]) => ({ v, label: w.name.split(',')[0].replace(' summit', '') })) },
    { key: 'depth', type: 'range', label: 'Deep sea: depth', min: 0, max: 10935, step: 5, ends: ['surface', '10,935 m'], fmt: (v) => fmt(v, 0) + ' m' },
    { key: 'h', type: 'range', label: 'Paradox: water depth in all three', min: 0.05, max: 0.6, step: 0.01, ends: ['5 cm', '60 cm'], fmt: (v) => fmt(v * 100, 0) + ' cm' },
  ],
  onChange(s, key) {
    if (key === 'gp') s.focus = 'gauge';
    if (key === 'where') s.focus = 'vacuum';
    if (key === 'depth') s.focus = 'trench';
    if (key === 'h') s.focus = 'paradox';
  },
  quiz: [
    { q: 'A tyre gauge reads 0. What is the pressure of the air inside the tyre?', options: ['Zero: it is empty', 'About 1 atm, the same as the air outside', 'About 2.2 bar', 'Below zero'], answer: 1, why: 'Gauges read the pressure above the air around them. Zero on the gauge means 1 atm absolute: still full of air, just no extra.' },
    { q: 'Why would a suction cup fall off a wall on Mars?', options: ['Mars’ gravity is stronger', 'There is almost no air outside to push it on', 'The cold makes rubber slippery', 'Vacuum pulls less on Mars'], answer: 1, why: 'Suction cups are held by the outside air’s pressure × area. Mars’ air is about 0.6 kPa, under 1% of Earth’s.' },
    { q: 'Three tanks of different widths are filled to the same depth. Where is the pressure at the bottom highest?', options: ['In the widest tank', 'In the narrowest tank', 'It is the same in all three', 'In whichever holds the most water'], answer: 2, why: 'P = ρ g h depends only on depth. That is the hydrostatic paradox.' },
  ],
  reel: [
    { ms: 5200, caption: 'A “flat” tyre isn’t empty: it still holds air at 1 atmosphere. Gauges only show the extra.', set: { focus: 'gauge' }, anim: { gp: [2.2, 0] }, view: REEL.gauge, spin: 0 },
    { ms: 5000, caption: 'At the bottom of the Mariana Trench the sea presses at about 1,086 bar, a tonne on every square centimetre.', set: { focus: 'trench' }, anim: { depth: [0, 10935] }, view: REEL.trench, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gG = new THREE.Group(), gV = new THREE.Group(), gT = new THREE.Group(), gP = new THREE.Group(); root.add(gG, gV, gT, gP);
    gV.position.x = VX; gT.position.x = TX; gP.position.x = PX;

    // ------------------------------------------------ tyre, gauge and two sample cubes
    const tyre = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.09, 20, 64), M.matte(0x3a3e46)); tyre.position.set(-0.05, 0.36, 0); gG.add(tyre);
    const rimG = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 32), M.metal(0xb7bfcc)); rimG.rotation.x = Math.PI / 2; rimG.position.copy(tyre.position); gG.add(rimG);
    const cubes = [-1, 1].map((i) => {
      const g = new THREE.Group(); g.position.set(0.55 + i * 0.28 + 0.2, 0.5, 0); gG.add(g);
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), M.clear(i < 0 ? 0x7be08c : 0x8ef0ff, 0.1)); g.add(c);
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(c.geometry), new THREE.LineBasicMaterial({ color: i < 0 ? 0x7be08c : 0x8ef0ff })); g.add(e);
      const gas = makeGas(260, 0.19, 0.19, 0.19, i < 0 ? 0x7be08c : 0x8ef0ff, 0.009); g.add(gas); g.gas = gas;
      return g;
    });
    const lIn = stage.label('', [0.47, 0.8, 0], gG, 'hot'), lOut = stage.label('air outside: 1 atm', [1.03, 0.8, 0], gG);
    lIn.element.style.setProperty('--c', COL.a);
    const zoom = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.17, 0.4, 0), new THREE.Vector3(0.27, 0.5, 0)]), new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.02, gapSize: 0.015 })); zoom.computeLineDistances(); gG.add(zoom);

    // ------------------------------------------------ suction cup on a wall
    const wallV = box(0.05, 0.9, 0.8, M.matte(0xe8e4dc)); wallV.position.set(-0.03, 0.45, 0); gV.add(wallV);
    const cup = latheX([[0, 0.03], [0.012, 0.022], [0.02, 0.008], [0.04, 0.007]], M.plastic(0xa8d8ff, { transparent: true, opacity: 0.8, roughness: 0.2 }), { seg: 32 }); cup.position.set(0, 0.62, 0); gV.add(cup);
    const hook = torus(0.012, 0.003, M.metal(0xc9ced8), 16); hook.position.set(0.05, 0.6, 0); gV.add(hook);
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 1, 6), M.matte(0x5b4a36)); gV.add(rope);
    const bagV = box(0.12, 0.14, 0.08, M.matte(0xd8332f)); gV.add(bagV);
    const pushA = arrowSet(6, 0x8ef0ff, 0.004, 0.018); gV.add(pushA);
    const floorV = box(0.8, 0.02, 0.8, M.matte(0x9aa3b2)); floorV.position.set(0.3, -0.01, 0); gV.add(floorV);
    const lV = stage.label('', [0, 0, 0], gV, 'hot'); lV.element.style.setProperty('--c', COL.p);

    // ------------------------------------------------ the deep sea, 1:4,000, with Trieste and a foam cup
    const H = DEEP.h * DEEP.S;
    const col = new THREE.Mesh(new THREE.BoxGeometry(1.2, H, 0.6), M.clear(0x0b2d5c, 0.45)); col.position.set(0, -H / 2 + H, 0); gT.add(col);
    const depthL = [];
    for (let d = 0; d <= 10000; d += 2000) { depthL.push(stage.label(`${fmt(d, 0)} m · ${fmt(deepP(d) / BAR, 0)} bar`, [1.05, H - d * DEEP.S, 0.3], gT)); depthL[depthL.length - 1].center.set(0, 0.5); const t = box(0.14, 0.006, 0.006, M.glow(0xffffff)); t.position.set(0.66, H - d * DEEP.S, 0.3); gT.add(t); }
    const trieste = new THREE.Group(); gT.add(trieste);
    const float = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.26, 4, 16), M.plastic(0xe7e3d6)); float.rotation.z = Math.PI / 2; trieste.add(float);
    const tower = box(0.04, 0.05, 0.03, M.plastic(0xe7e3d6)); tower.position.y = 0.07; trieste.add(tower);
    const ball = sphere(0.04, M.metal(0x6b7280), 20); ball.position.y = -0.09; trieste.add(ball);
    const cupF = latheX([[0, 0.08], [0.25, 0.11]], M.matte(0xf7f7f2, { side: THREE.DoubleSide }), { seg: 28 }); cupF.rotation.z = Math.PI / 2;
    const cupG = new THREE.Group(); cupG.add(cupF); gT.add(cupG);
    const cupRef = latheX([[0, 0.08], [0.25, 0.11]], M.ghost(0xffffff, 0.15), { seg: 28 }); cupRef.rotation.z = Math.PI / 2; gT.add(cupRef);
    cupRef.position.set(0.3, H - 0.3, 0.1); const lCupRef = stage.label('cup before', [0.3, H + 0.02, 0.1], gT);
    const thumb = arrowSet(1, 0xff5a8a, 0.01, 0.04); gT.add(thumb);
    const lT = stage.label('', [0, 0, 0], gT, 'hot'); lT.element.style.setProperty('--c', COL.hot);

    // ------------------------------------------------ three vessels, one depth
    const glassM = M.clear(0xdff3ff, 0.18, { side: THREE.DoubleSide });
    const vessels = VESSELS.map((v, i) => {
      const g = new THREE.Group(); g.position.set(-0.05 + i * 0.4, 0.06, 0); gP.add(g);
      const shell = latheX([[0, 0.05], [0.62, v.top]], glassM, { seg: 40 }); shell.rotation.z = Math.PI / 2; g.add(shell);
      const water = latheX([[0, 0.048], [1, 0.048]], waterMat(), { seg: 40 }); water.rotation.z = Math.PI / 2; g.add(water); g.water = water;
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 10), M.metal(0x8c95a3)); pipe.position.set(0, -0.03, 0.0); g.add(pipe);
      const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 24), M.plastic(0xf2f2f2)); dial.rotation.x = Math.PI / 2; dial.position.set(0, -0.03, 0.07); g.add(dial);
      const needle = box(0.003, 0.028, 0.002, M.matte(0xd8332f)); needle.position.set(0, -0.03, 0.078); g.add(needle); g.needle = needle;
      g.lbl = stage.label('', [0, -0.12, 0.1], g, 'hot'); g.lbl.element.style.setProperty('--c', COL.p);
      g.v = v; return g;
    });
    const shelf = box(1.3, 0.03, 0.3, M.matte(0x4a3320)); shelf.position.set(0.35, -0.005, 0); gP.add(shelf);

    // ------------------------------------------------ board
    let cur = null;
    const chart = board(root, 1.6, 1.0, 800, 500, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur) return;
      const f = cur.f;
      if (f === 'gauge') {
        title(g, 'Gauge vs absolute pressure', 'absolute = gauge + 1 atm');
        const A = axes(g, w, h, { x0: 100, y1: 80, xMax: 3, yMax: 4.5, xTicks: [0, 1, 2, 3], yTicks: [0, 1, 2, 3, 4], xFmt: (v) => v + ' bar', yFmt: (v) => v + ' bar', xLabel: 'gauge reads →', yLabel: 'absolute ↑' });
        line(g, [[0, ATM / BAR], [3, 3 + ATM / BAR]], A.X, A.Y, COL.a, 5);
        line(g, [[0, 0], [3, 3]], A.X, A.Y, 'rgba(255,255,255,.3)', 2, [6, 6]);
        tag(g, 'if gauges read from vacuum', A.X(1.6), A.Y(1.2), COL.dim, '15px sans-serif');
        dot(g, A.X(cur.gp), A.Y(cur.gp + ATM / BAR), COL.hot, 11);
        tag(g, 'flat: still 1 atm inside', A.X(0) + 14, A.Y(ATM / BAR) + 26, COL.hot, '16px sans-serif');
      } else if (f === 'vacuum') {
        title(g, 'Most a 6 cm suction cup can hold', 'outside air pressure × area');
        logBars(g, { x0: 40, x1: 620, y0: 100, rowH: 64, lo: 0, hi: 3, fmtV: (v) => fmt(v, v < 10 ? 1 : 0) + ' N', rows: Object.entries(WHERE).map(([k, q]) => ({ name: q.name, v: Math.max(1, q.P * CUP.A), col: k === cur.where ? COL.p : 'rgba(142,240,255,.35)' })), marks: [{ v: CUP.load * (WHERE[cur.where].g || G), name: 'the 5 kg bag, here', col: COL.f }] });
        g.font = '15px sans-serif'; g.fillStyle = 'rgba(255,255,255,.5)'; g.fillText('log scale; the Moon is shown at 1 N but is really 0', 40, h - 18);
      } else if (f === 'trench') {
        title(g, 'Pressure in the ocean', 'about 1 bar more every 10 m');
        const A = axes(g, w, h, { x0: 100, y1: 80, xMax: 1200, yMin: -11000, yMax: 0, xTicks: [0, 300, 600, 900, 1200], yTicks: [0, -2500, -5000, -7500, -10000], xFmt: (v) => v + ' bar', yFmt: (v) => fmt(-v / 1000, 1) + ' km', xLabel: 'pressure →', yLabel: 'depth ↓' });
        line(g, [[1, 0], [deepP(DEEP.h) / BAR, -DEEP.h]], A.X, A.Y, COL.p, 5);
        dot(g, A.X(deepP(cur.depth) / BAR), A.Y(-cur.depth), COL.hot, 11);
        [[3800, 'Titanic wreck, 3,800 m'], [10935, 'Challenger Deep']].forEach(([d, n]) => tag(g, n, A.X(deepP(d) / BAR) - 230, A.Y(-d) + 6, COL.dim, '15px sans-serif'));
      } else {
        title(g, 'Same depth, same pressure', 'but very different amounts of water');
        VESSELS.forEach((v, i) => {
          const r2 = 0.05 + (v.top - 0.05) * (cur.h / 0.62), vol = frustum(cur.h, 0.05, r2), y = 110 + i * 110;
          g.font = 'bold 20px sans-serif'; g.fillStyle = '#e8eef8'; g.fillText(v.name, 30, y);
          g.fillStyle = COL.water; g.fillRect(30, y + 12, Math.min(420, vol * 1000 * 12), 22); g.fillStyle = '#e8eef8'; g.font = '18px sans-serif'; g.fillText(`${fmt(vol * 1000, 1)} litres`, 40 + Math.min(420, vol * 1000 * 12), y + 30);
          g.fillStyle = COL.p; g.font = 'bold 20px sans-serif'; g.fillText(fmtP(RHO_W * G * cur.h), 640, y + 30);
        });
        g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('bottom pressure →', 600, 90);
      }
    }, [0, 0, 0]);
    const BOARD = { gauge: [1.75, 0.75, -0.4, 0.55, -0.45], vacuum: [VX + 0.15, 0.72, -0.6, 0.34, -0.5], trench: [TX - 2.1, 0.75, -0.4, 0.95, 0.4], paradox: [PX + 1.3, 0.55, -0.3, 0.5, -0.45] };
    const RB = { gauge: [0.45, 1.3, -0.5, 0.7, 0], paradox: [PX + 0.35, 1.2, -0.4, 0.75, 0], trench: [TX, 3.4, -0.7, 1.4, 0] };

    const st = {};
    let lastBoard = '', gpNow = 2.2, fall = 0, vy = 0, dNow = 10935, hNow = 0.5, shrink = 1;
    return {
      update(dt, s, time) {
        dt = Math.max(0, dt);
        focusView(stage, st, s.focus, VIEWS);
        const narrow = fitNarrow(stage, [lOut, lCupRef, ...depthL]);
        const f = s.focus;
        gG.visible = f === 'gauge'; gV.visible = f === 'vacuum'; gT.visible = f === 'trench'; gP.visible = f === 'paradox';
        placeBoard(chart, f, BOARD, RB, narrow);
        if (f === 'gauge') {
          gpNow = approach(gpNow, s.gp, 4, dt);
          const abs = gpNow + ATM / BAR;
          cubes[0].gas.show = Math.round(60 * abs); cubes[1].gas.show = 60;
          cubes.forEach((c) => c.gas.step(dt, 0.35));
          tyre.scale.set(1, 1, 0.75 + 0.25 * Math.min(1, gpNow / 1.5));
          lIn.element.innerHTML = `inside the tyre: <b>${fmt(abs, 2)} bar</b>`;
        } else if (f === 'vacuum') {
          const w = WHERE[s.where], hold = w.P * CUP.A, W = CUP.load * (w.g || G), holds = hold >= W;
          if (holds) { fall = approach(fall, 0, 8, dt); vy = 0; }
          else { vy += (w.g || G) * dt * 0.5; fall = Math.min(0.62, fall + vy * dt); }
          cup.position.set(0, 0.62 - fall, 0); hook.position.set(0.05, 0.6 - fall, 0);
          const rTop = 0.59 - fall, rBot = Math.max(0.1, 0.33 - fall);
          rope.scale.y = Math.max(0.001, rTop - rBot - 0.07); rope.position.set(0.05, (rTop + rBot + 0.07) / 2, 0);
          bagV.position.set(0.05, Math.max(0.07, rBot), 0);
          pushA.list.forEach((a, i) => { const th = (i / 6) * TAU; a.aim([0.16, 0.62 - fall + Math.cos(th) * 0.03, Math.sin(th) * 0.03], [-1, 0, 0], 0.02 + (w.P / ATM) * 0.1); });
          lV.position.set(0.12, 0.78, 0); lV.element.innerHTML = `${w.name}: holds up to <b>${fmtN(hold)}</b> · ${holds ? 'stays on' : 'falls off'}`;
        } else if (f === 'trench') {
          dNow = approach(dNow, s.depth, 2.5, dt);
          const y = H - dNow * DEEP.S, P = deepP(dNow);
          trieste.position.set(-0.15, y - 0.02, 0);
          shrink = cupShrink(P - ATM);
          cupG.position.set(0.35, y - 0.12, 0.1); cupG.scale.setScalar(shrink);
          thumb.list[0].aim([-0.3, y + 0.3, 0], [0, -1, 0], 0.08 + (P / DEEP.P) * 0.2);
          lT.position.set(0.1, y + 0.25, 0); lT.element.innerHTML = `${fmt(dNow, 0)} m: <b>${fmt(P / BAR, 0)} bar</b> · ${fmt((P * 1e-4) / G, 0)} kg on each cm²`;
        } else {
          hNow = approach(hNow, s.h, 4, dt);
          vessels.forEach((g) => {
            const r2 = 0.048 + (g.v.top - 0.05) * (hNow / 0.62);
            g.water.geometry.dispose();
            const pts = [[0, 0], [0, 0.048], [hNow, Math.max(0.008, r2 - 0.002)], [hNow, 0]].map(([x, r]) => new THREE.Vector2(Math.max(0, r), x));
            g.water.geometry = new THREE.LatheGeometry(pts, 40); g.water.rotation.z = 0;
            const P = RHO_W * G * hNow;
            g.needle.rotation.z = -1.2 + (P / (RHO_W * G * 0.6)) * 2.4;
            g.lbl.element.innerHTML = `<b>${fmtP(P)}</b>`;
          });
        }
        const bk = `${f}|${s.gp}|${s.where}|${s.depth}|${s.h}`;
        if (bk !== lastBoard) { lastBoard = bk; cur = { f, gp: s.gp, where: s.where, depth: s.depth, h: s.h }; chart.redraw(); }
      },
      readout(s) {
        const f = s.focus;
        if (f === 'gauge') {
          const abs = s.gp * BAR + ATM;
          return `<div class="big">${fmt(abs / BAR, 2)} bar inside, absolute</div>
            <div class="row"><span>Gauge reads</span><b>${fmt(s.gp, 1)} bar</b></div>
            <div class="row"><span>Plus the air around it</span><b>+ 1.01 bar</b></div>
            <div class="row"><span>Air molecules, compared with outside</span><b>${fmt(abs / ATM, 1)}×</b></div>
            <small>${s.gp < 0.05 ? 'Flat, but not empty: it holds exactly as much air as the room.' : 'The gauge only shows the extra above the air.'}</small>`;
        }
        if (f === 'vacuum') {
          const w = WHERE[s.where], hold = w.P * CUP.A, W = CUP.load * (w.g || G);
          return `<div class="big">${hold >= W ? 'It holds' : 'It falls'}: ${fmtN(hold)} max</div>
            <div class="row"><span>Air pressure here (${w.name})</span><b>${fmtP(w.P)}</b></div>
            <div class="row"><span>Cup area, 6 cm across</span><b>${fmt(CUP.A * 1e4, 0)} cm²</b></div>
            <div class="row"><span>5 kg bag’s weight here</span><b>${fmtN(W)}</b></div>
            <small>Best case, a perfect seal and no air left inside. Nothing pulls: the air pushes.</small>`;
        }
        if (f === 'trench') {
          const P = deepP(s.depth);
          return `<div class="big">${fmt(P / BAR, 0)} bar at ${fmt(s.depth, 0)} m</div>
            <div class="row"><span>Force on a 1 cm² thumbnail</span><b>${fmtN(P * 1e-4)}</b></div>
            <div class="row"><span>That is the weight of</span><b>${fmt((P * 1e-4) / G, 0)} kg</b></div>
            <div class="row"><span>Foam cup shrinks to about</span><b>${fmt(cupShrink(P - ATM) * 100, 0)}% size</b></div>
            <small>Trieste, 1960: Piccard and Walsh reached about 10,900 m in a 12.7 cm thick steel sphere.</small>`;
        }
        const P = RHO_W * G * s.h;
        return `<div class="big">${fmtP(P)} in all three</div>
          <div class="row"><span>Depth</span><b>${fmt(s.h * 100, 0)} cm</b></div>
          <div class="row"><span>P = ρ g h</span><b>1,000 × 9.81 × ${fmt(s.h, 2)}</b></div>
          <div class="row"><span>Force on each 10 cm base</span><b>${fmtN(P * Math.PI * 0.05 * 0.05)}</b></div>
          <small>The wide one holds much more water, but the extra weight rests on its sloping walls.</small>`;
      },
    };
  },
};
