// Chapter 4: the air presses too. We live at the bottom of an ocean of air about 101 kPa deep.
// Magdeburg hemispheres: Otto von Guericke's pair were about 50 cm across (Deutsches Museum replica;
//   Wikipedia). Pump the air out and the outside air pushes them together with (P_out − P_in) × π r².
//   At a full vacuum that is 101 kPa × 0.196 m² ≈ 20 kN, the weight of two tonnes. A draught horse can
//   pull steadily with roughly 1 kN (about a tenth of its weight; a rough figure), hence the teams.
// Straw: sucking lowers the pressure in your mouth by ΔP, and the air pushes the drink up h = ΔP ÷ ρg.
//   People can suck to about −10 kPa (maximal inspiratory mouth pressure, ≈ −100 cmH₂O in adults).
//   Even a perfect vacuum only lifts water 10.3 m: the limit Galileo's pump-makers hit (1638).
// Height: International Standard Atmosphere (isaP in pressure.js). Leh ≈ 3,500 m; Everest 8,849 m (ISA gives
//   31 kPa; the real summit is warmer and measured about 33.7 kPa, West 1983). Airliner cabins are held at
//   no more than an 8,000 ft (2,440 m) "cabin altitude", about 75 kPa or 0.74 atm (US FAR 25.841).
//   A sealed snack packet swells as 1 ÷ P (Boyle's law, see GasLawClear) until the bag is full.
// Pressure cooker: the whistle is a weight on a vent. It lifts when (P_in − P_out) × A_vent = m g. With a
//   3.2 mm vent, an 82 g weight holds about 1 bar gauge (US 15 psi regulators weigh about 83 g). Water then
//   boils at about 120 °C (Antoine equation, boilT in pressure.js). See ACClear for boiling vs pressure.
// Barometer: a column of mercury balances the air: h = P ÷ (ρ_Hg g), 760 mm at 1,013.25 hPa. Low pressure
//   brings clouds and rain; the 1999 Odisha super cyclone's centre fell to about 912 hPa (IMD).
import { THREE, M, box, sphere, torus, latheX } from '../kit.js';
import {
  G, ATM, BAR, MMHG, RHO_W, RHO_HG, board, panelBg, title, axes, line, dot, tag, COL, fitNarrow, inReel, focusView, placeBoard,
  force, arrowSet, makeGas, waterMat, fmt, fmtP, fmtN, isaP, boilT, clamp, approach, TAU,
} from '../pressure.js';

const SX = 20, HX = 40, CX = 60, BX = 80;
const HORSE = 1000, VENT = Math.PI * 0.0016 * 0.0016;
const PLACES = [
  { h: 0, name: 'Mumbai, sea level' }, { h: 920, name: 'Bengaluru' }, { h: 3500, name: 'Leh' }, { h: 2440, name: 'airliner cabin, at most', cabin: true },
  { h: 5364, name: 'Everest base camp' }, { h: 8849, name: 'Everest summit' }, { h: 11000, name: 'airliner cruising' },
];
const MTN_S = 1 / 5000;
export const hemiF = (s) => (ATM * s.vac / 100) * Math.PI * (s.dia / 200) ** 2;
export const strawH = (s) => (s.suck * 1000) / (RHO_W * G);
export const cookerSet = (s) => (s.wt / 1000) * G / VENT;
const weather = (hpa) => (hpa < 960 ? 'a severe cyclone' : hpa < 995 ? 'a storm or depression' : hpa < 1008 ? 'clouds and rain likely' : hpa < 1022 ? 'changeable' : 'fine, settled weather');

const VIEWS = {
  hemi: { pos: [-0.45, 0.95, 2.1], target: [0.35, 0.55, 0] },
  straw: { pos: [SX + 0.02, 0.3, 0.75], target: [SX + 0.1, 0.13, 0] },
  height: { pos: [HX + 1.5, 2.0, 7.2], target: [HX + 1.95, 1.45, 0] },
  cooker: { pos: [CX + 0.05, 0.75, 1.35], target: [CX + 0.16, 0.24, 0] },
  baro: { pos: [BX - 0.2, 0.75, 2.1], target: [BX - 0.2, 0.55, 0] },
};
const REEL = {
  hemi: { pos: [0, 1.1, 1.35], target: [0, 0.95, 0] },
  height: { pos: [HX + 0.9, 2.0, 5.6], target: [HX + 0.9, 1.7, 0] },
  cooker: { pos: [CX + 0.02, 0.5, 0.42], target: [CX + 0.02, 0.36, 0] },
};

export default {
  id: 'air',
  short: 'Air pressure',
  title: 'We live at the bottom of an ocean of air',
  subtitle: 'Air presses on everything at 101 kPa. It crushes empty spheres, lifts your drink, thins on mountains and cooks your dal.',
  view: VIEWS.hemi,
  learn: `<p>The air above you is about 100 km deep, and it has weight. Above every square metre of ground sits about 10 tonnes of it, so at sea level air presses on everything at about <b>101 kPa</b>: <b>one atmosphere</b>. You don't feel it because it pushes <b>equally from every side</b>, and the fluids inside you push back just as hard.</p>
    <p>Take the air away from one side and you notice. In 1654 <b>Otto von Guericke</b> pumped the air out of two copper <b>hemispheres</b>. Teams of horses couldn't pull them apart. No glue: the outside air simply pushed them together with about 20 kN. Drinking through a <b>straw</b> and a <b>suction cup</b> work the same way: you lower the pressure on one side, and the air pushes from the other.</p>
    <p>Climb and there is less air above you, so the pressure falls: about 89 kPa in Bengaluru, 65 in <b>Leh</b>, a third of sea level on <b>Everest</b>. A sealed chips packet puffs up on the way. Planes keep the cabin at about <b>0.75 atm</b>, like a hill station at 2,400 m.</p>
    <p>Pressure changes <b>boiling</b>. High on a mountain water boils below 90 °C and dal takes forever. A <b>pressure cooker</b> does the opposite: its whistle is a weight sitting on a tiny hole, and it holds the steam in until the pressure is about 1 bar above the air. Water then boils at about <b>120 °C</b> and food cooks in a third of the time (ACClear shows the same trick in an AC).</p>
    <p>A <b>barometer</b> weighs the air with a column of mercury, 760 mm tall on an average day. Falling pressure means rising air, clouds and rain. The <b>gas laws</b> (GasLawClear) explain how squeezing and heating air change its pressure.</p>
    <p class="tip"><b>Try it:</b> pump the air out of the hemispheres and count the horses. Suck on the straw. Take the chips packet up Everest. Put the whistle on the cooker. Push the barometer down into a cyclone.</p>`,
  terms: [
    { t: 'Atmospheric pressure', d: 'The weight of the air above pressing on everything: about 101 kPa at sea level.' },
    { t: 'Vacuum', d: 'A space with the air taken out. It doesn’t pull; the air outside pushes.' },
    { t: 'Barometer', d: 'An instrument that measures air pressure, first with mercury (Torricelli, 1643).' },
    { t: 'Hectopascal (hPa)', d: '100 Pa, the weather unit. Average sea-level pressure is 1,013 hPa.' },
    { t: 'Boiling point', d: 'The temperature at which water’s vapour pressure equals the pressure around it: lower up a mountain, higher in a cooker.' },
    { t: 'Cabin altitude', d: 'The height whose air pressure an aircraft cabin copies: at most 8,000 ft, about 0.75 atm.' },
  ],
  defaults: { focus: 'hemi', dia: 50, vac: 95, suck: 5, alt: 3500, wt: 82, heat: true, hpa: 1013 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'hemi', label: 'Hemispheres' }, { v: 'straw', label: 'Straw' }, { v: 'height', label: 'Mountains' }, { v: 'cooker', label: 'Cooker' }, { v: 'baro', label: 'Barometer' }] },
    { key: 'vac', type: 'range', label: 'Hemispheres: air pumped out', min: 0, max: 100, step: 1, ends: ['none', 'all of it'], fmt: (v) => v + '%' },
    { key: 'dia', type: 'range', label: 'Hemispheres: diameter', min: 10, max: 60, step: 1, ends: ['10 cm', '60 cm'], fmt: (v) => v + ' cm' },
    { key: 'suck', type: 'range', label: 'Straw: how hard you suck', min: 0, max: 10, step: 0.1, ends: ['0', '10 kPa'], fmt: (v) => `${fmt(v, 1)} kPa below the air` },
    { key: 'alt', type: 'range', label: 'Mountains: height above sea level', min: 0, max: 11000, step: 50, ends: ['sea', '11 km'], fmt: (v) => fmt(v, 0) + ' m' },
    { key: 'wt', type: 'range', label: 'Cooker: whistle weight', min: 20, max: 120, step: 1, ends: ['20 g', '120 g'], fmt: (v) => `${v} g` },
    { key: 'heat', type: 'toggle', label: 'Cooker: stove on' },
    { key: 'hpa', type: 'range', label: 'Barometer: today’s air pressure', min: 900, max: 1060, step: 1, ends: ['900 hPa', '1,060 hPa'], fmt: (v) => `${v} hPa` },
    { key: 'go', type: 'buttons', label: 'Try these', items: [
      { label: 'Guericke’s 50 cm pair', act: (s) => Object.assign(s, { focus: 'hemi', dia: 50, vac: 100 }) },
      { label: 'Everest summit', act: (s) => Object.assign(s, { focus: 'height', alt: 8849 }) },
      { label: 'Odisha super cyclone, 1999', act: (s) => Object.assign(s, { focus: 'baro', hpa: 912 }) },
    ] },
  ],
  onChange(s, key) {
    if (['vac', 'dia'].includes(key)) s.focus = 'hemi';
    if (key === 'suck') s.focus = 'straw';
    if (key === 'alt') s.focus = 'height';
    if (['wt', 'heat'].includes(key)) s.focus = 'cooker';
    if (key === 'hpa') s.focus = 'baro';
  },
  quiz: [
    { q: 'What really holds Magdeburg hemispheres together after the air is pumped out?', options: ['The vacuum pulls them', 'The air outside pushes them together, with nothing inside pushing back', 'Magnetism in the copper', 'The grease on the rim'], answer: 1, why: 'A vacuum can’t pull. About 101 kPa of outside air pushes on each half, about 20 kN for a 50 cm pair.' },
    { q: 'Why does dal take longer to cook in Leh than in Chennai?', options: ['The stoves are weaker', 'Lower air pressure makes water boil at a lower temperature, about 88 °C', 'The water is purer', 'Cold air cools the pot'], answer: 1, why: 'At about 65 kPa, water boils near 88 °C. Food cooks more slowly at the lower temperature. A pressure cooker fixes it.' },
    { q: 'A pressure cooker holds about 1 bar above the air. About what temperature does the water boil at?', options: ['100 °C', '120 °C', '200 °C', '80 °C'], answer: 1, why: 'At about 2 bar absolute, water boils at about 120 °C, so food cooks roughly three times faster.' },
  ],
  reel: [
    { ms: 5200, caption: 'Pump the air out and 101 kPa of outside air clamps the hemispheres with about 2 tonnes.', set: { focus: 'hemi', dia: 50 }, anim: { vac: [0, 100] }, view: REEL.hemi, spin: 0.5 },
    { ms: 5000, caption: 'A pressure cooker’s whistle holds in 1 bar of extra steam, so water boils at about 120 °C.', set: { focus: 'cooker', wt: 82, heat: true }, view: REEL.cooker, spin: 0.4 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gH = new THREE.Group(), gS = new THREE.Group(), gM = new THREE.Group(), gC = new THREE.Group(), gB = new THREE.Group(); root.add(gH, gS, gM, gC, gB);
    gS.position.x = SX; gM.position.x = HX; gC.position.x = CX; gB.position.x = BX;

    // ------------------------------------------------ Magdeburg hemispheres
    const copper = M.metal(0xc47a4a, { roughness: 0.35, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
    const hemi = new THREE.Group(); hemi.position.set(0, 0.6, 0); gH.add(hemi);
    const halves = [-1, 1].map((sd) => {
      const g = new THREE.Group(); hemi.add(g);
      const sh = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 20, 0, Math.PI), copper); sh.rotation.y = sd < 0 ? Math.PI / 2 : -Math.PI / 2; g.add(sh);
      const flange = torus(1.02, 0.04, M.metal(0x9c5a32), 48); flange.rotation.y = Math.PI / 2; g.add(flange);
      const ring = torus(0.18, 0.03, M.metal(0x6b7280), 24); ring.position.x = sd * 1.18; ring.rotation.y = Math.PI / 2; g.add(ring);
      g.sd = sd; return g;
    });
    const gas = makeGas(160, 0.62, 0.62, 0.62, 0x8ef0ff, 0.018); hemi.add(gas);
    gas.inside = (p) => p[0] * p[0] + p[1] * p[1] + p[2] * p[2] < 0.9;
    const outA = arrowSet(14, 0x8ef0ff, 0.012, 0.05); hemi.add(outA);
    const pullA = [force(0xffb547, 0.02, 0.08), force(0xffb547, 0.02, 0.08)]; pullA.forEach((a) => gH.add(a));
    const stand = box(1.4, 0.04, 0.5, M.matte(0x4a3320)); stand.position.set(0, 0.02, 0); gH.add(stand);
    const lHemi = stage.label('', [0, 0, 0], gH, 'hot'); lHemi.element.style.setProperty('--c', COL.f);

    // ------------------------------------------------ glass and straw
    const glass = latheX([[0, 0.032], [0.14, 0.038]], M.clear(0xdff3ff, 0.22, { side: THREE.DoubleSide }), { seg: 40 }); glass.rotation.z = Math.PI / 2; glass.position.y = 0; gS.add(glass);
    const glassBase = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.006, 32), M.clear(0xdff3ff, 0.4)); glassBase.position.y = 0.003; gS.add(glassBase);
    const juice = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.033, 0.09, 32), M.clear(0xff9a2e, 0.75)); juice.position.y = 0.05; gS.add(juice);
    const strawT = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.26, 16, 1, true), M.clear(0xffffff, 0.35, { side: THREE.DoubleSide })); strawT.position.set(0.01, 0.13, 0); strawT.rotation.z = -0.12; gS.add(strawT);
    const strawJ = new THREE.Mesh(new THREE.CylinderGeometry(0.0031, 0.0031, 1, 12), M.glow(0xff9a2e)); gS.add(strawJ);
    const airA = arrowSet(4, 0x8ef0ff, 0.002, 0.01); gS.add(airA);
    const lStraw = stage.label('', [0, 0, 0], gS, 'hot'); lStraw.element.style.setProperty('--c', COL.f);

    // ------------------------------------------------ mountain, air column, snack packet
    const mtn = new THREE.Mesh(new THREE.ConeGeometry(2.2, 8849 * MTN_S, 7, 1), M.matte(0x6d6a66, { flatShading: true })); mtn.position.set(1.2, (8849 * MTN_S) / 2, -0.8); gM.add(mtn);
    const snowcap = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.5, 7, 1), M.matte(0xf4f7fb, { flatShading: true })); snowcap.position.set(1.2, 8849 * MTN_S - 0.25 + 0.01, -0.8); gM.add(snowcap);
    const sea = box(6, 0.02, 3, M.matte(0x1d4f8a)); sea.position.set(1.0, 0.01, 0); gM.add(sea);
    // air dots, thinning with height as P does
    const AIR_N = 700, airDots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.012, 6, 4), M.glow(0x8ef0ff, { transparent: true, opacity: 0.6 }), AIR_N); airDots.frustumCulled = false; gM.add(airDots);
    { const o = new THREE.Object3D(); let r = 3; const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647); let i = 0;
      while (i < AIR_N) { const y = rnd() * 12000; if (rnd() < isaP(y) / ATM) { o.position.set(3.4 + rnd() * 0.6, y * MTN_S, -0.3 + rnd() * 0.6); o.updateMatrix(); airDots.setMatrixAt(i++, o.matrix); } }
      airDots.instanceMatrix.needsUpdate = true; }
    PLACES.forEach((p) => { if (p.cabin) return; const t = box(0.3, 0.006, 0.006, M.glow(0xffffff)); t.position.set(4.15, p.h * MTN_S, 0.3); gM.add(t); });
    const placeL = PLACES.filter((p) => !p.cabin).map((p) => stage.label(`${p.name}: ${fmt(isaP(p.h) / 1000, 0)} kPa`, [4.35, p.h * MTN_S, 0.3], gM));
    placeL.forEach((l) => { l.center.set(0, 0.5); });
    const plane = new THREE.Group(); plane.position.set(2.2, 11000 * MTN_S, 0); gM.add(plane);
    const fus = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.4, 4, 12), M.plastic(0xf2f4f7)); fus.rotation.z = Math.PI / 2; plane.add(fus);
    const wing = box(0.12, 0.01, 0.5, M.plastic(0xd8dde4)); plane.add(wing);
    const packet = new THREE.Group(); gM.add(packet);
    const bag = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 12), M.plastic(0xffc21a, { roughness: 0.25, metalness: 0.4 })); bag.scale.set(1, 1.3, 0.35); packet.add(bag);
    const crimp = [0.155, -0.155].map((y) => { const c = box(0.2, 0.02, 0.02, M.plastic(0xe0a100)); c.position.y = y; packet.add(c); return c; });
    const lAlt = stage.label('', [0, 0, 0], gM, 'hot'); lAlt.element.style.setProperty('--c', COL.p);

    // ------------------------------------------------ pressure cooker on a burner
    const potM = M.metal(0xc9ced8, { roughness: 0.3 });
    const pot = latheX([[0, 0], [0, 0.11], [0.005, 0.115], [0.2, 0.115], [0.21, 0.11]], potM, { seg: 48 }); pot.rotation.z = Math.PI / 2; pot.position.y = 0.06; gC.add(pot);
    const potBase = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.004, 48), potM); potBase.position.y = 0.062; gC.add(potBase);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.115, 0.02, 48), potM); lid.position.y = 0.28; gC.add(lid);
    const handle = box(0.22, 0.02, 0.035, M.matte(0x16181d)); handle.position.set(0.2, 0.29, 0); gC.add(handle);
    const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 12), potM); vent.position.set(0, 0.305, 0); gC.add(vent);
    const whistle = new THREE.Group(); gC.add(whistle);
    const wBody = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.035, 16), M.matte(0x1b1d22)); wBody.position.y = 0.017; whistle.add(wBody);
    const wTop = sphere(0.012, M.matte(0x1b1d22), 12); wTop.position.y = 0.04; whistle.add(wTop);
    const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.06, 32), M.metal(0x2b2f36)); burner.position.y = 0.03; gC.add(burner);
    const flames = []; for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU; const fl = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.03, 8), M.glow(0x4a8dff, { transparent: true, opacity: 0.85 })); fl.position.set(Math.cos(a) * 0.08, 0.075, Math.sin(a) * 0.08); gC.add(fl); flames.push(fl); }
    const STEAM_N = 40, steam = new THREE.InstancedMesh(new THREE.SphereGeometry(0.012, 8, 6), M.ghost(0xffffff, 0.45), STEAM_N); steam.frustumCulled = false; gC.add(steam);
    const lCook = stage.label('', [0, 0, 0], gC, 'hot'); lCook.element.style.setProperty('--c', COL.hot);
    const o3 = new THREE.Object3D();

    // ------------------------------------------------ mercury barometer
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.05, 40, 1, true), M.clear(0xdff3ff, 0.3, { side: THREE.DoubleSide })); dish.position.y = 0.025; gB.add(dish);
    const hgPool = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.1, 0.03, 40), M.metal(0xd9dde4, { roughness: 0.1 })); hgPool.position.y = 0.015; gB.add(hgPool);
    const tubeB = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.95, 20, 1, true), M.clear(0xdff3ff, 0.25, { side: THREE.DoubleSide })); tubeB.position.y = 0.475 + 0.01; gB.add(tubeB);
    const tubeCap = sphere(0.012, M.clear(0xdff3ff, 0.25), 16); tubeCap.position.y = 0.96; gB.add(tubeCap);
    const hgCol = new THREE.Mesh(new THREE.CylinderGeometry(0.0105, 0.0105, 1, 20), M.metal(0xd9dde4, { roughness: 0.1 })); gB.add(hgCol);
    const scaleB = box(0.06, 0.5, 0.01, M.matte(0xf2ead8)); scaleB.position.set(0.05, 0.72, 0); gB.add(scaleB);
    for (let mm = 500; mm <= 950; mm += 10) { const t = box(mm % 50 ? 0.012 : 0.03, 0.0015, 0.012, M.matte(0x1b1d22)); t.position.set(0.035 + (mm % 50 ? 0.006 : 0), mm / 1000 + 0.03, 0.006); if (mm >= 470 && mm <= 970) gB.add(t); }
    for (const mm of [700, 750, 800]) stage.label(`${mm} mm`, [0.14, mm / 1000 + 0.03, 0], gB);
    const baroA = arrowSet(4, 0x8ef0ff, 0.006, 0.025); gB.add(baroA);
    const lBaro = stage.label('', [0, 0, 0], gB, 'hot'); lBaro.element.style.setProperty('--c', COL.p);
    stage.label('empty space: no air pushing down', [-0.02, 1.05, 0], gB);

    // ------------------------------------------------ board
    let cur = null;
    const chart = board(root, 1.6, 1.0, 800, 500, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur) return;
      const f = cur.f;
      if (f === 'hemi') {
        title(g, 'Force holding the hemispheres', 'outside air × area of the rim');
        const A = axes(g, w, h, { x0: 100, y1: 80, xMax: 100, yMax: 30, xTicks: [0, 25, 50, 75, 100], yTicks: [0, 10, 20, 30], xFmt: (v) => v + '%', yFmt: (v) => v + ' kN', xLabel: 'air pumped out →' });
        [20, 35, 50, 60].forEach((d) => { const F = (x) => ATM * x / 100 * Math.PI * (d / 200) ** 2 / 1000; const on = Math.abs(d - cur.dia) < 1; if (!on) line(g, [[0, 0], [100, Math.min(30, F(100))]], A.X, A.Y, 'rgba(255,255,255,.2)', 2); tag(g, d + ' cm', A.X(100) - 60, A.Y(Math.min(30, F(100))) - 8, 'rgba(255,255,255,.4)', '15px sans-serif'); });
        const F = (x) => ATM * x / 100 * Math.PI * (cur.dia / 200) ** 2 / 1000;
        line(g, [[0, 0], [100, F(100)]].map(([x, y]) => [x, Math.min(30, y)]), A.X, A.Y, COL.f, 5);
        if (F(cur.vac) <= 30) dot(g, A.X(cur.vac), A.Y(F(cur.vac)), COL.hot, 11);
      } else if (f === 'straw') {
        title(g, 'How high can sucking lift a drink?', 'h = ΔP ÷ ρg');
        const A = axes(g, w, h, { x0: 100, y1: 80, xMax: 101.3, yMax: 11, xTicks: [0, 25, 50, 75, 100], yTicks: [0, 2, 4, 6, 8, 10], xFmt: (v) => v + ' kPa', yFmt: (v) => v + ' m', xLabel: 'pressure drop in your mouth →' });
        line(g, [[0, 0], [101.3, 101300 / (RHO_W * G)]], A.X, A.Y, COL.f, 5);
        g.fillStyle = 'rgba(255,90,138,.15)'; g.fillRect(A.X(10), A.y1, A.X(101.3) - A.X(10), A.y0 - A.y1);
        tag(g, 'beyond human lungs', A.X(40), A.Y(1.5), COL.hot, '16px sans-serif');
        tag(g, 'perfect vacuum: 10.3 m, no more', A.X(40), A.Y(10.3) - 8, COL.dim, '16px sans-serif');
        dot(g, A.X(cur.suck), A.Y(strawH(cur)), COL.hot, 10);
      } else if (f === 'height') {
        title(g, 'Air pressure falls as you climb', 'and water boils cooler');
        const A = axes(g, w, h, { x0: 100, y1: 80, xMax: 105, yMax: 11, xTicks: [0, 25, 50, 75, 100], yTicks: [0, 2, 4, 6, 8, 10], xFmt: (v) => v + ' kPa', yFmt: (v) => v + ' km', xLabel: 'pressure →' });
        const pts = []; for (let y = 0; y <= 11000; y += 100) pts.push([isaP(y) / 1000, y / 1000]);
        line(g, pts, A.X, A.Y, COL.p, 5);
        dot(g, A.X(isaP(cur.alt) / 1000), A.Y(cur.alt / 1000), COL.hot, 11);
        tag(g, `water boils at ${fmt(boilT(isaP(cur.alt)), 0)} °C here`, A.X(isaP(cur.alt) / 1000) + 16, A.Y(cur.alt / 1000) + 6, COL.hot, 'bold 17px sans-serif', w);
      } else if (f === 'cooker') {
        title(g, 'Boiling point vs pressure', 'more pressure, hotter boiling');
        const A = axes(g, w, h, { x0: 100, y1: 80, xMax: 3, yMin: 60, yMax: 140, xTicks: [0, 1, 2, 3], yTicks: [60, 80, 100, 120, 140], xFmt: (v) => v + ' bar', yFmt: (v) => v + ' °C', xLabel: 'absolute pressure →' });
        const pts = []; for (let p = 0.2; p <= 3; p += 0.05) pts.push([p, boilT(p * BAR)]);
        line(g, pts, A.X, A.Y, COL.hot, 5);
        [[isaP(8849), 'Everest'], [ATM, 'open pan'], [ATM + cur.set, 'your cooker']].forEach(([p, n], i) => { dot(g, A.X(p / BAR), A.Y(boilT(p)), i === 2 ? COL.hot : COL.p, i === 2 ? 11 : 7); tag(g, `${n}: ${fmt(boilT(p), 0)} °C`, A.X(p / BAR) + 14, A.Y(boilT(p)) + 20, i === 2 ? COL.hot : COL.dim, '16px sans-serif', w); });
      } else {
        title(g, 'Mercury height and the weather', 'h = P ÷ (ρ_Hg g)');
        const A = axes(g, w, h, { x0: 100, y1: 80, xMin: 900, xMax: 1060, yMin: 670, yMax: 800, xTicks: [900, 950, 1000, 1050], yTicks: [680, 720, 760, 800], xFmt: String, yFmt: (v) => v + ' mm', xLabel: 'hPa →' });
        line(g, [[900, 90000 / (RHO_HG * G) * 1000], [1060, 106000 / (RHO_HG * G) * 1000]], A.X, A.Y, COL.p, 5);
        [[912, 'Odisha 1999'], [1013, 'average']].forEach(([p, n]) => tag(g, n, A.X(p) - 20, A.Y(p * 100 / (RHO_HG * G) * 1000) - 16, COL.dim, '15px sans-serif'));
        dot(g, A.X(cur.hpa), A.Y(cur.hpa * 100 / (RHO_HG * G) * 1000), COL.hot, 11);
        tag(g, weather(cur.hpa), 110, h - 90, COL.f, 'bold 19px sans-serif');
      }
    }, [0, 0, 0]);
    const BOARD = { hemi: [1.55, 0.75, -0.4, 0.62, -0.45], straw: [SX + 0.27, 0.18, -0.12, 0.12, -0.5], height: [HX - 0.35, 0.6, 1.4, 0.85, 0.25], cooker: [CX + 0.52, 0.3, -0.2, 0.3, -0.5], baro: [BX - 0.8, 0.3, -0.25, 0.45, 0.45] };
    const RB = { hemi: [0.1, 1.55, -0.6, 0.8, 0], height: [HX + 0.9, 3.0, -1.0, 1.7, 0], cooker: [CX + 0.02, 0.58, -0.2, 0.28, 0] };

    const st = {};
    let lastBoard = '', vacNow = 95, sHt = 0, altNow = 3500, cookP = 0, lift = 0, hgNow = 0.76;
    return {
      update(dt, s, time) {
        dt = Math.max(0, dt);
        focusView(stage, st, s.focus, VIEWS);
        const narrow = fitNarrow(stage, placeL.slice(1, 4));
        const f = s.focus;
        gH.visible = f === 'hemi'; gS.visible = f === 'straw'; gM.visible = f === 'height'; gC.visible = f === 'cooker'; gB.visible = f === 'baro';
        placeBoard(chart, f, BOARD, RB, narrow);
        if (f === 'hemi') {
          vacNow = approach(vacNow, s.vac, 3, dt);
          const r = s.dia / 200, k = r / 0.25 * 0.3;
          hemi.scale.setScalar(k);
          const F = ATM * vacNow / 100 * Math.PI * r * r, horses = F / HORSE;
          const gap = vacNow < 2 ? 0.15 : 0;
          halves.forEach((h) => { h.position.x = h.sd * gap; });
          gas.show = Math.round(160 * (1 - vacNow / 100)); gas.step(dt, 0.8);
          outA.list.forEach((a, i) => { const th = (i / outA.list.length) * TAU; const d = [Math.cos(th), Math.sin(th), 0.25 * Math.sin(th * 3)]; const n = Math.hypot(...d); const u = d.map((q) => q / n); a.aim(u.map((q) => q * 1.55), u.map((q) => -q), 0.45); });
          pullA.forEach((a, i) => { const sd = i ? 1 : -1; a.aim([sd * (k * 1.2 + 0.02 + gap * k), 0.6, 0], [sd, 0, 0], 0.12 + Math.min(0.45, horses * 0.02)); });
          lHemi.position.set(0, 0.6 + k * 1.35, 0); lHemi.element.innerHTML = `held by <b>${fmtN(F)}</b> · ≈ ${fmt(horses, 0)} horses a side`;
        } else if (f === 'straw') {
          const hNeed = 0.26 - 0.09, hh = strawH(s);
          sHt = approach(sHt, Math.min(hNeed + 0.02, hh), 5, dt);
          const top = 0.095 + sHt, bot = 0.02;
          // along the tilted straw: x = 0.01 + (y − 0.13) tan 0.12
          strawJ.scale.y = Math.max(0.001, (top - bot) / Math.cos(0.12)); strawJ.position.set(0.01 + ((top + bot) / 2 - 0.13) * Math.tan(0.12), (top + bot) / 2, 0); strawJ.rotation.z = -0.12;
          airA.list.forEach((a, i) => a.aim([-0.028 + i * 0.016 + (i > 1 ? 0.012 : 0), 0.14, 0.0], [0, -1, 0], 0.04));
          lStraw.position.set(0.02, 0.29, 0); lStraw.element.innerHTML = hh >= hNeed ? `lifted <b>${fmt(hh * 100, 0)} cm</b> · you’re drinking` : `lifted <b>${fmt(hh * 100, 1)} cm</b> of ${fmt(hNeed * 100, 0)} cm`;
        } else if (f === 'height') {
          altNow = approach(altNow, s.alt, 3, dt);
          const P = isaP(altNow), V = Math.min(1.9, ATM / P * 0.55);
          packet.position.set(0.35, altNow * MTN_S + 0.2, 0.5);
          const puff = Math.min(1, V);
          bag.scale.set(1, 1.3, 0.12 + 0.3 * puff);
          lAlt.position.set(0.35, altNow * MTN_S + 0.55, 0.5); lAlt.element.innerHTML = `${fmt(altNow, 0)} m: <b>${fmt(P / 1000, 0)} kPa</b> · ${fmt(P / ATM, 2)} atm`;
        } else if (f === 'cooker') {
          const set = cookerSet(s);
          cookP = approach(cookP, s.heat ? set * 1.02 : 0, s.heat ? 0.6 : 0.4, dt);
          const venting = s.heat && cookP >= set;
          if (venting) cookP = set;
          lift = approach(lift, venting ? 0.004 + 0.003 * Math.abs(Math.sin(time * 23)) : 0, 20, dt);
          whistle.position.set(0, 0.315 + lift, 0);
          flames.forEach((fl, i) => { fl.visible = s.heat; fl.scale.y = 0.8 + 0.3 * Math.sin(time * 17 + i); });
          for (let i = 0; i < STEAM_N; i++) {
            const ph = ((i / STEAM_N) + time * 0.9) % 1;
            o3.position.set(Math.sin(i * 2.3) * 0.02 * ph, 0.36 + ph * 0.25, Math.cos(i * 1.7) * 0.02 * ph); o3.scale.setScalar(venting ? 0.6 + ph * 2 : 0.0001); o3.updateMatrix(); steam.setMatrixAt(i, o3.matrix);
          }
          steam.instanceMatrix.needsUpdate = true;
          lCook.position.set(0.12, 0.55, 0); lCook.element.innerHTML = `${fmt(cookP / BAR, 2)} bar gauge · boils at <b>${fmt(boilT(ATM + cookP), 0)} °C</b>${venting ? ' · whistle!' : ''}`;
        } else {
          const h = (s.hpa * 100) / (RHO_HG * G);
          hgNow = approach(hgNow, h, 4, dt);
          hgCol.scale.y = hgNow; hgCol.position.y = 0.03 + hgNow / 2;
          baroA.list.forEach((a, i) => a.aim([-0.1 + i * 0.065 + (i > 1 ? 0.04 : 0), 0.25, 0.04], [0, -1, 0], 0.18));
          lBaro.position.set(-0.2, 0.03 + hgNow, 0); lBaro.element.innerHTML = `<b>${fmt(hgNow * 1000, 0)} mm</b> of mercury`;
        }
        const bk = `${f}|${s.dia}|${s.vac}|${s.suck}|${s.alt}|${s.wt}|${s.hpa}`;
        if (bk !== lastBoard) { lastBoard = bk; cur = { f, dia: s.dia, vac: s.vac, suck: s.suck, alt: s.alt, set: cookerSet(s), hpa: s.hpa }; chart.redraw(); }
      },
      readout(s) {
        const f = s.focus;
        if (f === 'hemi') {
          const A = Math.PI * (s.dia / 200) ** 2, F = hemiF(s);
          return `<div class="big">Held shut by ${fmtN(F)}</div>
            <div class="row"><span>Air outside · inside</span><b>${fmt(ATM / 1000, 0)} · ${fmt(ATM * (1 - s.vac / 100) / 1000, 0)} kPa</b></div>
            <div class="row"><span>Area of the rim circle, π r²</span><b>${fmt(A, 3)} m²</b></div>
            <div class="row"><span>Like holding up</span><b>${fmt(F / G, 0)} kg</b></div>
            <div class="row"><span>Horses a side, at about 1 kN each</span><b>${fmt(F / HORSE, 0)}</b></div>
            <small>The empty inside doesn’t pull. The air outside pushes.</small>`;
        }
        if (f === 'straw') {
          const hh = strawH(s);
          return `<div class="big">Lifts the drink ${fmt(hh * 100, 0)} cm</div>
            <div class="row"><span>Pressure in your mouth</span><b>${fmt(ATM / 1000 - s.suck, 1)} kPa</b></div>
            <div class="row"><span>Air pressing on the drink</span><b>${fmt(ATM / 1000, 1)} kPa</b></div>
            <div class="row"><span>Height, ΔP ÷ ρg</span><b>${fmt(hh, 2)} m</b></div>
            <small>The air pushes the drink up. Even a perfect pump can’t lift water more than 10.3 m this way.</small>`;
        }
        if (f === 'height') {
          const P = isaP(s.alt);
          return `<div class="big">${fmt(P / 1000, 1)} kPa at ${fmt(s.alt, 0)} m</div>
            <div class="row"><span>Compared with sea level</span><b>${fmt((P / ATM) * 100, 0)}%</b></div>
            <div class="row"><span>Oxygen in each breath</span><b>${fmt((P / ATM) * 100, 0)}% of sea level</b></div>
            <div class="row"><span>Water boils at</span><b>${fmt(boilT(P), 1)} °C</b></div>
            <div class="row"><span>A sealed packet grows to</span><b>${fmt(ATM / P, 1)}× (if it could)</b></div>
            <small>Standard atmosphere. Airliner cabins are kept at about 0.75 atm, like 2,400 m.</small>`;
        }
        if (f === 'cooker') {
          const set = cookerSet(s);
          return `<div class="big">Whistles at ${fmt(set / BAR, 2)} bar</div>
            <div class="row"><span>Whistle weight, m g</span><b>${s.wt} g → ${fmt((s.wt / 1000) * G, 2)} N</b></div>
            <div class="row"><span>Vent hole, 3.2 mm</span><b>${fmt(VENT * 1e6, 1)} mm²</b></div>
            <div class="row"><span>Pressure to lift it, F ÷ A</span><b>${fmtP(set)} gauge</b></div>
            <div class="row"><span>Water boils at</span><b>${fmt(boilT(ATM + set), 0)} °C</b></div>
            <small>A heavier whistle holds more pressure. A safety valve lets go if the vent ever blocks.</small>`;
        }
        const h = (s.hpa * 100) / (RHO_HG * G);
        return `<div class="big">${fmt(h * 1000, 0)} mm of mercury</div>
          <div class="row"><span>Air pressure</span><b>${s.hpa} hPa = ${fmt(s.hpa / 1013.25, 3)} atm</b></div>
          <div class="row"><span>In a water barometer</span><b>${fmt((s.hpa * 100) / (RHO_W * G), 1)} m tall</b></div>
          <div class="row"><span>Likely weather</span><b>${weather(s.hpa)}</b></div>
          <small>Mercury is 13.6 times denser than water, so the tube only needs to be about a metre.</small>`;
      },
    };
  },
};
