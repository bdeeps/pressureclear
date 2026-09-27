// Chapter 1: pressure as a quantity. P = F ÷ A, in pascals (1 Pa = 1 N/m², SI Brochure, BIPM 2019).
// Lab: a steel plate of area A pressed into a tray of dry sand with force F. How far it sinks is shown
//   with a simple saturating model, d = 10 cm × (1 − e^(−P ÷ 60 kPa)): illustrative, not a soil law,
//   but it has the right shape: more pressure, deeper, until the plate is buried.
// Brick: a common clay brick, 230 × 110 × 75 mm (the traditional Indian size; IS 1077 modular bricks
//   are 190 × 90 × 90 mm). Burnt clay is about 1,700–1,900 kg/m³, so it is about 3.2 kg and weighs
//   31 N. Flat 253 cm² → 1.2 kPa; on its side 173 cm² → 1.8 kPa; on its end 83 cm² → 3.8 kPa.
//   It sits on soft foam: d = 3 cm × (1 − e^(−P ÷ 3 kPa)), again illustrative.
// Stiletto vs elephant: a person balancing on one heel for a moment (every step puts the whole weight
//   on the heel at heel-strike, briefly even more). A stiletto tip is about 1 cm²; worn to the metal
//   pin, about 0.5 cm². An Asian elephant of 4,000 kg has feet about 40 cm across (≈ 0.126 m² each),
//   so it stands at about 80 kPa on four feet and 160 kPa walking on two. Softwood floors crush across
//   the grain at a few MPa (USDA Wood Handbook, compression perpendicular to grain, pine ≈ 3–5 MPa;
//   4 MPa is used here), which is why stilettos dent floors and elephants (on wood) wouldn't.
import { THREE, M, box, sphere, torus } from '../kit.js';
import {
  G, ATM, board, panelBg, title, axes, line, dot, tag, logBars, unitsList, COL, fitNarrow, inReel, focusView, placeBoard,
  force, makeBed, makePerson, disc, fmt, fmtP, fmtN, fmtArea, clamp, approach,
} from '../pressure.js';

const BX = 20, HX = 40;
const BRICK = { L: 0.23, W: 0.11, H: 0.075, m: 3.2 };
const FACES = [
  { id: 'flat', name: 'flat', a: BRICK.L * BRICK.W, dims: [BRICK.L, BRICK.H, BRICK.W] },
  { id: 'side', name: 'on its side', a: BRICK.L * BRICK.H, dims: [BRICK.L, BRICK.W, BRICK.H] },
  { id: 'end', name: 'on its end', a: BRICK.W * BRICK.H, dims: [BRICK.H, BRICK.L, BRICK.W] },
];
const HEELS = { stiletto: { a: 1e-4, name: 'stiletto, 1 cm²' }, pin: { a: 0.5e-4, name: 'worn to the pin, 0.5 cm²' }, block: { a: 9e-4, name: 'block heel, 9 cm²' }, flat: { a: 150e-4, name: 'flat trainer, 150 cm²' } };
const ELE = { m: 4000, foot: Math.PI * 0.2 * 0.2 };
const WOOD_CRUSH = 4e6;
const TRAY_TOP = 0.12;
export const sandDepth = (P) => 0.1 * (1 - Math.exp(-P / 60e3));
const foamDepth = (P) => 0.03 * (1 - Math.exp(-P / 3e3));
export const heelP = (s) => (s.person * G) / HEELS[s.heel].a;
export const eleP = (s) => (ELE.m * G) / (ELE.foot * (s.walk ? 2 : 4));

const VIEWS = {
  lab: { pos: [0.55, 1.25, 2.15], target: [0.5, 0.38, -0.1] },
  brick: { pos: [BX + 0.15, 0.8, 1.5], target: [BX + 0.2, 0.1, -0.05] },
  heel: { pos: [HX + 0.1, 1.7, 4.6], target: [HX + 0.75, 0.95, 0] },
};
const REEL = {
  lab: { pos: [0.06, 1.3, 1.05], target: [0.1, 0.82, 0] },
  heel: { pos: [HX + 0.35, 1.6, 2.2], target: [HX + 0.35, 1.25, 0] },
};

export default {
  id: 'idea',
  short: 'P = F ÷ A',
  title: 'Pressure: how concentrated a push is',
  subtitle: 'The same force on a small area presses far harder than on a big one.',
  view: VIEWS.lab,
  learn: `<p>Stand on sand in flat shoes and you barely sink. Stand on one heel and you go straight in. Your <b>weight</b> didn't change: what changed was the <b>area</b> it was spread over. <b>Pressure</b> is force divided by area: <b>P = F ÷ A</b>.</p>
    <p>Its SI unit is the <b>pascal</b> (Pa): one newton spread over one square metre. That is tiny, about the pressure of a banknote lying on a table, so we usually meet <b>kilopascals</b> (kPa). The air around you presses at about <b>101 kPa</b>, which is called <b>one atmosphere</b>. Other units you will see: <b>bar</b> (tyres, 100 kPa), <b>psi</b> (pounds per square inch) and <b>mmHg</b> (blood pressure).</p>
    <p>To <b>measure</b> it, you can divide a force by the area it pushes on, or use a <b>pressure gauge</b>: a spring or a bendy tube that moves further the harder it is pushed.</p>
    <p>A brick weighs the same whichever way up it sits, but on its end it presses three times harder. And a person in a <b>stiletto</b> presses the floor far harder than an <b>elephant</b>: 588 N on 1 cm² beats 39,000 N on half a square metre. Pressure is also the idea behind <b>Pascal's principle</b> (PascalClear), <b>Bernoulli</b> (BernoulliClear) and the <b>gas laws</b> (GasLawClear).</p>
    <p class="tip"><b>Try it:</b> keep the force the same and shrink the area: watch the plate sink and the pressure shoot up. Then turn the brick onto its end, and put the elephant against the stiletto.</p>`,
  terms: [
    { t: 'Pressure', d: 'Force divided by the area it acts on, P = F ÷ A. It says how concentrated a push is.' },
    { t: 'Pascal (Pa)', d: 'The SI unit of pressure: one newton on one square metre. 1 kPa = 1,000 Pa.' },
    { t: 'Bar', d: '100,000 Pa, about the pressure of the air at sea level. Used for tyres and pressure cookers.' },
    { t: 'Atmosphere (atm)', d: '101,325 Pa, the average air pressure at sea level.' },
    { t: 'psi', d: 'Pounds-force per square inch. 1 psi ≈ 6.9 kPa, so 14.7 psi ≈ 1 atm.' },
    { t: 'mmHg', d: 'Millimetres of mercury, used for blood pressure. 760 mmHg = 1 atm.' },
  ],
  defaults: { focus: 'lab', F: 500, A: 100, face: 'flat', bricks: 1, person: 60, heel: 'stiletto', walk: false },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'lab', label: 'Sand tray' }, { v: 'brick', label: 'Brick' }, { v: 'heel', label: 'Heel vs elephant' }] },
    { key: 'F', type: 'log', label: 'Sand: force pushing down', min: 10, max: 2000, ends: ['10 N', '2,000 N'], fmt: (v) => fmtN(v) + ` (≈ ${fmt(v / G, v / G < 10 ? 1 : 0)} kg)` },
    { key: 'A', type: 'log', label: 'Sand: area of the plate', min: 5, max: 1000, ends: ['5 cm²', '1,000 cm²'], fmt: (v) => fmt(v, v < 10 ? 1 : 0) + ' cm²' },
    { key: 'face', type: 'seg', label: 'Brick: which face is down?', options: FACES.map((f) => ({ v: f.id, label: f.name })) },
    { key: 'bricks', type: 'range', label: 'Brick: how many stacked', min: 1, max: 3, step: 1, ends: ['1', '3'], fmt: (v) => String(v) },
    { key: 'person', type: 'range', label: 'Heel: the person’s mass', min: 40, max: 100, step: 1, ends: ['40 kg', '100 kg'], fmt: (v) => v + ' kg' },
    { key: 'heel', type: 'seg', label: 'Heel: the shoe', options: [{ v: 'stiletto', label: 'Stiletto' }, { v: 'pin', label: 'Worn pin' }, { v: 'block', label: 'Block' }, { v: 'flat', label: 'Trainer' }] },
    { key: 'walk', type: 'toggle', label: 'Elephant: walking (two feet down)' },
  ],
  onChange(s, key) {
    if (['F', 'A'].includes(key)) s.focus = 'lab';
    if (['face', 'bricks'].includes(key)) s.focus = 'brick';
    if (['person', 'heel', 'walk'].includes(key)) s.focus = 'heel';
  },
  quiz: [
    { q: 'A 600 N person stands on 0.04 m² of shoe sole. What pressure do they put on the floor?', options: ['24 Pa', '15 kPa', '600 kPa', '0.04 Pa'], answer: 1, why: 'P = F ÷ A = 600 ÷ 0.04 = 15,000 Pa, or 15 kPa.' },
    { q: 'A brick is turned from lying flat onto its small end. What happens to the pressure under it?', options: ['It stays the same, it is the same brick', 'It goes down', 'It goes up, because the same weight sits on a smaller area', 'It becomes zero'], answer: 2, why: 'The weight is unchanged, but the area shrinks about three times, so the pressure goes up about three times.' },
    { q: 'Why can a stiletto heel dent a wooden floor that an elephant could walk on?', options: ['Shoes are harder than feet', 'The heel puts the weight on a tiny area, so its pressure is far higher', 'Elephants are lighter than they look', 'Wood is stronger under big weights'], answer: 1, why: 'About 588 N on 1 cm² is 5.9 MPa. An elephant spreads 39,000 N over four big feet: about 80 kPa, some 75 times less.' },
  ],
  reel: [
    { ms: 5400, caption: 'Pressure is force divided by area: the same push on a smaller plate sinks far deeper.', set: { focus: 'lab', F: 400 }, anim: { A: [600, 8, true] }, view: REEL.lab, spin: 0 },
    { ms: 5200, caption: 'A 60 kg person on a stiletto presses about 75 times harder than a standing elephant.', set: { focus: 'heel', person: 60, heel: 'stiletto', walk: false }, view: REEL.heel, spin: 0.4 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gL = new THREE.Group(), gB = new THREE.Group(), gH = new THREE.Group(); root.add(gL, gB, gH);
    gB.position.x = BX; gH.position.x = HX;

    // ------------------------------------------------ sand tray and plate
    const tray = makeBed(1.0, 0.7, { seg: 110, thick: TRAY_TOP }); tray.position.y = TRAY_TOP; gL.add(tray);
    const rimM = M.matte(0x5b4a36);
    [[0, 0.37, 1.06, 0.04], [0, -0.37, 1.06, 0.04]].forEach(([x, z, w, d]) => { const b = box(w, TRAY_TOP + 0.04, d, rimM); b.position.set(x, (TRAY_TOP + 0.04) / 2, z); gL.add(b); });
    [[0.52, 0], [-0.52, 0]].forEach(([x]) => { const b = box(0.04, TRAY_TOP + 0.04, 0.78, rimM); b.position.set(x, (TRAY_TOP + 0.04) / 2, 0); gL.add(b); });
    const plate = box(1, 0.02, 1, M.metal(0x9aa3b2)); gL.add(plate);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 12), M.metal(0xc9ced8)); gL.add(rod);
    const aF = force(0xffb547, 0.018, 0.07); gL.add(aF);
    const lF = stage.label('', [0, 0, 0], gL), lP = stage.label('', [0, 0, 0], gL, 'hot'); lP.element.style.setProperty('--c', COL.p);

    // ------------------------------------------------ bricks on foam
    const foam = makeBed(0.9, 0.5, { color: 0xe8d9a8, side: 0xcdbb86, seg: 150, thick: 0.05, rim: 0.012 }); foam.position.y = 0.05; gB.add(foam);
    const brickM = M.matte(0xb5532f, { roughness: 0.9 });
    const bricks = FACES.map((f, i) => { const g = new THREE.Group(); g.position.x = -0.3 + i * 0.3; gB.add(g); g.stack = [0, 1, 2].map(() => { const b = box(...f.dims, brickM); g.add(b); const line2 = box(f.dims[0] + 0.002, 0.004, f.dims[2] + 0.002, M.matte(0xe7dcc6)); b.add(line2); line2.position.y = -f.dims[1] / 2 + 0.002; return b; }); return g; });
    const lBr = FACES.map((f, i) => stage.label('', [-0.3 + i * 0.3, 0.3, 0], gB));

    // ------------------------------------------------ stiletto vs elephant on a wooden floor
    const floor = box(3.4, 0.05, 1.4, M.matte(0xb88a55, { roughness: 0.6 })); floor.position.set(0.5, 0.025, 0); gH.add(floor);
    for (let i = 0; i < 8; i++) { const seam = box(3.4, 0.003, 0.004, M.matte(0x7a5732)); seam.position.set(0.5, 0.051, -0.7 + i * 0.175); gH.add(seam); }
    // The walker: a person on one stiletto (the other foot lifted mid-step).
    const walker = makePerson({ shirt: 0xc2185b, pants: 0x23202a, skin: 0xa8714c }); walker.position.set(-0.35, 0.12, 0.05); walker.rotation.y = -0.5; gH.add(walker);
    walker.pose({ stride: 0.3, arm: 0.15 });
    const heelPin = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.012, 0.1, 12), M.matte(0x111111)); gH.add(heelPin);
    heelPin.position.set(-0.43, 0.1, 0.1);
    const dent = new THREE.Mesh(new THREE.CircleGeometry(1, 24), M.matte(0x3b2714)); dent.rotation.x = -Math.PI / 2; dent.position.set(-0.43, 0.052, 0.1); gH.add(dent);
    // The elephant's front leg and foot: 40 cm across, grey, with toenails.
    const eleM = M.matte(0x8a8f96, { roughness: 0.95 });
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 2.2, 32), eleM); leg.position.set(1.2, 0.05 + 1.1, 0); leg.castShadow = true; gH.add(leg);
    for (let i = 0; i < 6; i++) { const wr = torus(0.19, 0.008, M.matte(0x767b82), 32); wr.rotation.x = Math.PI / 2; wr.position.set(1.2, 0.25 + i * 0.14, 0); gH.add(wr); }
    const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 2.2, 32), eleM); leg2.position.set(1.75, 1.1, -0.9); gH.add(leg2);
    for (let i = 0; i < 4; i++) { const a = -0.7 + i * 0.47; const n = sphere(0.035, M.matte(0xe6dccb), 12); n.scale.set(1, 0.7, 1); n.position.set(1.2 + Math.cos(a) * 0.2, 0.08, Math.sin(a) * 0.2 + 0.0); n.position.x -= 0; gH.add(n); }
    const aHeel = force(0xff5a8a, 0.02, 0.08), aEle = force(0xffb547, 0.05, 0.16); gH.add(aHeel, aEle);
    const lHeel = stage.label('', [-0.43, 0.3, 0.5], gH, 'hot'), lEle = stage.label('', [1.2, 1.5, 0.5], gH);
    lHeel.element.style.setProperty('--c', COL.hot);

    // ------------------------------------------------ board: chart + units
    let cur = null;
    const chart = board(root, 2.0, 1.04, 1000, 520, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur) return;
      const { f, P } = cur;
      if (f === 'lab') {
        title(g, `P = F ÷ A, with F = ${fmtN(cur.F)}`, 'shrink the area and pressure climbs');
        const A = axes(g, w, h, { x0: 90, x1: 600, y0: h - 70, y1: 90, xMin: Math.log10(5), xMax: 3, yMin: 2, yMax: 7, logX: true, logY: true, xTicks: [5, 10, 100, 1000], yTicks: [1e2, 1e3, 1e4, 1e5, 1e6, 1e7], xFmt: (v) => v + ' cm²', yFmt: fmtP, xLabel: 'area →' });
        const pts = []; for (let e = Math.log10(5); e <= 3.001; e += 0.02) { const a = 10 ** e; pts.push([a, cur.F / (a * 1e-4)]); }
        line(g, pts.map(([a, p]) => [a, clamp(p, 100, 1e7)]), A.X, A.Y, COL.p, 5);
        g.strokeStyle = 'rgba(255,181,71,.5)'; g.setLineDash([6, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(A.X(5), A.Y(ATM)); g.lineTo(A.X(1000), A.Y(ATM)); g.stroke(); g.setLineDash([]);
        tag(g, 'the air: 1 atm', A.X(400), A.Y(ATM) - 8, COL.f, '15px sans-serif');
        dot(g, A.X(cur.A), A.Y(P), COL.hot, 11);
      } else if (f === 'brick') {
        title(g, 'One brick, three faces', `weight ${fmtN(cur.W)} every time`);
        FACES.forEach((q, i) => {
          const p = cur.W / q.a, y = 110 + i * 110, bw = (p / 12e3) * 480;
          g.globalAlpha = q.id === cur.face ? 1 : 0.45;
          g.fillStyle = COL.p; g.fillRect(40, y, Math.max(4, bw), 44);
          g.font = 'bold 20px sans-serif'; g.fillStyle = '#e8eef8'; g.fillText(`${q.name}: ${fmtArea(q.a)}`, 40, y - 10);
          g.fillStyle = COL.p; g.fillText(fmtP(p), 50 + bw, y + 30);
          g.globalAlpha = 1;
        });
        g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('Smallest face down: biggest pressure.', 40, h - 30);
      } else {
        title(g, 'Who presses harder?', 'log scale: each line is 10× more');
        logBars(g, { x0: 40, x1: 540, y0: 110, rowH: 70, lo: 3, hi: 8, rows: [
          { name: HEELS[cur.heel].name, v: cur.P, col: COL.hot },
          { name: `elephant, ${cur.walk ? 'walking' : 'standing'}`, v: cur.Pe, col: COL.f },
          { name: 'air around you', v: ATM, col: COL.p, dim: true },
          { name: 'car tyre on the road', v: 2.2e5, col: COL.a, dim: true },
        ], marks: [{ v: WOOD_CRUSH, name: 'pine dents', col: '#ff7a59' }] });
      }
      g.strokeStyle = 'rgba(255,255,255,.15)'; g.lineWidth = 2; g.beginPath(); g.moveTo(640, 20); g.lineTo(640, h - 20); g.stroke();
      unitsList(g, 665, 50, P, { w: 320, rowH: 64, big: 26 });
    }, [0, 0, 0]);
    const BOARD = { lab: [1.18, 0.72, -0.35, 0.62, -0.4], brick: [BX + 0.78, 0.3, -0.3, 0.3, -0.35], heel: [HX + 2.3, 1.1, 0.2, 0.85, -0.4] };
    const RB = { lab: [0.1, 1.45, -0.5, 0.72, 0], heel: [HX + 0.35, 2.05, -0.6, 0.95, 0] };

    const st = {};
    let key = '', lastBoard = '', dLab = 0, dFoam = [0, 0, 0], dHeel = 0;
    return {
      update(dt, s) {
        dt = Math.max(0, dt);
        focusView(stage, st, s.focus, VIEWS);
        const narrow = fitNarrow(stage, [lF, lEle]);
        const f = s.focus;
        gL.visible = f === 'lab'; gB.visible = f === 'brick'; gH.visible = f === 'heel';
        placeBoard(chart, f, BOARD, RB, narrow);
        let P = 0;
        if (f === 'lab') {
          const a = s.A * 1e-4, side = Math.sqrt(a); P = s.F / a;
          dLab = approach(dLab, sandDepth(P), 5, dt);
          tray.setDents([{ x: 0, z: 0, hw: side / 2, hd: side / 2, depth: dLab, rim: 0.05 }]);
          const top = TRAY_TOP - dLab;
          plate.scale.set(side, 1, side); plate.position.set(0, top + 0.01, 0);
          const rl = 0.22; rod.scale.y = rl; rod.position.set(0, top + 0.02 + rl / 2, 0);
          const L = 0.08 + 0.07 * Math.log10(s.F / 10);
          aF.aim([0, top + 0.03 + rl + L, 0], [0, -1, 0], L);
          lF.position.set(0.16, top + 0.12 + rl + L, 0); lF.element.innerHTML = `F = <b>${fmtN(s.F)}</b>`;
          lP.position.set(side / 2 + 0.12, top + 0.02, 0.3); lP.element.innerHTML = `P = <b>${fmtP(P)}</b> · sank ${fmt(dLab * 100, 1)} cm`;
        } else if (f === 'brick') {
          const W = BRICK.m * G * s.bricks;
          const list = [];
          FACES.forEach((q, i) => {
            const p = W / q.a; dFoam[i] = approach(dFoam[i], foamDepth(p), 5, dt);
            const g = bricks[i], hh = q.dims[1];
            g.stack.forEach((b, k) => { b.visible = k < s.bricks; b.position.y = 0.05 - dFoam[i] + hh / 2 + k * hh; });
            list.push({ x: g.position.x, z: 0, hw: q.dims[0] / 2, hd: q.dims[2] / 2, depth: dFoam[i] });
            lBr[i].position.set(g.position.x, 0.08 + hh * s.bricks + 0.08, 0);
            lBr[i].element.innerHTML = `${q.name}: <b>${fmtP(p)}</b>`;
            lBr[i].element.style.opacity = q.id === s.face ? 1 : 0.6;
            if (q.id === s.face) P = p;
          });
          foam.setDents(list);
        } else {
          P = heelP(s); const Pe = eleP(s);
          const r = Math.sqrt(HEELS[s.heel].a / Math.PI);
          heelPin.scale.set(r / 0.006 * 0.5 + 0.5, 1, r / 0.006 * 0.5 + 0.5);
          heelPin.visible = s.heel !== 'flat';
          const want = P > WOOD_CRUSH ? Math.min(0.03, (P / WOOD_CRUSH - 1) * 0.006 + 0.008) : 0;
          dHeel = approach(dHeel, want, 4, dt);
          dent.scale.setScalar(Math.max(0.0001, dHeel)); dent.visible = dHeel > 0.001;
          aHeel.aim([-0.43, 0.9, 0.1], [0, -1, 0], 0.2 + 0.08 * Math.log10(P / 1e4));
          aEle.aim([1.2, 1.9, 0.35], [0, -1, 0], 0.2 + 0.08 * Math.log10(Pe / 1e4));
          lHeel.position.set(-0.43, 0.95, 0.1); lHeel.element.innerHTML = `heel: <b>${fmtP(P)}</b>${P > WOOD_CRUSH ? ' · dents the floor' : ''}`;
          lEle.position.set(1.2, 1.95, 0.35); lEle.element.innerHTML = `elephant foot: <b>${fmtP(Pe)}</b>`;
          cur = { ...(cur || {}), Pe };
        }
        const bk = `${f}|${s.F}|${s.A}|${s.face}|${s.bricks}|${s.person}|${s.heel}|${s.walk}`;
        if (bk !== lastBoard) {
          lastBoard = bk;
          cur = { f, P, F: s.F, A: s.A, W: BRICK.m * G * s.bricks, face: s.face, heel: s.heel, walk: s.walk, Pe: eleP(s) };
          chart.redraw();
        }
        key = bk;
      },
      readout(s) {
        const f = s.focus;
        if (f === 'lab') {
          const a = s.A * 1e-4, P = s.F / a;
          return `<div class="big">P = ${fmtP(P)}</div>
            <div class="row"><span>Force F</span><b>${fmtN(s.F)}</b></div>
            <div class="row"><span>Area A</span><b>${fmt(s.A, s.A < 10 ? 1 : 0)} cm² = ${a.toFixed(a < 0.01 ? 4 : 3)} m²</b></div>
            <div class="row"><span>F ÷ A</span><b>${fmt(P, 0)} N/m²</b></div>
            <div class="row"><span>Compared with the air</span><b>${fmt(P / ATM, P / ATM < 1 ? 2 : 1)} atm</b></div>
            <small>How deep it sinks is a simple illustration, not a soil law.</small>`;
        }
        if (f === 'brick') {
          const W = BRICK.m * G * s.bricks, q = FACES.find((x) => x.id === s.face), P = W / q.a;
          return `<div class="big">${fmtP(P)} ${q.name}</div>
            <div class="row"><span>Weight (${s.bricks} × 3.2 kg)</span><b>${fmtN(W)}</b></div>
            <div class="row"><span>Area on the foam</span><b>${fmtArea(q.a)}</b></div>
            <div class="row"><span>Flat · side · end</span><b>${FACES.map((x) => fmt(W / x.a / 1000, 1)).join(' · ')} kPa</b></div>
            <small>Same brick, same weight. Only the area changes.</small>`;
        }
        const P = heelP(s), Pe = eleP(s);
        return `<div class="big">The heel wins, ${fmt(P / Pe, 0)}×</div>
          <div class="row"><span>Person, ${s.person} kg on one heel</span><b>${fmtN(s.person * G)} ÷ ${fmtArea(HEELS[s.heel].a)}</b></div>
          <div class="row"><span>Heel pressure</span><b>${fmtP(P)}</b></div>
          <div class="row"><span>Elephant, 4,000 kg on ${s.walk ? 'two' : 'four'} feet</span><b>${fmtN(ELE.m * G)} ÷ ${fmtArea(ELE.foot * (s.walk ? 2 : 4))}</b></div>
          <div class="row"><span>Elephant pressure</span><b>${fmtP(Pe)}</b></div>
          <small>Soft pine dents above about 4 MPa. ${P > WOOD_CRUSH ? 'This heel will mark the floor.' : 'This shoe is safe for the floor.'}</small>`;
      },
    };
  },
};
