// Fails when sheen-web's tokens or icons differ from Flutter sheen's. Reads the Flutter sources from a local checkout
// (node scripts/check-flutter.mjs ../sheen) or from GitHub main (no argument; CI).
import { readFileSync, readdirSync } from 'node:fs';

const src = process.argv[2];
const raw = 'https://raw.githubusercontent.com/Marzipane/sheen/main/';
async function read(path) {
  if (src) return readFileSync(`${src}/${path}`, 'utf8');
  const r = await fetch(raw + path);
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return r.text();
}

const tokens = JSON.parse(readFileSync('tokens/tokens.json', 'utf8'));
const dart = await read('lib/src/foundation/colors.dart');
const problems = [];
for (const [theme, marker] of [['dark', 'static const SheenColors _dark'], ['light', 'static const SheenColors _light']]) {
  const block = dart.slice(dart.indexOf(marker), dart.indexOf(');', dart.indexOf(marker)));
  for (const m of block.matchAll(/(\w+): Color\(0x([0-9A-Fa-f]{8})\)/g)) {
    const [, name, argb] = m;
    const a = argb.slice(0, 2).toUpperCase();
    const css = '#' + argb.slice(2).toUpperCase() + (a === 'FF' ? '' : a);
    if ((tokens.color[theme][name] || '').toUpperCase() !== css) problems.push(`${theme}.${name}: Flutter ${css}, sheen-web ${tokens.color[theme][name]}`);
  }
}
const light = dart.match(/defaultLightAccent = Color\(0xFF([0-9A-F]{6})\)/i)[1];
const darkAcc = dart.match(/defaultDarkAccent = Color\(0xFF([0-9A-F]{6})\)/i)[1];
if (tokens.color.light.accent !== '#' + light.toUpperCase()) problems.push(`light.accent: Flutter #${light}`);
if (tokens.color.dark.accent !== '#' + darkAcc.toUpperCase()) problems.push(`dark.accent: Flutter #${darkAcc}`);

if (src) {
  for (const set of ['stroke', 'filled']) {
    const theirs = readdirSync(`${src}/tool/icons/${set}`).sort();
    const ours = readdirSync(`icons/${set}`).sort();
    if (theirs.join() !== ours.join()) problems.push(`icons/${set}: names differ from Flutter sheen`);
    for (const f of theirs) if (ours.includes(f) && readFileSync(`${src}/tool/icons/${set}/${f}`, 'utf8') !== readFileSync(`icons/${set}/${f}`, 'utf8')) problems.push(`icons/${set}/${f} differs`);
  }
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log('tokens' + (src ? ' and icons' : '') + ' match Flutter sheen');
