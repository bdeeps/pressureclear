// Chapter 3: pressure in liquids, P = ρ g h. The deeper you go, the more liquid sits above you.
// Tank: an Indian-style building, 3 m per storey, with a 1 m tall tank on the roof. The tap's "head" h
//   is the height of the water surface above it; its pressure is ρ g h (gauge). Ideal jet speed, before
//   any pipe friction, is Torricelli's √(2 g h). A home RO purifier's pump makes about 5 bar (ROClear),
//   and a storage geyser's relief valve opens at 6–8 bar (WaterHeaterClear), far above any rooftop tank.
// Dam: Bhakra Dam, Himachal Pradesh: 226 m high, 9.1 m wide at the top, 191 m at the base (Bhakra Beas
//   Management Board; Wikipedia). Pressure on the face grows linearly with depth; the force per metre
//   of dam is the area of that triangle, ½ ρ g H². Drawn at 1:100.
// Diving: seawater 1,025 kg/m³: every 10.1 m adds one more atmosphere. The eardrum is about 85 mm² with
//   about 55–60 mm² vibrating (Wever & Lawrence; Gray's Anatomy); 60 mm² is used. If the middle ear is
//   not equalised it stays at surface pressure, so the difference across the eardrum is ρ g h.
//   Divers feel it from about a metre or two down (DAN, "Ears and diving"); the exact figure varies.
// Blood: blood is about 1,060 kg/m³, so it changes by ρ g Δh = 0.78 mmHg per cm of height. A cuff at
//   heart height reads the true 120/80; lower down it reads higher, higher up lower (AHA: support the
//   arm so the cuff is at heart level; each cm off adds or removes about 0.8 mmHg, Pickering et al. 2005).
import { THREE, M, box, sphere, torus } from '../kit.js';
import {
  G, ATM, BAR, MMHG, RHO_W, RHO_SEA, RHO_BLOOD, board, panelBg, title, axes, line, dot, tag, COL, fitNarrow, inReel, focusView,
  placeBoard, force, makePerson, waterMat, fmt, fmtP, fmtN, clamp, approach, hydro,
} from '../pressure.js';

const DX = 20, VX = 40, BX = 60;
const STOREY = 3, TANK = 1;
const DAM = { H: 226, top: 9.1, base: 191, S: 0.01 };
const EAR_A = 60e-6;
const HEART_Y = 1.3;
const MMHG_PER_CM = (RHO_BLOOD * G * 0.01) / MMHG;
export const head = (s) => s.floors * STOREY + TANK * 0.9 - (s.tap * STOREY + 1.0);
export const tapP = (s) => hydro(RHO_W, head(s));
export const cuff = (dh) => [120 - dh * MMHG_PER_CM, 80 - dh * MMHG_PER_CM];

const VIEWS = {
  tank: { pos: [-4, 13, 27], target: [4, 8.5, 0] },
  dam: { pos: [DX + 0.4, 1.7, 6.6], target: [DX + 0.9, 1.1, 0] },
  dive: { pos: [VX + 0.1, 2.3, 6.6], target: [VX - 0.1, 1.95, 0] },
  blood: { pos: [BX + 0.1, 1.4, 4.8], target: [BX + 0.4, 1.1, 0] },
};
const REEL = {
  dam: { pos: [DX + 0.45, 2.3, 3.0], target: [DX + 0.45, 1.9, 0] },
  blood: { pos: [BX + 0.25, 1.8, 1.9], target: [BX + 0.25, 1.65, 0] },
};

export default {
  id: 'liquids',
  short: 'Liquids: P = ρgh',
  title: 'Deeper means harder: pressure in liquids',
  subtitle: 'A rooftop tank, a dam, a diver’s ears and your own blood all follow P = ρ g h.',
  view: VIEWS.tank,
  learn: `<p>Water is heavy. A column of water 10 m tall and 1 m² across weighs about 98,000 N, and all of it presses on the bottom. So the pressure under a liquid is <b>P = ρ g h</b>: the liquid's <b>density</b> ρ, times gravity g, times the <b>depth</b> h. Only the depth matters, not the shape or size of the container.</p>
    <p>Every <b>10 m of water adds about 1 bar</b>. A tank on a three-storey roof gives the ground-floor tap about 1 bar, and the top-floor tap hardly any. That's far too little for an RO membrane, which is why the purifier has a 5 bar <b>booster pump</b> (ROClear). A geyser is built to hold 6 to 8 bar (WaterHeaterClear), so a tank can't burst it.</p>
    <p><b>Dams</b> are thick at the bottom because the water pushes hardest there. At the foot of Bhakra Dam, 226 m of water press at over 2 MPa, 22 times the air.</p>
    <p><b>Divers</b> feel it in their ears. The air behind the eardrum stays at surface pressure unless you <b>equalise</b> (swallow or gently blow against a pinched nose), so the water pushes the eardrum in. Only a metre or two down it already hurts (EarClear).</p>
    <p>Your <b>blood</b> is a liquid column too. Blood pressure, 120/80 mmHg (HeartClear), is measured at <b>heart height</b>: at your ankles it is almost 100 mmHg more, just from the blood above. The squeeze from the heart travels through the fluid in every direction, which is <b>Pascal's principle</b> (PascalClear).</p>
    <p class="tip"><b>Try it:</b> move the tap up the building and watch its jet shrink. Fill the dam. Take the diver down with and without equalising. Slide the blood-pressure cuff from the ankle to above the head.</p>`,
  terms: [
    { t: 'Hydrostatic pressure', d: 'The pressure in a still liquid due to its weight: P = ρ g h.' },
    { t: 'Density (ρ)', d: 'Mass per volume. Water 1,000 kg/m³, seawater 1,025, blood 1,060, mercury 13,600.' },
    { t: 'Head', d: 'The height of liquid above a point, a plumber’s way of saying pressure. 10 m of head ≈ 1 bar.' },
    { t: 'Equalising', d: 'Letting air into the middle ear so the pressure on both sides of the eardrum matches.' },
    { t: 'Blood pressure', d: 'The pressure of blood in the arteries, as systolic/diastolic in mmHg, measured at heart height.' },
  ],
  defaults: { focus: 'tank', floors: 4, tap: 0, level: 200, depth: 5, eq: false, cuffH: 0 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'tank', label: 'Water tank' }, { v: 'dam', label: 'Dam' }, { v: 'dive', label: 'Diver' }, { v: 'blood', label: 'Blood' }] },
    { key: 'floors', type: 'range', label: 'Tank: storeys in the building', min: 1, max: 10, step: 1, ends: ['1', '10'], fmt: (v) => String(v) },
    { key: 'tap', type: 'range', label: 'Tank: which floor is the tap on', min: 0, max: 9, step: 1, ends: ['ground', '9th'], fmt: (v) => (v ? `floor ${v}` : 'ground floor') },
    { key: 'level', type: 'range', label: 'Dam: water depth', min: 0, max: 220, step: 5, ends: ['empty', '220 m'], fmt: (v) => v + ' m' },
    { key: 'depth', type: 'range', label: 'Diver: depth', min: 0, max: 40, step: 0.5, ends: ['surface', '40 m'], fmt: (v) => v + ' m' },
    { key: 'eq', type: 'toggle', label: 'Diver: equalise the ears', hint: 'Swallow, or pinch your nose and blow gently.' },
    { key: 'cuffH', type: 'range', label: 'Blood: cuff height from the heart', min: -125, max: 40, step: 5, ends: ['ankle', 'above the head'], fmt: (v) => (v === 0 ? 'heart level' : `${v > 0 ? '+' : '−'}${Math.abs(v)} cm`) },
  ],
  onChange(s, key) {
    if (['floors', 'tap'].includes(key)) { s.focus = 'tank'; s.tap = Math.min(s.tap, s.floors - 1); }
    if (key === 'level') s.focus = 'dam';
    if (['depth', 'eq'].includes(key)) s.focus = 'dive';
    if (key === 'cuffH') s.focus = 'blood';
  },
  quiz: [
    { q: 'Roughly how much extra pressure does each 10 m of water depth add?', options: ['About 0.1 bar', 'About 1 bar', 'About 10 bar', 'None, water can’t be squeezed'], answer: 1, why: 'ρ g h = 1,000 × 9.81 × 10 ≈ 98,000 Pa ≈ 1 bar, about one atmosphere.' },
    { q: 'Why are dams built much thicker at the bottom than at the top?', options: ['To look stronger', 'Because water pressure grows with depth, so the bottom is pushed hardest', 'The top has to hold the road', 'Concrete is cheaper at the bottom'], answer: 1, why: 'P = ρ g h: at the base of a 226 m dam the water presses at about 2.2 MPa, and nothing at the surface.' },
    { q: 'Why should a blood-pressure cuff be at the same height as your heart?', options: ['So the doctor can reach it', 'Because blood is a liquid column: every cm below the heart adds about 0.8 mmHg to the reading', 'The heart only pumps sideways', 'It makes no difference'], answer: 1, why: 'ρ g h for blood is about 0.78 mmHg per cm. A cuff 20 cm low reads about 16 mmHg too high.' },
  ],
  reel: [
    { ms: 5200, caption: 'Water pressure grows with depth, P = ρgh, so a dam must be thickest at its base.', set: { focus: 'dam' }, anim: { level: [20, 220] }, view: REEL.dam, spin: 0 },
    { ms: 5000, caption: 'Blood is a liquid column too: at your ankles, blood pressure is almost 100 mmHg higher.', set: { focus: 'blood' }, anim: { cuffH: [0, -125] }, view: REEL.blood, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gT = new THREE.Group(), gD = new THREE.Group(), gV = new THREE.Group(), gB = new THREE.Group(); root.add(gT, gD, gV, gB);
    gD.position.x = DX; gV.position.x = VX; gB.position.x = BX;
    const wm = waterMat();

    // ------------------------------------------------ building, rooftop tank and a tap
    const bld = new THREE.Group(); gT.add(bld);
    const wall = box(8, 1, 6, M.matte(0xe9e1d0)); bld.add(wall);
    const slabs = [], wins = [];
    for (let i = 0; i <= 10; i++) { const sl = box(8.2, 0.2, 6.2, M.matte(0xc9c0ae)); bld.add(sl); slabs.push(sl); }
    for (let i = 0; i < 10; i++) for (const x of [-2.5, 0, 2.5]) { const w = box(1.2, 1.3, 0.05, M.plastic(0x2c4a6e, { roughness: 0.2 })); bld.add(w); wins.push([w, i]); w.position.set(x, i * STOREY + 1.6, 3.02); }
    const tank = new THREE.Group(); bld.add(tank);
    const tankShell = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, TANK, 32), M.plastic(0x1e1f22, { roughness: 0.6 })); tankShell.position.y = TANK / 2; tank.add(tankShell); tankShell.castShadow = true;
    tank.position.set(-2.5, 0, 0);
    const pipeM = M.plastic(0xf1f1f1);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 12), pipeM); bld.add(pipe);
    const tapArm = box(0.8, 0.1, 0.1, pipeM); bld.add(tapArm);
    const tapHead = box(0.14, 0.26, 0.14, M.metal(0xc9ced8)); bld.add(tapHead);
    const JET_N = 60;
    const jet = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 8, 6), M.glow(0x6fb8ff), JET_N); jet.frustumCulled = false; bld.add(jet);
    const floorL = []; for (let i = 0; i < 10; i++) floorL.push(stage.label('', [0, 0, 0], bld));
    const lTap = stage.label('', [0, 0, 0], bld, 'hot'); lTap.element.style.setProperty('--c', COL.p);
    const o3 = new THREE.Object3D();

    // ------------------------------------------------ dam cross-section at 1:100
    const S = DAM.S, H = DAM.H * S;
    const dshape = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(DAM.base * S, 0), new THREE.Vector2(DAM.top * S, H), new THREE.Vector2(0, H)]);
    const damGeo = new THREE.ExtrudeGeometry(dshape, { depth: 1.2, bevelEnabled: false }); damGeo.translate(0, 0, -0.6);
    const dam = new THREE.Mesh(damGeo, M.matte(0xbfbab0, { roughness: 0.8 })); dam.castShadow = true; gD.add(dam);
    const res = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1.2), wm); gD.add(res);
    const bed = box(4.6, 0.04, 1.4, M.matte(0x6b5a44)); bed.position.set(0.3, -0.02, 0); gD.add(bed);
    const DAR = 12, damArrows = [];
    for (let i = 0; i < DAR; i++) { const a = force(0xff5a8a, 0.012, 0.05); gD.add(a); damArrows.push(a); }
    const lDam = stage.label('', [0, 0, 0], gD, 'hot'); lDam.element.style.setProperty('--c', COL.hot);
    const lDamTop = stage.label('9 m wide at the top', [DAM.top * S * 0.5 + 0.2, H + 0.12, 0], gD), lDamBase = stage.label('191 m wide at the base', [DAM.base * S * 0.6, 0.12, 0.7], gD);

    // ------------------------------------------------ diver in a column of sea (1:10) with an eardrum close-up
    const SEA_S = 0.1, SEA_H = 42 * SEA_S;
    const sea = new THREE.Mesh(new THREE.BoxGeometry(1.4, SEA_H, 1.0), M.clear(0x1d6fb8, 0.3, { roughness: 0.1 })); sea.position.set(0, SEA_H / 2, 0); gV.add(sea);
    const surf = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.0), M.clear(0x9fd4ff, 0.5)); surf.rotation.x = -Math.PI / 2; surf.position.y = SEA_H; gV.add(surf);
    for (let d = 0; d <= 40; d += 10) { const tick = box(0.12, 0.008, 0.01, M.glow(0xffffff)); tick.position.set(-0.76, SEA_H - d * SEA_S, 0.5); gV.add(tick); stage.label(`${d} m`, [-0.95, SEA_H - d * SEA_S, 0.5], gV); }
    const diver = makePerson({ shirt: 0x111418, pants: 0x111418, skin: 0xc68b64, s: 0.3 }); diver.rotation.set(0, 0, -Math.PI / 2 + 0.2); gV.add(diver);
    const tankD = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 12), M.plastic(0xffb547)); diver.body.add(tankD); tankD.position.set(-0.04, 0.05, 0);
    // eardrum close-up: a canal with a membrane that bulges when outside and inside pressures differ
    const ear = new THREE.Group(); ear.position.set(-1.55, 1.0, 0.2); gV.add(ear);
    const canal = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.9, 32, 1, true), M.matte(0xd9a38a, { side: THREE.DoubleSide })); canal.rotation.z = Math.PI / 2; ear.add(canal);
    const drum = new THREE.Mesh(new THREE.SphereGeometry(0.28, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.matte(0xf0c9b8, { side: THREE.DoubleSide, transparent: true, opacity: 0.92 })); drum.rotation.z = -Math.PI / 2; ear.add(drum);
    const earArrows = []; for (let i = 0; i < 3; i++) { const a = force(0x4aa8ff, 0.015, 0.06); ear.add(a); earArrows.push(a); }
    const inArrows = []; for (let i = 0; i < 3; i++) { const a = force(0x7be08c, 0.015, 0.06); ear.add(a); inArrows.push(a); }
    stage.label('water side', [-0.3, 0.42, 0], ear); stage.label('middle ear', [0.3, 0.42, 0], ear);
    const lEar = stage.label('', [0, -0.45, 0], ear, 'hot'); lEar.element.style.setProperty('--c', COL.hot);

    // ------------------------------------------------ a standing person and a cuff
    const pers = makePerson({ shirt: 0x5b8def, pants: 0x2b3242, skin: 0xa8714c, s: 1.0 }); pers.rotation.y = -Math.PI / 2 + 0.25; gB.add(pers);
    const heart = sphere(0.06, M.glow(0xff3b5c), 20); heart.position.set(0.02, HEART_Y, -0.05); gB.add(heart);
    const cuffM = torus(0.1, 0.04, M.matte(0x2f3a4a), 32); cuffM.rotation.x = Math.PI / 2; gB.add(cuffM);
    const scaleBar = box(0.03, 1.8, 0.03, M.matte(0x5b616e)); scaleBar.position.set(0.6, 0.9, 0); gB.add(scaleBar);
    const marker = box(0.14, 0.02, 0.05, M.glow(0xff5a8a)); gB.add(marker);
    const heartLine = box(1.2, 0.006, 0.006, M.glow(0xff3b5c)); heartLine.position.set(0.05, HEART_Y, 0); gB.add(heartLine);
    stage.label('heart level', [-0.45, HEART_Y + 0.07, 0], gB);
    const lCuff = stage.label('', [0, 0, 0], gB, 'hot'); lCuff.element.style.setProperty('--c', COL.hot);

    // ------------------------------------------------ board
    let cur = null;
    const chart = board(root, 1.6, 1.0, 800, 500, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur) return;
      const f = cur.f;
      if (f === 'tank') {
        title(g, 'Pressure at each tap', '10 m of water ≈ 1 bar');
        const Hmax = 31, A = axes(g, w, h, { x0: 90, y1: 80, xMax: 3.2, yMax: Hmax, xTicks: [0, 1, 2, 3], yTicks: [0, 10, 20, 30], xFmt: (v) => v + ' bar', yFmt: (v) => v + ' m', xLabel: 'pressure →', yLabel: 'head ↑' });
        line(g, [[0, 0], [hydro(RHO_W, Hmax) / BAR, Hmax]], (v) => A.X(v), A.Y, COL.p, 4);
        for (let i = 0; i < cur.floors; i++) { const hh = cur.floors * STOREY + 0.9 - (i * STOREY + 1); dot(g, A.X(hydro(RHO_W, hh) / BAR), A.Y(hh), i === cur.tap ? COL.hot : 'rgba(142,240,255,.5)', i === cur.tap ? 11 : 6); }
        [[0.3, 'RO membrane needs ≈ 5 bar: pump'], [2.1, 'geyser relief valve: 6–8 bar']].forEach(([y, t], i) => tag(g, t, A.X(1.2), A.Y(Hmax * (0.9 - i * 0.1)), COL.dim, '16px sans-serif'));
      } else if (f === 'dam') {
        title(g, 'Pressure on the dam face', 'grows steadily with depth');
        const A = axes(g, w, h, { x0: 90, y1: 80, xMax: 2.4, yMin: -230, yMax: 0, xTicks: [0, 0.8, 1.6, 2.4], yTicks: [0, -50, -100, -150, -200], xFmt: (v) => v + ' MPa', yFmt: (v) => -v + ' m', xLabel: 'pressure →', yLabel: 'depth ↓' });
        const L = cur.level;
        g.fillStyle = 'rgba(255,90,138,.25)'; g.beginPath(); g.moveTo(A.X(0), A.Y(0)); g.lineTo(A.X(0), A.Y(-L)); g.lineTo(A.X(hydro(RHO_W, L) / 1e6), A.Y(-L)); g.closePath(); g.fill();
        line(g, [[0, 0], [hydro(RHO_W, L) / 1e6, -L]], A.X, A.Y, COL.hot, 5);
        tag(g, `shaded area = force per metre: ${fmt((0.5 * RHO_W * G * L * L) / 1e6, 0)} MN`, 110, h - 90 - 0 * 20, COL.hot, '17px sans-serif');
      } else if (f === 'dive') {
        title(g, 'Pressure on a diver', 'total = air above + water above');
        const A = axes(g, w, h, { x0: 90, y1: 80, xMax: 5, yMin: -40, yMax: 0, xTicks: [0, 1, 2, 3, 4, 5], yTicks: [0, -10, -20, -30, -40], xFmt: (v) => v + ' atm', yFmt: (v) => -v + ' m', xLabel: 'absolute pressure →', yLabel: 'depth ↓' });
        line(g, [[1, 0], [(ATM + hydro(RHO_SEA, 40)) / ATM, -40]], A.X, A.Y, COL.p, 5);
        dot(g, A.X((ATM + hydro(RHO_SEA, cur.depth)) / ATM), A.Y(-cur.depth), COL.hot, 11);
        tag(g, 'your lungs’ air squeezes to half by 10 m (GasLawClear)', 110, h - 90, COL.dim, '16px sans-serif');
      } else {
        title(g, 'Blood pressure along your body', 'at heart level: 120/80 mmHg');
        const A = axes(g, w, h, { x0: 90, y1: 80, xMin: 0, xMax: 240, yMin: -130, yMax: 50, xTicks: [0, 60, 120, 180, 240], yTicks: [-120, -80, -40, 0, 40], xFmt: String, yFmt: (v) => (v > 0 ? '+' : '') + v + ' cm', xLabel: 'mmHg →' });
        line(g, [[cuff(-130)[0], -130], [cuff(50)[0], 50]], A.X, A.Y, COL.hot, 4);
        line(g, [[cuff(-130)[1], -130], [cuff(50)[1], 50]], A.X, A.Y, COL.p, 4);
        tag(g, 'systolic', A.X(cuff(-110)[0]) + 10, A.Y(-110), COL.hot, '16px sans-serif'); tag(g, 'diastolic', A.X(cuff(-110)[1]) - 80, A.Y(-110), COL.p, '16px sans-serif');
        const [sy, di] = cuff(cur.cuffH); dot(g, A.X(sy), A.Y(cur.cuffH), COL.hot, 9); dot(g, A.X(di), A.Y(cur.cuffH), COL.p, 9);
      }
    }, [0, 0, 0]);
    const BOARD = { tank: [14, 13, -3, 8, -0.35], dam: [DX + 3.2, 1.2, -0.6, 1.2, -0.45], dive: [VX + 1.6, 1.3, -0.2, 1.1, -0.35], blood: [BX + 1.75, 1.15, -0.8, 1.05, -0.45] };
    const RB = { dam: [DX + 0.45, 3.3, -0.8, 1.5, 0], blood: [BX + 0.3, 2.75, -0.6, 1.3, 0] };

    const st = {};
    let lastBoard = '', t = 0, lvl = 200, dep = 5, bulge = 0, cy = HEART_Y;
    return {
      update(dt, s, time) {
        dt = Math.max(0, dt); t += dt;
        focusView(stage, st, s.focus, VIEWS);
        const narrow = fitNarrow(stage, [...floorL, lDamTop, lDamBase]);
        const f = s.focus;
        gT.visible = f === 'tank'; gD.visible = f === 'dam'; gV.visible = f === 'dive'; gB.visible = f === 'blood';
        placeBoard(chart, f, BOARD, RB, narrow);
        if (f === 'tank') {
          const N = s.floors, Hb = N * STOREY;
          wall.scale.y = Hb; wall.position.y = Hb / 2;
          slabs.forEach((sl, i) => { sl.visible = i <= N; sl.position.y = i * STOREY; });
          wins.forEach(([w, i]) => { w.visible = i < N; });
          tank.position.y = Hb + 0.1;
          const tapY = s.tap * STOREY + 1.0;
          const pTop = Hb + 0.1, pBot = tapY;
          pipe.scale.y = pTop - pBot; pipe.position.set(4.15, (pTop + pBot) / 2, 0);
          tapArm.position.set(4.15 + 0.35, tapY, 0); tapHead.position.set(4.6, tapY - 0.12, 0);
          const hh = head(s), v = Math.sqrt(2 * G * Math.max(0, hh));
          for (let i = 0; i < JET_N; i++) {
            const tt = (((i / JET_N) + time * 0.8) % 1) * 0.35;
            const x = 4.6 + v * tt, y = tapY - 0.25 - 0.5 * G * tt * tt;
            o3.position.set(x, y, 0); o3.scale.setScalar(y > 0.05 && v > 0.1 ? 1 : 0.0001); o3.updateMatrix(); jet.setMatrixAt(i, o3.matrix);
          }
          jet.instanceMatrix.needsUpdate = true;
          floorL.forEach((l, i) => {
            l.visible = i < N && !narrow && i !== s.tap;
            const h2 = Hb + 0.9 - (i * STOREY + 1);
            l.position.set(-4.9, i * STOREY + 1.3, 3); l.element.textContent = `${i ? 'floor ' + i : 'ground'}: ${fmt(hydro(RHO_W, h2) / BAR, 2)} bar`;
          });
          lTap.position.set(5.4, tapY + 0.7, 0); lTap.element.innerHTML = `tap: <b>${fmt(tapP(s) / BAR, 2)} bar</b> · ${fmt(hh, 1)} m of head`;
        } else if (f === 'dam') {
          lvl = approach(lvl, s.level, 3, dt);
          const L = lvl * S;
          res.visible = L > 0.005; res.scale.set(2.4, Math.max(0.001, L), 1); res.position.set(-1.2, L / 2, 0);
          damArrows.forEach((a, i) => {
            const y = L * (1 - (i + 0.5) / DAR), depth = (L - y) / S, P = hydro(RHO_W, depth);
            a.aim([-0.02 - P / 2.3e6 * 0.9, y, 0.62], [1, 0, 0], L > 0.01 ? (P / 2.3e6) * 0.9 : 0);
          });
          lDam.position.set(-0.6, 0.12, 0.62); lDam.element.innerHTML = `at the base: <b>${fmtP(hydro(RHO_W, lvl))}</b>`;
        } else if (f === 'dive') {
          dep = approach(dep, s.depth, 3, dt);
          diver.position.set(0.05, SEA_H - dep * SEA_S - 0.02, 0);
          const dP = s.eq ? 0 : hydro(RHO_SEA, dep);
          bulge = approach(bulge, Math.min(1, dP / 40e3), 5, dt);
          drum.scale.set(0.02 + bulge * 0.5, 1, 1);
          const Pout = ATM + hydro(RHO_SEA, dep), Pin = s.eq ? Pout : ATM;
          earArrows.forEach((a, i) => a.aim([-0.55, -0.15 + i * 0.15, 0], [1, 0, 0], 0.1 + (Pout / ATM) * 0.06));
          inArrows.forEach((a, i) => a.aim([0.55, -0.15 + i * 0.15, 0], [-1, 0, 0], 0.1 + (Pin / ATM) * 0.06));
          lEar.element.innerHTML = s.eq ? 'equalised: <b>no push</b>' : `eardrum pushed in by <b>${fmtN(dP * EAR_A)}</b>`;
        } else {
          cy = approach(cy, HEART_Y + s.cuffH / 100, 5, dt);
          const onArm = cy > 0.95 && cy < 1.55;
          cuffM.position.set(onArm ? 0.24 : 0.1, clamp(cy, 0.08, 1.9), 0);
          cuffM.scale.setScalar(0.6);
          marker.position.set(0.6, clamp(cy, 0.05, 1.9), 0);
          const [sy, di] = cuff(s.cuffH);
          lCuff.position.set(0.85, clamp(cy, 0.05, 1.9), 0); lCuff.element.innerHTML = `cuff reads <b>${fmt(sy, 0)}/${fmt(di, 0)}</b> mmHg`;
          heart.scale.setScalar(1 + 0.15 * Math.max(0, Math.sin(time * 7.3)));
        }
        const bk = `${f}|${s.floors}|${s.tap}|${s.level}|${s.depth}|${s.cuffH}`;
        if (bk !== lastBoard) { lastBoard = bk; cur = { f, floors: s.floors, tap: s.tap, level: s.level, depth: s.depth, cuffH: s.cuffH }; chart.redraw(); }
      },
      readout(s) {
        const f = s.focus;
        if (f === 'tank') {
          const hh = head(s), P = tapP(s);
          return `<div class="big">${fmt(P / BAR, 2)} bar at the tap</div>
            <div class="row"><span>Head: water surface above the tap</span><b>${fmt(hh, 1)} m</b></div>
            <div class="row"><span>ρ g h = 1,000 × 9.81 × ${fmt(hh, 1)}</span><b>${fmtP(P)}</b></div>
            <div class="row"><span>Ideal jet speed, √(2gh)</span><b>${fmt(Math.sqrt(2 * G * Math.max(0, hh)), 1)} m/s</b></div>
            <small>Real taps get less: pipes and bends waste some of the head.</small>`;
        }
        if (f === 'dam') {
          const P = hydro(RHO_W, s.level), F = 0.5 * RHO_W * G * s.level * s.level;
          return `<div class="big">${fmtP(P)} at the base</div>
            <div class="row"><span>Water depth</span><b>${s.level} m</b></div>
            <div class="row"><span>Halfway down</span><b>${fmtP(P / 2)}</b></div>
            <div class="row"><span>Push on each metre of dam, ½ρgH²</span><b>${fmtN(F)}</b></div>
            <small>Bhakra Dam: 226 m tall, 9 m wide on top, 191 m at the base.</small>`;
        }
        if (f === 'dive') {
          const w = hydro(RHO_SEA, s.depth), dP = s.eq ? 0 : w;
          return `<div class="big">${fmt((ATM + w) / ATM, 2)} atm around you</div>
            <div class="row"><span>Air above the sea</span><b>1 atm, 101 kPa</b></div>
            <div class="row"><span>Water above you, ρgh</span><b>${fmtP(w)}</b></div>
            <div class="row"><span>Across the eardrum</span><b>${fmtP(dP)} · ${fmtN(dP * EAR_A)}</b></div>
            <small>${s.eq ? '<span class="ok">Equalised: the air inside matches the water outside.</span>' : s.depth > 1.5 ? '<span class="no">Not equalised: this hurts. Come up a little and equalise.</span>' : 'Not equalised yet: you start to feel it within a metre or two.'}</small>`;
        }
        const [sy, di] = cuff(s.cuffH);
        return `<div class="big">Cuff reads ${fmt(sy, 0)}/${fmt(di, 0)}</div>
          <div class="row"><span>True pressure at the heart</span><b>120/80 mmHg</b></div>
          <div class="row"><span>Cuff is ${s.cuffH >= 0 ? 'above' : 'below'} the heart by</span><b>${Math.abs(s.cuffH)} cm</b></div>
          <div class="row"><span>ρ g h of blood, 0.78 mmHg per cm</span><b>${s.cuffH > 0 ? '−' : '+'}${fmt(Math.abs(s.cuffH) * MMHG_PER_CM, 0)} mmHg</b></div>
          <small>That's why the arm is rested at heart level for a reading (HeartClear).</small>`;
      },
    };
  },
};
