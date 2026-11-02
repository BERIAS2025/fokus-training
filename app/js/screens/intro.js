// Kurze Erklärung vor jedem Spiel: Beispiel-Bild links, ein bis zwei Sätze auf Deutsch, vorgelesen
import { register, go, onAct, anchorHTML } from '../ui.js';
import { ICON, gameIcon, shape } from '../icons.js';
import { gameName, lv } from '../state.js';
import { pick } from '../games/common.js';
import { say } from '../audio.js';

const NAMES = { sun8: 'Sonnen', star: 'Sterne', circle: 'Kreise', triangle: 'Dreiecke', heart: 'Herzen' };
const NAME_1 = { sun8: 'diese Sonne', star: 'diesen Stern', circle: 'diesen Kreis', triangle: 'dieses Dreieck', heart: 'dieses Herz' };

// Ziel für Spiele mit wechselndem Zielsymbol schon hier festlegen, damit Erklärung und Spiel passen
export function chooseTarget(game, level) {
  if (game === 'finden') return level >= 3 ? pick(['sun8', 'star']) : 'sun8';
  if (game === 'nur') return level >= 3 ? pick(['star', 'circle', 'triangle', 'heart']) : 'star';
  return null;
}

function content(game, level, target) {
  const card = inner => `<div style="width:380px;height:380px;border-radius:48px;background:var(--surface);border:3px solid var(--line);display:flex;align-items:center;justify-content:center;flex:none;position:relative;color:var(--ink)">${inner}</div>`;
  switch (game) {
    case 'sterne': return {
      pic: card(shape('star', 200)),
      text: ['Tippe alle Sterne an.', 'Fang links an.']
    };
    case 'blick': return {
      pic: card(`<svg width="320" height="210" viewBox="0 0 320 210">
        <circle cx="70" cy="100" r="58" fill="none" stroke="var(--blue)" stroke-width="6" stroke-dasharray="14 10"/>
        ${[150, 180, 210].map(x => `<circle cx="${x}" cy="100" r="5" fill="var(--path-dot)"/>`).join('')}
        <circle cx="270" cy="100" r="34" fill="currentColor"/>
        <path d="M230 178 H150 M166 164 L150 178 L166 192" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`),
      text: ['Folge dem schwarzen Punkt mit den Augen.', 'Wenn er im Ring links angekommen ist, tippe ihn an.']
    };
    case 'finden': return {
      pic: card(`<div style="display:flex;flex-direction:column;align-items:center;gap:22px">
        <div style="color:var(--ink)">${shape(target, 170)}</div>
        <div style="display:flex;gap:24px;opacity:.35">${(target === 'star' ? ['starO', 'diamond'] : ['sun4', 'square']).map(k => shape(k, 64)).join('')}</div>
      </div>`),
      text: [`Tippe alle ${NAMES[target]} an.`, 'Andere Zeichen nicht.']
    };
    case 'paare': return {
      pic: card(`<div style="display:flex;gap:24px">
        ${[0, 1].map(() => `<div class="card open" style="position:static;width:130px;height:170px">${shape('heart', 76)}</div>`).join('')}
      </div>`),
      text: ['Tippe zwei Karten an.', 'Finde die Paare mit dem gleichen Bild.']
    };
    case 'folge': return {
      pic: card(`<div style="display:grid;grid-template-columns:120px 120px;gap:24px">
        ${[['#1B4FA8', 'circle', '#fff'], ['#1E7A45', 'triangle', '#fff'], ['#E9B21C', 'square', '#1F2430'], ['#6B3FA0', 'diamond', '#fff']].map((c, i) =>
          `<div class="pad ${i === 1 ? 'lit' : ''}" style="position:static;width:120px;height:120px;background:${c[0]};color:${c[2]};${i === 1 ? `box-shadow:0 0 0 8px ${c[0]},0 0 40px 12px rgba(255,236,180,.9)` : ''}">${shape(c[1], 50)}</div>`).join('')}
      </div>`),
      text: ['Schau, welche Felder aufleuchten.', 'Tippe sie danach in der gleichen Reihenfolge an.']
    };
    case 'nur': return {
      pic: card(`<div class="target-box" style="position:static;width:260px;height:180px">${shape(target, 120)}</div>`),
      text: [`Tippe nur auf ${NAME_1[target]}.`, 'Bei allen anderen Zeichen nichts tun.', ...(lv('nur', 'switchEvery', level) ? ['Ändert sich das Zeichen oben, gilt das neue.'] : [])]
    };
  }
}

register('intro', (el, { game, level, target }) => {
  const c = content(game, level, target);
  el.innerHTML = `
    ${anchorHTML()}
    <div class="content" style="display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:64px 64px 64px">
      <div style="display:flex;align-items:center;gap:32px;align-self:flex-start;margin-left:24px;color:var(--ink)">
        ${gameIcon(game, 64)}<div style="font-size:44px;font-weight:700">${gameName(game)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:64px;align-self:flex-start;margin-left:24px">
        ${c.pic}
        <div style="display:flex;flex-direction:column;gap:20px;max-width:560px">
          ${c.text.map((t, i) => `<div style="font-size:${i === 0 ? 48 : 36}px;font-weight:700;line-height:1.2;color:${i === 0 ? 'var(--ink)' : 'var(--ink-2)'}">${t}</div>`).join('')}
          <button style="align-self:flex-start;margin-top:8px;color:var(--ink)" data-act="speak" aria-label="Vorlesen">${ICON.speaker(56)}</button>
        </div>
      </div>
      <button class="btn btn-primary btn-pill" style="width:340px" data-act="go">${ICON.play(40)}<span>Los</span></button>
    </div>`;
  const read = () => say(c.text.join(' '));
  const t = setTimeout(read, 400);
  const off = onAct(el, {
    speak: read,
    go: () => { if (window.speechSynthesis) window.speechSynthesis.cancel(); go('game', { game, level, target }); }
  });
  return () => { off(); clearTimeout(t); };
});
