// Symbol-Set. Alle Formen nutzen currentColor, damit hell und dunkel funktionieren.
// Spielformen (Ziele/Ablenker) liegen in einem viewBox 0 0 100 100.

const STAR_PTS = '50,6 61,38 95,38 68,58 79,92 50,72 21,92 32,58 5,38 39,38';
const RAYS8 = 'M50 4v14M50 82v14M4 50h14M82 50h14M17 17l10 10M73 73l10 10M83 17l-10 10M27 73l-10 10';
const RAYS4 = 'M50 4v14M50 82v14M4 50h14M82 50h14';

// Formen für Spielziele, gefüllt mit currentColor
export const SHAPES = {
  star: `<polygon points="${STAR_PTS}"/>`,
  starO: `<polygon points="${STAR_PTS}" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/>`,
  sun8: `<circle cx="50" cy="50" r="22"/><path d="${RAYS8}" stroke="currentColor" stroke-width="8" stroke-linecap="round" fill="none"/>`,
  sun4: `<circle cx="50" cy="50" r="22"/><path d="${RAYS4}" stroke="currentColor" stroke-width="8" stroke-linecap="round" fill="none"/>`,
  sunO: `<circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" stroke-width="8"/><path d="${RAYS8}" stroke="currentColor" stroke-width="8" stroke-linecap="round" fill="none"/>`,
  circle: `<circle cx="50" cy="50" r="42"/>`,
  square: `<rect x="10" y="10" width="80" height="80" rx="12"/>`,
  triangle: `<polygon points="50,8 94,88 6,88" stroke-linejoin="round"/>`,
  diamond: `<polygon points="50,4 96,50 50,96 4,50"/>`,
  moon: `<path d="M66 6a46 46 0 1 0 28 66A36 36 0 0 1 66 6z"/>`,
  cross: `<path d="M38 6h24v32h32v24H62v32H38V62H6V38h32z"/>`,
  ring: `<circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" stroke-width="6" stroke-dasharray="10 8"/>`,
  heart: `<path d="M50 90 L12 52 A22 22 0 0 1 50 20 A22 22 0 0 1 88 52 Z"/>`,
  drop: `<path d="M50 6 C70 36 84 52 84 66 A34 34 0 0 1 16 66 C16 52 30 36 50 6 Z"/>`,
  hexagon: `<polygon points="50,4 90,27 90,73 50,96 10,73 10,27"/>`,
  leaf: `<path d="M14 86 C14 40 40 12 88 12 C88 60 60 86 14 86 Z"/>`
};

export function shape(kind, size, color, extra = '') {
  const c = color ? ` style="color:${color}"` : '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="currentColor"${c} ${extra}>${SHAPES[kind]}</svg>`;
}

// Spiel-Symbole (Linien- und Flächenfamilie aus dem Design)
const GAME_ICON = {
  sterne: `<polygon points="50,8 61,38 94,38 68,58 78,90 50,71 22,90 32,58 6,38 39,38" fill="currentColor"/>`,
  blick: `<circle cx="74" cy="50" r="16" fill="currentColor"/><path d="M48 50H14M28 36L14 50L28 64"/>`,
  finden: `<circle cx="50" cy="50" r="17" fill="currentColor"/><path d="M50 8v12M50 80v12M8 50h12M80 50h12M20 20l9 9M71 71l9 9M80 20l-9 9M29 71l-9 9"/>`,
  paare: `<rect x="10" y="22" width="40" height="56" rx="8" fill="currentColor"/><rect x="50" y="22" width="40" height="56" rx="8"/>`,
  folge: `<rect x="12" y="12" width="32" height="32" rx="6" fill="currentColor"/><rect x="56" y="12" width="32" height="32" rx="6"/><rect x="12" y="56" width="32" height="32" rx="6"/><rect x="56" y="56" width="32" height="32" rx="6"/>`,
  nur: `<circle cx="50" cy="50" r="40"/><circle cx="50" cy="50" r="22"/><circle cx="50" cy="50" r="7" fill="currentColor"/>`
};

export function gameIcon(id, size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${GAME_ICON[id]}</svg>`;
}

// UI-Symbole
export const ICON = {
  play: (s = 64) => `<svg width="${s}" height="${s * 72 / 64}" viewBox="0 0 64 72"><path d="M6 4 L60 36 L6 68 Z" fill="currentColor"/></svg>`,
  anchorArrow: () => `<svg width="44" height="64" viewBox="0 0 44 64" class="nudge"><path d="M6 4 L40 32 L6 60 Z" fill="currentColor"/></svg>`,
  sun: (s = 40) => `<svg width="${s}" height="${s}" viewBox="0 0 40 40"><circle cx="20" cy="20" r="8" fill="currentColor"/><g stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="M20 2v5M20 33v5M2 20h5M33 20h5M7 7l3.5 3.5M29.5 29.5L33 33M33 7l-3.5 3.5M10.5 29.5L7 33"/></g></svg>`,
  moon: (s = 36) => `<svg width="${s}" height="${s}" viewBox="0 0 36 36"><path d="M24 4a15 15 0 1 0 8 23A12 12 0 0 1 24 4z" fill="currentColor"/></svg>`,
  gear: (s = 32) => `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="5" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="5 4"/></svg>`,
  home: (s = 56) => `<svg width="${s}" height="${s}" viewBox="0 0 36 36"><path d="M4 17 L18 5 L32 17 V32 H22 V22 H14 V32 H4 Z" fill="currentColor"/></svg>`,
  check: (s = 24, w = 4) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M4 12l5 5L20 6" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  retry: (s = 48) => `<svg width="${s}" height="${s}" viewBox="0 0 48 48"><path d="M38 24a14 14 0 1 1-4.1-9.9" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><path d="M38 4v12H26" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  restore: (s = 32) => `<svg width="${s}" height="${s}" viewBox="0 0 48 48"><path d="M10 24a14 14 0 1 0 4.1-9.9" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><path d="M10 4v12h12" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  stop: (s = 40) => `<svg width="${s}" height="${s}" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="currentColor"/></svg>`,
  speaker: (s = 56) => `<svg width="${s}" height="${s}" viewBox="0 0 48 48"><path d="M6 18h8l12-10v32L14 30H6z" fill="currentColor"/><path d="M32 16q6 8 0 16M37 10q11 14 0 28" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`,
  speakerOff: (s = 56) => `<svg width="${s}" height="${s}" viewBox="0 0 48 48"><path d="M6 18h8l12-10v32L14 30H6z" fill="currentColor"/><path d="M33 18l12 12M45 18L33 30" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`,
  flag: (s = 44, pole = 'currentColor') => `<svg width="${s}" height="${s * 48 / 40}" viewBox="0 0 40 48"><path d="M8 4 V46" stroke="${pole}" stroke-width="5" stroke-linecap="round"/><path d="M10 6 H36 L28 16 L36 26 H10 Z" fill="var(--orange)"/></svg>`,
  up: (s = 40, c = 'var(--green)') => `<svg width="${s}" height="${s * 46 / 40}" viewBox="0 0 40 46"><path d="M20 2 L38 22 H27 V44 H13 V22 H2 Z" fill="${c}"/></svg>`,
  down: (s = 40, c = 'var(--blue)') => `<svg width="${s}" height="${s * 46 / 40}" viewBox="0 0 40 46"><path d="M20 44 L38 24 H27 V2 H13 V24 H2 Z" fill="${c}"/></svg>`,
  hold: (s = 40) => `<svg width="${s}" height="${s * 46 / 40}" viewBox="0 0 40 46"><rect x="2" y="12" width="36" height="22" rx="6" fill="var(--yellow)" stroke="var(--ink)" stroke-width="2.5"/><path d="M10 23 H30" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/></svg>`,
  stairs: (s = 32) => `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><rect x="3" y="22" width="7" height="7" fill="currentColor"/><rect x="12" y="14" width="7" height="15" fill="currentColor"/><rect x="21" y="5" width="7" height="24" fill="currentColor"/></svg>`,
  calendar: (s = 32) => `<svg width="${s}" height="${s}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3"><rect x="4" y="6" width="24" height="22" rx="3"/><path d="M4 13h24M11 3v6M21 3v6"/></svg>`,
  chart: (s = 32) => `<svg width="${s}" height="${s}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M4 26 L12 16 L18 21 L28 7"/></svg>`,
  sliders: (s = 32) => `<svg width="${s}" height="${s}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M4 9h24M4 23h24"/><circle cx="11" cy="9" r="4" fill="var(--surface)"/><circle cx="21" cy="23" r="4" fill="var(--surface)"/></svg>`,
  plus: (s = 40) => `<svg width="${s}" height="${s}" viewBox="0 0 40 40"><path d="M20 6v28M6 20h28" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>`,
  minus: (s = 40) => `<svg width="${s}" height="${s}" viewBox="0 0 40 40"><path d="M6 20h28" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>`,
  download: (s = 32) => `<svg width="${s}" height="${s}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4v16M9 13l7 7 7-7M5 27h22"/></svg>`,
  print: (s = 32) => `<svg width="${s}" height="${s}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M9 11V4h14v7"/><rect x="4" y="11" width="24" height="12" rx="2"/><path d="M9 19h14v9H9z" fill="var(--surface)"/></svg>`,
  anchor: (s = 32) => `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><rect x="2" y="3" width="9" height="26" rx="2" fill="var(--orange)"/><path d="M15 10l8 6-8 6z" fill="currentColor"/></svg>`,
  leftHelp: (s = 32) => `<svg width="${s}" height="${s}" viewBox="0 0 100 100" fill="currentColor"><polygon points="30,10 38,32 60,32 42,46 49,68 30,55 11,68 18,46 0,32 22,32"/><polygon points="78,44 82,56 95,56 85,64 88,76 78,69 68,76 71,64 61,56 74,56" opacity=".55"/></svg>`,
  clock: (s = 32) => `<svg width="${s}" height="${s}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="16" cy="16" r="12"/><path d="M16 9v7l5 3"/></svg>`,
  hourglass: (s = 32) => `<svg width="${s}" height="${s}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M8 4h16M8 28h16M10 4c0 8 12 8 12 12s-12 4-12 12M22 4c0 8-12 8-12 12s12 4 12 12"/></svg>`,
  voice: (s = 32) => `<svg width="${s}" height="${s}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 24V8a3 3 0 0 1 3-3h16a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H11z"/><path d="M11 11h10M11 16h6"/></svg>`,
  shield: (s = 32) => `<svg width="${s}" height="${s}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M16 3l11 4v8c0 7-5 12-11 14C10 27 5 22 5 15V7z"/><path d="M11 16l4 4 7-8" stroke-linecap="round"/></svg>`,
  upload: (s = 32) => `<svg width="${s}" height="${s}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20V4M9 11l7-7 7 7M5 27h22"/></svg>`,
  close: (s = 32) => `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><path d="M7 7l18 18M25 7L7 25" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`,
  short: (s = 140) => `<svg width="${s}" height="${s}" viewBox="0 0 100 100"><path d="M50 6 A44 44 0 0 1 50 94 A44 44 0 0 1 50 6 Z" fill="none" stroke="currentColor" stroke-width="7"/><path d="M50 6 A44 44 0 0 1 94 50 L50 50 Z" fill="currentColor"/><path d="M38 34 L64 50 L38 66 Z" fill="currentColor"/></svg>`,
  sunset: (s = 160) => `<svg width="${s}" height="${s * 100 / 110}" viewBox="0 0 110 100"><path d="M23 70 A32 32 0 0 1 87 70 Z" fill="var(--yellow)"/><path d="M8 70 H102" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><path d="M55 22v-12M24 38l-8-8M86 38l8-8" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><path d="M30 86 H80" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>`
};

// Müdigkeitsgesichter: unterscheiden sich in der Form (Mund, Augen), nicht nur in Farbe
export const FACES = [
  `<circle cx="50" cy="50" r="44"/><circle cx="35" cy="40" r="5" fill="currentColor" stroke="none"/><circle cx="65" cy="40" r="5" fill="currentColor" stroke="none"/><path d="M28 58 Q50 82 72 58"/>`,
  `<circle cx="50" cy="50" r="44"/><circle cx="35" cy="40" r="5" fill="currentColor" stroke="none"/><circle cx="65" cy="40" r="5" fill="currentColor" stroke="none"/><path d="M32 66 H68"/>`,
  `<circle cx="50" cy="50" r="44"/><path d="M27 41 Q35 47 43 41M57 41 Q65 47 73 41"/><path d="M34 70 Q50 62 66 70"/>`
];

export function face(i, size = 176) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round">${FACES[i]}</svg>`;
}

export function flower(filled, size = 140) {
  const petal = filled ? 'var(--yellow)' : 'none';
  const stroke = filled ? 'var(--yellow-dark)' : 'var(--flower-empty)';
  const core = filled ? 'var(--orange)' : 'var(--nav-bg)';
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><g fill="${petal}" stroke="${stroke}" stroke-width="3"><circle cx="50" cy="22" r="18"/><circle cx="77" cy="42" r="18"/><circle cx="67" cy="74" r="18"/><circle cx="33" cy="74" r="18"/><circle cx="23" cy="42" r="18"/></g><circle cx="50" cy="50" r="14" fill="${core}"/></svg>`;
}
