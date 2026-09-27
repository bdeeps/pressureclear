// Shared parts for PressureClear: constants and unit conversions, chart boards, arrows that point
// anywhere, a soft "bed" (sand, snow, foam) that dents under footprints, a simple person, and small
// physics helpers (hydrostatic pressure, the standard atmosphere, water's boiling point).
// Scenes are built in metres unless a chapter says otherwise: +x to the right, +y up, +z towards you.
// Boards, arrows, focus switching and the person follow ForceClear and MomentumClear (same kit).
import { THREE, M, box, sphere, torus, arrow, canvasTexture, clamp, lerp, smooth, approach } from './kit.js';

// ---------------------------------------------------------------- constants
export const G = 9.81;                 // m/s², standard gravity (9.80665 exactly, 3rd CGPM 1901)
export const ATM = 101325;             // Pa, one standard atmosphere (exact, 10th CGPM 1954)
export const BAR = 1e5;                // Pa, exact
export const PSI = 6894.757;           // Pa per pound-force per square inch
export const MMHG = 133.322;           // Pa per millimetre of mercury (conventional, 13,595.1 kg/m³ × g)
export const RHO_W = 1000;             // kg/m³, fresh water
export const RHO_SEA = 1025;           // kg/m³, surface seawater
export const RHO_BLOOD = 1060;         // kg/m³, whole blood (Guyton & Hall: 1.05–1.06 g/mL)
export const RHO_HG = 13595.1;         // kg/m³, mercury at 0 °C
export const TAU = Math.PI * 2;
export const D2R = Math.PI / 180;

// ---------------------------------------------------------------- physics
// Pressure under a fluid column: ρ g h (gauge, i.e. above the air pressure on top).
export const hydro = (rho, h) => rho * G * h;
// International Standard Atmosphere, troposphere (0–11 km): P = P₀ (1 − L h ÷ T₀)^(g M ÷ R L)
// with L = 0.0065 K/m, T₀ = 288.15 K, exponent 5.25588 (ICAO Doc 7488; US Standard Atmosphere 1976).
// Above 11 km the stratosphere is isothermal at 216.65 K: P = 22,632 exp(−(h − 11,000) ÷ 6,341.6).
export function isaP(h) {
  if (h <= 11000) return ATM * Math.pow(1 - 2.25577e-5 * h, 5.25588);
  return 22632.1 * Math.exp(-(h - 11000) / 6341.62);
}
// Boiling point of water at absolute pressure P (Pa), from the Antoine equation for water
// (log₁₀ P[mmHg] = A − B ÷ (C + T[°C]); A, B, C from Dortmund Data Bank / NIST fits:
// 8.07131, 1730.63, 233.426 for 1–100 °C and 8.14019, 1810.94, 244.485 for 99–374 °C).
export function boilT(P) {
  const mm = P / MMHG, lg = Math.log10(Math.max(1e-3, mm));
  const lo = 1730.63 / (8.07131 - lg) - 233.426;
  return lo <= 100 ? lo : 1810.94 / (8.14019 - lg) - 244.485;
}

// ---------------------------------------------------------------- formatting
export const fmt = (v, d = 1) => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString('en-IN') : v.toFixed(d));
const sig = (v) => (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2));
// A pressure in the most readable SI multiple: 850 Pa, 4.2 kPa, 5.9 MPa.
export function fmtP(P) {
  const a = Math.abs(P), s = P < 0 ? '−' : '';
  if (a >= 1e9) return s + sig(a / 1e9) + ' GPa';
  if (a >= 1e6) return s + sig(a / 1e6) + ' MPa';
  if (a >= 1e3) return s + sig(a / 1e3) + ' kPa';
  return s + (a >= 10 ? a.toFixed(0) : a.toFixed(1)) + ' Pa';
}
export const fmtBar = (P, d = 2) => fmt(P / BAR, d) + ' bar';
export function fmtN(F) {
  const a = Math.abs(F);
  if (a >= 1e6) return (a / 1e6).toFixed(1) + ' MN';
  if (a >= 1e4) return (a / 1000).toFixed(a >= 1e5 ? 0 : 1) + ' kN';
  if (a >= 100) return Math.round(a).toLocaleString('en-IN') + ' N';
  return a.toFixed(a >= 10 ? 0 : 1) + ' N';
}
export const fmtArea = (A) => (A >= 1 ? fmt(A, 2) + ' m²' : A >= 1e-4 ? fmt(A * 1e4, A >= 1e-2 ? 0 : 1) + ' cm²' : fmt(A * 1e6, 2) + ' mm²');
// The same pressure in the units people actually meet.
export const UNITS = [
  { u: 'Pa', k: 1, note: 'pascal, N/m²' },
  { u: 'kPa', k: 1e3, note: 'weather, tyres' },
  { u: 'bar', k: BAR, note: 'tyres, cookers' },
  { u: 'atm', k: ATM, note: 'air at sea level' },
  { u: 'psi', k: PSI, note: 'pumps, US tyres' },
  { u: 'mmHg', k: MMHG, note: 'blood pressure' },
];
const nice = (v) => (v >= 1e6 ? v.toExponential(2).replace('e+', ' × 10^') : v >= 1000 ? Math.round(v).toLocaleString('en-IN') : v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v >= 1 ? v.toFixed(2) : v.toFixed(3));
// Draw the units board: one pressure P written six ways.
export function unitsList(g, x, y, P, { w = 320, rowH = 44, big = 26 } = {}) {
  g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('the same pressure in…', x, y);
  UNITS.forEach((q, i) => {
    const yy = y + 18 + (i + 0.8) * rowH;
    g.fillStyle = i % 2 ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.07)'; g.fillRect(x - 8, yy - rowH * 0.72, w, rowH);
    g.font = `bold ${big}px sans-serif`; g.fillStyle = '#e8eef8';
    const v = nice(P / q.k); g.fillText(v, x, yy);
    const vw = g.measureText(v).width;
    g.font = `bold ${big - 6}px sans-serif`; g.fillStyle = '#8ef0ff'; g.fillText(q.u, x + vw + 10, yy);
    g.font = '15px sans-serif'; g.fillStyle = 'rgba(255,255,255,.5)'; const nw = g.measureText(q.note).width; g.fillText(q.note, x + w - nw - 16, yy);
  });
}

// ---------------------------------------------------------------- boards
export const COL = { p: '#8ef0ff', f: '#ffb547', a: '#7be08c', hot: '#ff5a8a', warn: '#ff7a59', soft: '#c49bff', dim: 'rgba(255,255,255,.45)', water: '#4aa8ff' };
export function panelBg(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,.9)'; g.fillRect(0, 0, w, h); }
export function board(root, w, h, pxW, pxH, draw, pos) {
  const tex = canvasTexture(pxW, pxH, draw);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex.tex, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
  m.position.set(...pos); root.add(m);
  return Object.assign(tex, { mesh: m });
}
export function title(g, text, sub = '', x = 20) {
  g.fillStyle = '#e8eef8'; g.font = 'bold 24px sans-serif'; g.fillText(text, x, 34);
  if (sub) { g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText(sub, x, 58); }
}
// Axes with a grid. logX / logY take the axis limits as powers of ten.
export function axes(g, w, h, { x0 = 84, x1 = w - 28, y0 = h - 64, y1 = 70, xMax, yMax, xMin = 0, yMin = 0, xTicks, yTicks, xFmt = String, yFmt = String, xLabel = '', yLabel = '', logX = false, logY = false }) {
  const X = logX ? (x) => x0 + ((Math.log10(x) - xMin) / (xMax - xMin)) * (x1 - x0) : (x) => x0 + ((x - xMin) / (xMax - xMin)) * (x1 - x0);
  const Y = logY ? (y) => y0 - ((Math.log10(Math.max(1e-12, y)) - yMin) / (yMax - yMin)) * (y0 - y1) : (y) => y0 - ((y - yMin) / (yMax - yMin)) * (y0 - y1);
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.fillStyle = 'rgba(255,255,255,.6)'; g.font = '18px sans-serif';
  for (const t of xTicks) { g.beginPath(); g.moveTo(X(t), y1); g.lineTo(X(t), y0); g.stroke(); const s = xFmt(t); g.fillText(s, X(t) - g.measureText(s).width / 2, y0 + 26); }
  for (const t of yTicks) { g.beginPath(); g.moveTo(x0, Y(t)); g.lineTo(x1, Y(t)); g.stroke(); const s = yFmt(t); g.fillText(s, x0 - 10 - g.measureText(s).width, Y(t) + 6); }
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '17px sans-serif';
  if (xLabel) g.fillText(xLabel, x1 - g.measureText(xLabel).width, y0 + 50);
  if (yLabel) g.fillText(yLabel, x0 + 8, y1 - 10);
  return { X, Y, x0, x1, y0, y1 };
}
export function dot(g, x, y, col, r = 10) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
export function line(g, pts, X, Y, col, wdt = 5, dash = null) {
  if (pts.length < 2) return;
  g.strokeStyle = col; g.lineWidth = wdt; g.setLineDash(dash || []); g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
  g.stroke(); g.setLineDash([]);
}
export function tag(g, text, x, y, col, font = 'bold 19px sans-serif', w = null) {
  g.font = font; g.fillStyle = col;
  const tw = g.measureText(text).width;
  g.fillText(text, w ? Math.min(x, w - tw - 12) : x, y);
}
// Horizontal bars on a log scale (pressures span many powers of ten). rows = [{ name, v, col, dim }].
export function logBars(g, { x0, x1, y0, rowH = 56, lo, hi, rows, fmtV = fmtP, marks = [] }) {
  const X = (v) => x0 + ((Math.log10(Math.max(v, 10 ** lo)) - lo) / (hi - lo)) * (x1 - x0);
  g.font = '15px sans-serif';
  for (let e = lo; e <= hi; e++) { g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.beginPath(); g.moveTo(X(10 ** e), y0 - 10); g.lineTo(X(10 ** e), y0 + rows.length * rowH); g.stroke(); g.fillStyle = 'rgba(255,255,255,.45)'; const s = fmtP(10 ** e); g.fillText(s, X(10 ** e) - g.measureText(s).width / 2, y0 + rows.length * rowH + 20); }
  marks.forEach((m) => { g.strokeStyle = m.col; g.setLineDash([6, 5]); g.lineWidth = 2; g.beginPath(); g.moveTo(X(m.v), y0 - 16); g.lineTo(X(m.v), y0 + rows.length * rowH); g.stroke(); g.setLineDash([]); tag(g, m.name, X(m.v) + 6, y0 - 18, m.col, '15px sans-serif', x1 + 40); });
  rows.forEach((r, i) => {
    const y = y0 + i * rowH;
    g.globalAlpha = r.dim ? 0.4 : 1;
    g.fillStyle = r.col; g.fillRect(x0, y + 6, Math.max(3, X(r.v) - x0), rowH * 0.48);
    g.font = 'bold 18px sans-serif'; g.fillStyle = '#e8eef8'; g.fillText(r.name, x0 + 8, y + rowH * 0.48);
    const s = fmtV(r.v); g.font = 'bold 18px sans-serif'; g.fillStyle = r.col;
    const tx = X(r.v) + 10, tw = g.measureText(s).width;
    g.fillText(s, tx + tw > x1 + 60 ? X(r.v) - tw - 10 : tx, y + rowH * 0.48 + (tx + tw > x1 + 60 ? 26 : 0));
    g.globalAlpha = 1;
  });
  return X;
}

// ---------------------------------------------------------------- stage helpers
// True while the Glassbox studio records the reel: scenes then choose their own camera views.
export const inReel = () => document.body.classList.contains('gb-reel');
// On a phone-width stage: hide the minor labels and nudge the picture down, clear of the readout.
export function fitNarrow(stage, minor = []) {
  const narrow = stage.host.clientWidth < 560;
  minor.forEach((l) => { if (l) l.visible = !narrow; });
  const y = narrow && !inReel() ? -0.14 : 0;
  if (!stage.shift || stage.shift[1] !== y) stage.setShift(0, y);
  return narrow;
}
// Switch the camera when a chapter's "Look at" choice changes (not while the reel is recording).
export function focusView(stage, st, focus, views) {
  if (focus === st.focus) return false;
  if (st.focus !== undefined && !inReel()) stage.setView(views[focus].pos, views[focus].target, 1.0);
  st.focus = focus;
  return true;
}
// Place a board for the current focus: B = { focus: [x, y, z, scale, rotY] }, R = reel overrides.
export function placeBoard(b, f, B, R = {}, narrow = false) {
  const p = (inReel() && R[f]) || B[f];
  if (!p) { b.mesh.visible = false; return; }
  b.mesh.visible = !narrow || inReel();
  b.mesh.position.set(p[0], p[1], p[2]); b.mesh.scale.setScalar(p[3] ?? 1); b.mesh.rotation.set(0, p[4] ?? 0, 0);
}

// ---------------------------------------------------------------- arrows
// A kit arrow that can point any way: aim(from, dir, len). dir is a unit-ish [x, y, z].
const UP = new THREE.Vector3(0, 1, 0), tmpV = new THREE.Vector3();
export function force(color, r = 0.03, head = 0.14) {
  const a = arrow(color, 1, head, r);
  a.renderOrder = 10;
  a.traverse((o) => { if (o.material) { o.material.depthTest = false; o.material.transparent = true; o.renderOrder = 10; } });
  a.aim = (from, dir, len) => {
    a.position.set(...from);
    tmpV.set(...dir); if (tmpV.lengthSq() < 1e-9) tmpV.set(0, -1, 0);
    a.quaternion.setFromUnitVectors(UP, tmpV.normalize());
    a.set(Math.max(0.001, len));
    if (len < 0.01) a.visible = false;
  };
  return a;
}
// A fan of arrows pushing in on a surface: pressure acts at right angles to every surface.
export function arrowSet(n, color, r = 0.012, head = 0.05) {
  const g = new THREE.Group(); g.list = [];
  for (let i = 0; i < n; i++) { const a = force(color, r, head); g.add(a); g.list.push(a); }
  return g;
}

// ---------------------------------------------------------------- soft ground
// A soft bed (sand, snow, foam) seen as a slab whose top surface dents under footprints.
// setDents([{ x, z, hw, hd, depth, round }]): footprints in the bed's local x/z, half sizes hw × hd
// (or radius hw when round), pressed down by 'depth' metres, with a soft rim.
export function makeBed(w, d, { color = 0xc4a46c, side = 0xb89a60, seg = 120, thick = 0.1, rim = 0.04, shadeDepth = 0.06 } = {}) {
  const g = new THREE.Group();
  const geo = new THREE.PlaneGeometry(w, d, seg, Math.round((seg * d) / w)); geo.rotateX(-Math.PI / 2);
  const cols = new Float32Array(geo.attributes.position.count * 3); geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const c0 = new THREE.Color(color);
  const top = new THREE.Mesh(geo, M.matte(0xffffff, { roughness: 0.95, vertexColors: true })); top.receiveShadow = true; g.add(top);
  const body = box(w, thick, d, M.matte(side)); body.position.y = -thick / 2 - 0.002; g.add(body);
  const pos = geo.attributes.position, base = pos.array.slice();
  let key = '';
  g.setDents = (list) => {
    const k = list.map((f) => `${f.x.toFixed(3)},${f.z.toFixed(3)},${f.hw},${f.hd},${f.depth.toFixed(4)}`).join('|');
    if (k === key) return; key = k;
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3], z = base[i * 3 + 2];
      let y = 0;
      for (const f of list) {
        let out;
        if (f.round) out = Math.hypot(x - f.x, z - f.z) - f.hw;
        else out = Math.max(Math.abs(x - f.x) - f.hw, Math.abs(z - f.z) - f.hd);
        const r = f.rim ?? rim;
        const k2 = out <= 0 ? 1 : out >= r ? 0 : 1 - smooth(out / r);
        y = Math.min(y, -f.depth * k2);
        if (out > 0 && out < r * 2.2) y += f.depth * 0.12 * Math.sin(clamp(out / (r * 2.2), 0, 1) * Math.PI) * (1 - k2); // a small pushed-up lip
      }
      pos.setY(i, y);
      // darker where it is pressed down, and a faint grain so the surface reads as sand or snow
      const n = 0.96 + 0.04 * Math.sin(x * 157 + z * 91) * Math.sin(x * 43 - z * 131);
      const k3 = (1 - 0.4 * clamp(-y / Math.max(0.02, shadeDepth), 0, 1)) * n;
      cols[i * 3] = c0.r * k3; cols[i * 3 + 1] = c0.g * k3; cols[i * 3 + 2] = c0.b * k3;
    }
    geo.attributes.color.needsUpdate = true;
    pos.needsUpdate = true; geo.computeVertexNormals();
  };
  g.setDents([]);
  return g;
}

// ---------------------------------------------------------------- simple models
export function disc(r, h, mat, seg = 40) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat); m.castShadow = true; m.receiveShadow = true; return m; }
// A person standing with feet at the origin, facing +x. pose({ arm, lean, stride, sit }).
export function makePerson({ shirt = 0x3b6fd8, pants = 0x2b3242, skin = 0xc68b64, hair = 0x1b1410, s = 1 } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const cloth = M.matte(shirt), jeans = M.matte(pants), sk = M.matte(skin);
  const hipY = 0.92 * s;
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.16 * s, 0.38 * s, 6, 14), cloth); torso.position.y = 0.3 * s; torso.scale.z = 1.25; torso.castShadow = true; body.add(torso);
  const head = sphere(0.11 * s, sk, 24); head.position.y = 0.74 * s; body.add(head);
  const hairM = new THREE.Mesh(new THREE.SphereGeometry(0.115 * s, 20, 10, 0, TAU, 0, 1.3), M.matte(hair)); hairM.position.copy(head.position); hairM.rotation.z = 0.35; body.add(hairM);
  const limb = (len, r, mat) => { const p = new THREE.Group(); const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len - 2 * r, 4, 10), mat); m.position.y = -len / 2; m.castShadow = true; p.add(m); return p; };
  const arms = [-1, 1].map((z) => { const a = limb(0.62 * s, 0.05 * s, cloth); a.position.set(0, 0.52 * s, z * 0.22 * s); body.add(a); const hand = sphere(0.05 * s, sk, 12); hand.position.y = -0.62 * s; a.add(hand); return a; });
  const legs = [-1, 1].map((z) => { const l = limb(0.88 * s, 0.065 * s, jeans); l.position.set(0, hipY, z * 0.1 * s); g.add(l); const shoe = box(0.26 * s, 0.07 * s, 0.1 * s, M.matte(0x1b1d22)); shoe.position.set(0.05 * s, -0.88 * s, 0); l.add(shoe); l.shoe = shoe; return l; });
  body.position.y = hipY;
  g.legs = legs; g.arms = arms; g.body = body; g.head = head;
  g.pose = ({ arm = 0, lean = 0, stride = 0, sit = 0, armZ = 0 } = {}) => {
    arms[0].rotation.set(armZ, 0, arm - stride * 0.8); arms[1].rotation.set(-armZ, 0, arm + stride * 0.8);
    body.rotation.z = -lean;
    legs[0].rotation.z = stride + sit; legs[1].rotation.z = -stride + sit;
  };
  return g;
}
// Gas molecules bouncing in a box of half sizes (hx, hy, hz) centred at c. count(n) shows the first n.
export function makeGas(N, hx, hy, hz, color = 0x8ef0ff, r = 0.012) {
  const m = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 8, 6), M.glow(color), N);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false;
  const P = [], V = [], o = new THREE.Object3D();
  let rnd = 7; const rand = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < N; i++) { P.push([(rand() * 2 - 1) * hx, (rand() * 2 - 1) * hy, (rand() * 2 - 1) * hz]); const a = rand() * TAU, b = rand() * 2 - 1, s = Math.sqrt(1 - b * b); V.push([Math.cos(a) * s, b, Math.sin(a) * s]); }
  m.show = N; m.bounds = [hx, hy, hz]; m.inside = null;
  m.step = (dt, speed = 0.6) => {
    const [bx, by, bz] = m.bounds;
    for (let i = 0; i < N; i++) {
      const p = P[i], v = V[i];
      for (let k = 0; k < 3; k++) { p[k] += v[k] * speed * dt; const b = [bx, by, bz][k]; if (p[k] > b) { p[k] = b; v[k] = -Math.abs(v[k]); } if (p[k] < -b) { p[k] = -b; v[k] = Math.abs(v[k]); } }
      if (m.inside && !m.inside(p)) { p[0] *= 0.5; p[1] *= 0.5; p[2] *= 0.5; }
      o.position.set(...p); o.scale.setScalar(i < m.show ? 1 : 0.0001); o.updateMatrix(); m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  };
  m.step(0);
  return m;
}
// Water: a slightly blue, see-through material.
export const waterMat = (o = {}) => M.clear(0x3d8fe0, 0.42, { roughness: 0.1, ...o });

export { clamp, lerp, smooth, approach, THREE, M, box, sphere, torus };
