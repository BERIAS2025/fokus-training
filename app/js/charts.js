// Einfache SVG-Diagramme ohne Bibliothek
import { esc } from './ui.js';

const fmtDay = ts => { const d = new Date(ts); return `${d.getDate()}.${d.getMonth() + 1}.`; };

// series: [{ name, color, dash, points: [[ts, value]] }]
export function lineChart({ series, w = 1000, h = 300, yMax = 1, yFmt = v => Math.round(v * 100) + ' %', markers = [], yTicks = 4 }) {
  const pad = { l: 64, r: 16, t: 14, b: 34 };
  const all = series.flatMap(s => s.points);
  if (!all.length) return `<div class="empty-state">Keine Daten im Zeitraum.</div>`;
  let x0 = Math.min(...all.map(p => p[0])), x1 = Math.max(...all.map(p => p[0]));
  if (x1 === x0) { x0 -= 43200000; x1 += 43200000; }
  const X = t => pad.l + (t - x0) / (x1 - x0) * (w - pad.l - pad.r);
  const Y = v => pad.t + (1 - v / yMax) * (h - pad.t - pad.b);
  let g = '';
  for (let i = 0; i <= yTicks; i++) {
    const v = yMax * i / yTicks;
    g += `<line class="grid" x1="${pad.l}" x2="${w - pad.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${pad.l - 8}" y="${Y(v) + 5}" text-anchor="end">${yFmt(v)}</text>`;
  }
  const nx = Math.min(8, new Set(all.map(p => p[0])).size);
  for (let i = 0; i < nx; i++) {
    const t = x0 + (x1 - x0) * (nx === 1 ? 0.5 : i / (nx - 1));
    g += `<text x="${X(t)}" y="${h - 10}" text-anchor="middle">${fmtDay(t)}</text>`;
  }
  markers.forEach(m => {
    g += `<line x1="${X(m.ts)}" x2="${X(m.ts)}" y1="${pad.t}" y2="${h - pad.b}" stroke="var(--yellow-dark)" stroke-width="2" stroke-dasharray="6 5"/><text x="${X(m.ts) + 4}" y="${pad.t + 14}" style="fill:var(--yellow-dark);font-weight:700">${esc(m.label)}</text>`;
  });
  series.forEach(s => {
    const pts = [...s.points].sort((a, b) => a[0] - b[0]);
    if (!pts.length) return;
    g += `<polyline fill="none" stroke="${s.color}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" ${s.dash ? `stroke-dasharray="${s.dash}"` : ''} points="${pts.map(p => `${X(p[0]).toFixed(1)},${Y(Math.min(yMax, p[1])).toFixed(1)}`).join(' ')}"/>`;
    pts.forEach(p => { g += `<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(Math.min(yMax, p[1])).toFixed(1)}" r="${s.marker === 'square' ? 0 : 5}" fill="${s.color}"/>${s.marker === 'square' ? `<rect x="${X(p[0]) - 5}" y="${Y(Math.min(yMax, p[1])) - 5}" width="10" height="10" fill="${s.color}"/>` : ''}`; });
  });
  g += `<line class="axis" x1="${pad.l}" x2="${w - pad.r}" y1="${h - pad.b}" y2="${h - pad.b}"/>`;
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" width="100%">${g}</svg>` + legend(series);
}

export function legend(series) {
  return `<div class="legend">${series.map(s => `<span><i style="background:${s.color};${s.dash ? 'background:repeating-linear-gradient(90deg,' + s.color + ' 0 6px,transparent 6px 10px)' : ''}"></i>${esc(s.name)}</span>`).join('')}</div>`;
}

// Balken je Tag (z. B. Spielminuten)
export function barChart({ bars, w = 1000, h = 200, color = 'var(--blue)', yFmt = v => v }) {
  if (!bars.length) return `<div class="empty-state">Keine Daten im Zeitraum.</div>`;
  const pad = { l: 64, r: 16, t: 10, b: 34 };
  const max = Math.max(1, ...bars.map(b => b[1]));
  const bw = (w - pad.l - pad.r) / bars.length;
  let g = `<text x="${pad.l - 8}" y="${pad.t + 10}" text-anchor="end">${yFmt(max)}</text><text x="${pad.l - 8}" y="${h - pad.b}" text-anchor="end">0</text>`;
  bars.forEach(([ts, v], i) => {
    const bh = (h - pad.t - pad.b) * v / max;
    g += `<rect x="${pad.l + i * bw + bw * 0.15}" y="${h - pad.b - bh}" width="${bw * 0.7}" height="${bh}" rx="3" fill="${color}"/>`;
    if (bars.length <= 14 || i % Math.ceil(bars.length / 10) === 0) g += `<text x="${pad.l + i * bw + bw / 2}" y="${h - 10}" text-anchor="middle">${fmtDay(ts)}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" width="100%">${g}</svg>`;
}

// Bildschirm-Heatmap: Raster 16 x 10, grün = richtig getippt, Ring = verpasst, Kreuz = Fehltreffer
export function heatmap(records, w = 960) {
  const h = w * 800 / 1280, sx = w / 1280;
  const cols = 16, rows = 10, cw = 1280 / cols, ch = 800 / rows;
  const hit = Array(cols * rows).fill(0), miss = Array(cols * rows).fill(0);
  const cell = (x, y) => Math.min(rows - 1, Math.max(0, Math.floor(y / ch))) * cols + Math.min(cols - 1, Math.max(0, Math.floor(x / cw)));
  let falses = '';
  records.forEach(r => {
    (r.taps || []).forEach(([x, y, ok]) => { if (ok) hit[cell(x, y)]++; else falses += `<path d="M${x * sx - 4} ${y * sx - 4}l8 8M${x * sx + 4} ${y * sx - 4}l-8 8" stroke="var(--muted)" stroke-width="1.5" opacity=".6"/>`; });
    (r.missedPts || []).forEach(([x, y]) => miss[cell(x, y)]++);
  });
  const mh = Math.max(1, ...hit), mm = Math.max(1, ...miss);
  let g = `<rect width="${w}" height="${h}" fill="var(--bg)" stroke="var(--line)" stroke-width="2" rx="10"/>`;
  g += `<line x1="${w / 3}" x2="${w / 3}" y1="0" y2="${h}" stroke="var(--line)" stroke-dasharray="6 6"/><line x1="${2 * w / 3}" x2="${2 * w / 3}" y1="0" y2="${h}" stroke="var(--line)" stroke-dasharray="6 6"/>`;
  for (let i = 0; i < cols * rows; i++) {
    const x = (i % cols) * cw * sx, y = Math.floor(i / cols) * ch * sx;
    if (hit[i]) g += `<rect x="${x + 1}" y="${y + 1}" width="${cw * sx - 2}" height="${ch * sx - 2}" rx="4" fill="var(--green)" opacity="${0.12 + 0.75 * hit[i] / mh}"/>`;
    if (miss[i]) g += `<circle cx="${x + cw * sx / 2}" cy="${y + ch * sx / 2}" r="${6 + 14 * miss[i] / mm}" fill="none" stroke="var(--blue)" stroke-width="3.5"/>`;
  }
  g += falses;
  ['links', 'Mitte', 'rechts'].forEach((l, i) => { g += `<text x="${w / 6 + i * w / 3}" y="${h - 10}" text-anchor="middle" style="font-weight:700">${l}</text>`; });
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" width="100%">${g}</svg>
    <div class="legend"><span><i style="background:var(--green);height:14px;width:14px"></i>richtig getippt (dichter = öfter)</span><span><i style="background:none;border:3px solid var(--blue);height:14px;width:14px;border-radius:99px"></i>verpasst</span><span>× Fehltreffer</span></div>`;
}
