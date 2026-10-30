import { register, go, onAct } from '../ui.js';
import { ICON } from '../icons.js';

register('care', el => {
  el.innerHTML = `<div class="care"><div class="care-top"><div style="flex:1"></div><button class="care-home" data-act="home">${ICON.home(36)}</button></div></div>`;
  return onAct(el, { home: () => go('start') });
});
