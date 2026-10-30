// Erzeugt die PNG-Icons aus app/icons/icon.svg (einmalig, Ergebnis wird eingecheckt)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '../app/icons');
const svg = fs.readFileSync(path.join(dir, 'icon.svg'), 'utf8');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  for (const [name, size, maskable] of [['icon-192', 192, false], ['icon-512', 512, false], ['icon-maskable-512', 512, true]]) {
    await p.setViewportSize({ width: size, height: size });
    const s = maskable ? svg.replace('rx="96"', 'rx="0"') : svg;
    await p.setContent(`<style>body{margin:0}svg{display:block}</style>${s.replace('<svg ', `<svg width="${size}" height="${size}" `)}`);
    await p.screenshot({ path: path.join(dir, name + '.png'), omitBackground: !maskable });
  }
  await b.close();
})();
