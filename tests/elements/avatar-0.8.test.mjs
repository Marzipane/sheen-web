// 0.8.0 <sheen-avatar>: a person's initials in a circle, as Flutter sheen's SheenAvatar (lib/src/widgets/avatar.dart):
// the same initials and the same tint for the same name, from the SheenTint tokens.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { page } from './setup.mjs';

const flat = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
const raw = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8');
const css = flat(raw);
// the avatar's own stylesheet, as build.mjs puts it in dist/sheen.css: from its "/* 12-avatar.css */" to the next file's
const ownAt = raw.indexOf('/* 12-avatar.css */');
const ownEnd = raw.slice(ownAt + 1).search(/\n\/\* \d\d-[a-z0-9-]+\.css \*\//);
const own = flat(raw.slice(ownAt, ownEnd < 0 ? raw.length : ownAt + 1 + ownEnd));
const js = readFileSync(new URL('../../dist/sheen-elements.js', import.meta.url), 'utf8');
const tokens = JSON.parse(readFileSync(new URL('../../tokens/tokens.json', import.meta.url), 'utf8'));
const rule = (selector) => {
  const at = css.indexOf(selector + '{');
  assert.ok(at >= 0, `no rule ${selector}`);
  return css.slice(at + selector.length + 1, css.indexOf('}', at)).split(';');
};

// Flutter sheen SheenTint.all, in its order (lib/src/foundation/colors.dart)
const ORDER = ['blue', 'red', 'green', 'orange', 'purple', 'teal', 'violet', 'gray'];

// FNV-1a, 32 bits, over the UTF-16 code units of the trimmed, lower-cased key, as Flutter sheen's SheenAvatar.tintOf.
// Written apart from the element with BigInt, so a slip in its Math.imul version shows here.
function referenceTint(key) {
  const s = key.trim().toLowerCase();
  let h = 0x811c9dc5n;
  for (let i = 0; i < s.length; i++) h = ((h ^ BigInt(s.charCodeAt(i))) * 0x01000193n) & 0xffffffffn;
  return ORDER[Number(h % 8n)];
}

// names and their initials; together they reach all eight tints
const NAMES = [
  ['Ada Lovelace', 'AL'],
  ['Grace Hopper', 'GH'],
  ['Alan Turing', 'AT'],
  ['Maria Santos', 'MS'],
  ['Hamza R.', 'HR'],
  ['Cher', 'C'],
  ['Lina Park', 'LP'],
  ['Sara Lee', 'SL'],
  ['Mary Ann Evans', 'MA'],
  ['عمر حداد', 'عح'],
  ['  ada \t lovelace\n', 'AL'],
  ['\u{10428}ara Lee', '\u{10400}L'], // a first letter outside the BMP (two UTF-16 units), upper-cased
];

// An avatar made the way a framework makes one: created, given its attributes, then put on the page.
function avatar(attrs = {}, dir) {
  const w = page('', dir);
  const a = w.document.createElement('sheen-avatar');
  for (const [k, v] of Object.entries(attrs)) a.setAttribute(k, v);
  w.document.body.append(a);
  return { w, a };
}

test('avatar: the initials are the first letter of the first two words, in capitals, and its only text', () => {
  for (const [name, initials] of NAMES) {
    const { a } = avatar({ name });
    assert.equal(a.textContent, initials, JSON.stringify(name));
    assert.equal(a.querySelector('span').textContent, initials);
    assert.equal(a.querySelector('svg'), null, 'no glyph beside the initials');
    assert.equal(a.classList.contains('sheen-avatar'), true);
  }
});

test('avatar: letters sets how many words give a letter; anything but a whole number from 1 keeps two', () => {
  assert.equal(avatar({ name: 'Maria Santos', letters: '1' }).a.textContent, 'M');
  assert.equal(avatar({ name: 'Mary Ann Evans', letters: '3' }).a.textContent, 'MAE');
  assert.equal(avatar({ name: 'Cher', letters: '3' }).a.textContent, 'C');
  for (const letters of ['0', '-1', 'one', '']) assert.equal(avatar({ name: 'Maria Santos', letters }).a.textContent, 'MS', letters);
  const { a } = avatar({ name: 'Maria Santos' });
  a.setAttribute('letters', '1');
  assert.equal(a.textContent, 'M');
  a.removeAttribute('letters');
  assert.equal(a.textContent, 'MS');
});

test('avatar: an Arabic name in a right-to-left page gives its first letters', () => {
  const w = page('<sheen-avatar name="عمر حداد"></sheen-avatar><sheen-avatar name="عمر حداد" letters="1"></sheen-avatar>', 'rtl');
  const [two, one] = w.document.querySelectorAll('sheen-avatar');
  assert.equal(two.textContent, 'عح');
  assert.equal(one.textContent, 'ع');
});

test('avatar: the name picks the tint by FNV-1a, as Flutter sheen, and the names here reach all eight', () => {
  const seen = new Set();
  for (const [name] of NAMES) {
    const { a } = avatar({ name });
    assert.equal(a.getAttribute('data-tint'), referenceTint(name), JSON.stringify(name));
    seen.add(a.getAttribute('data-tint'));
  }
  assert.deepEqual([...seen].sort(), [...ORDER].sort());
  // the same name gives the same tint at every size and letter count
  const tint = avatar({ name: 'Maria Santos' }).a.dataset.tint;
  assert.equal(avatar({ name: 'Maria Santos', size: 'xs', letters: '1' }).a.dataset.tint, tint);
});

test('avatar: tint-key picks the tint instead of the name, so a renamed person keeps their colour', () => {
  const { a } = avatar({ name: 'Maria Santos', 'tint-key': 'p-1024' });
  assert.equal(a.dataset.tint, referenceTint('p-1024'));
  assert.notEqual(referenceTint('p-1024'), referenceTint('Maria Santos'), 'the sample key and name differ in tint');
  assert.equal(a.textContent, 'MS', 'the initials still come from the name');
  a.setAttribute('name', 'Maria Lopez');
  assert.equal(a.dataset.tint, referenceTint('p-1024'));
  assert.equal(a.textContent, 'ML');
  a.setAttribute('tint-key', '  ');
  assert.equal(a.dataset.tint, referenceTint('Maria Lopez'), 'a blank key falls back to the name');
  a.removeAttribute('tint-key');
  assert.equal(a.dataset.tint, referenceTint('Maria Lopez'));
});

test('avatar: without a name it shows the filled person glyph, no text and no tint, as Flutter sheen', () => {
  for (const attrs of [{}, { name: '' }, { name: '  \t ' }, { 'tint-key': 'p-1024' }]) {
    const { w, a } = avatar(attrs);
    const svg = a.querySelector('svg');
    assert.ok(svg, JSON.stringify(attrs));
    assert.equal(svg.innerHTML, w.sheenElements.glyph('user-fill').innerHTML, 'the filled user glyph');
    assert.equal(a.textContent, '');
    assert.equal(a.hasAttribute('data-tint'), false);
  }
});

test('avatar: size is a name the stylesheet maps to the size tokens; the element writes no pixel value', () => {
  for (const size of ['s', 'xs', 'm', 'big', '30']) {
    const { a } = avatar({ name: 'Maria Santos', size });
    assert.equal(a.getAttribute('style'), null, size);
  }
  const base = rule('.sheen-avatar');
  for (const decl of ['--sheen-avatar-size:var(--sheen-size-avatar-m)', '--sheen-avatar-text:var(--sheen-size-avatar-m-text)',
    'inline-size:var(--sheen-avatar-size)', 'block-size:var(--sheen-avatar-size)', 'font-size:var(--sheen-avatar-text)']) {
    assert.ok(base.includes(decl), decl);
  }
  assert.deepEqual(rule('.sheen-avatar[size="s"]'), ['--sheen-avatar-size:var(--sheen-size-avatar-s)', '--sheen-avatar-text:var(--sheen-size-avatar-s-text)']);
  assert.deepEqual(rule('.sheen-avatar[size="xs"]'), ['--sheen-avatar-size:var(--sheen-size-avatar-xs)', '--sheen-avatar-text:var(--sheen-size-avatar-xs-text)']);
});

test('avatar: with label it is an image with that name; without, screen readers skip it', () => {
  const named = avatar({ name: 'Maria Santos', label: 'Maria Santos, online' }).a;
  assert.equal(named.getAttribute('role'), 'img');
  assert.equal(named.getAttribute('aria-label'), 'Maria Santos, online');
  assert.equal(named.hasAttribute('aria-hidden'), false);
  assert.equal(named.textContent, 'MS', 'the label is not drawn as text');
  const plain = avatar({ name: 'Maria Santos' }).a;
  assert.equal(plain.getAttribute('aria-hidden'), 'true');
  assert.equal(plain.hasAttribute('role'), false);
  assert.equal(plain.hasAttribute('aria-label'), false);
});

test('avatar: the image covers the initials once it loads; a failed one is dropped and the initials stay', () => {
  const { w, a } = avatar({ name: 'Maria Santos', image: '/photos/a.jpg' });
  const img = a.querySelector('img');
  assert.equal(img.getAttribute('src'), '/photos/a.jpg');
  assert.equal(img.getAttribute('alt'), '', 'the avatar itself carries the name');
  assert.equal(img.hidden, true, 'hidden while it loads, so the initials show');
  assert.equal(a.querySelector('span').textContent, 'MS');
  img.dispatchEvent(new w.Event('load'));
  assert.equal(img.hidden, false);
  assert.equal(a.lastElementChild, img, 'drawn after the initials, so it covers them');

  const broken = avatar({ name: 'Maria Santos', image: '/photos/gone.jpg' });
  broken.a.querySelector('img').dispatchEvent(new broken.w.Event('error'));
  assert.equal(broken.a.querySelector('img'), null);
  assert.equal(broken.a.textContent, 'MS');
  broken.a.setAttribute('letters', '1');
  assert.equal(broken.a.querySelector('img'), null, 'a photo that failed is not asked for again');
  broken.a.setAttribute('image', '/photos/new.jpg');
  assert.equal(broken.a.querySelector('img').getAttribute('src'), '/photos/new.jpg', 'a new photo is tried');
});

test('avatar: attributes changed after it is on the page take effect, as a framework binding sets them', () => {
  const { w, a } = avatar({ name: 'Maria Santos', image: '/photos/a.jpg' });
  const img = a.querySelector('img');
  a.setAttribute('name', 'Grace Hopper');
  assert.equal(a.textContent, 'GH');
  assert.equal(a.dataset.tint, referenceTint('Grace Hopper'));
  assert.equal(a.querySelector('img'), img, 'the same photo stays, so it does not load again');
  a.setAttribute('image', '/photos/b.jpg');
  assert.equal(a.querySelectorAll('img').length, 1);
  assert.equal(a.querySelector('img').getAttribute('src'), '/photos/b.jpg');
  a.removeAttribute('image');
  assert.equal(a.querySelector('img'), null);
  a.setAttribute('label', 'Grace Hopper');
  assert.equal(a.getAttribute('role'), 'img');
  assert.equal(a.getAttribute('aria-label'), 'Grace Hopper');
  assert.equal(a.hasAttribute('aria-hidden'), false);
  a.removeAttribute('label');
  assert.equal(a.getAttribute('aria-hidden'), 'true');
  assert.equal(a.hasAttribute('role'), false);
  a.removeAttribute('name');
  assert.equal(a.textContent, '');
  assert.equal(a.querySelector('svg').innerHTML, w.sheenElements.glyph('user-fill').innerHTML);
  assert.equal(a.hasAttribute('data-tint'), false);
});

test('avatar: written in the page before the script runs, it draws once with everything', () => {
  const w = page('<sheen-avatar name="Maria Santos" size="s" letters="1" image="/photos/a.jpg" label="Maria Santos"></sheen-avatar>');
  const a = w.document.querySelector('sheen-avatar');
  assert.equal(a.querySelectorAll('span').length, 1);
  assert.equal(a.querySelectorAll('img').length, 1);
  assert.equal(a.textContent, 'M');
  assert.equal(a.getAttribute('role'), 'img');
});

test('avatar: the tints are tokens, the eight Flutter tints in SheenTint.all order, set once for both themes', () => {
  assert.deepEqual(Object.keys(tokens.tint), ORDER);
  const root = css.match(/:root\{[^}]*\}/)[0];
  for (const n of ORDER) {
    assert.ok(root.includes(`--sheen-tint-${n}:${tokens.tint[n]};`), n);
    assert.equal(css.split(`--sheen-tint-${n}:`).length - 1, 1, `--sheen-tint-${n} is set once, not per theme`);
  }
  assert.ok(js.includes(`var TINTS = ${JSON.stringify(ORDER)};`), 'the element picks from the token names, in that order');
});

test('avatar: the diameters and text sizes are size tokens, the values of the mockup avatar sizes', () => {
  const want = { avatarXs: 18, avatarS: 30, avatarM: 40, avatarXsText: 9, avatarSText: 12, avatarMText: 15, avatarNoteText: 12 };
  const root = css.match(/:root\{[^}]*\}/)[0];
  for (const [k, v] of Object.entries(want)) {
    assert.equal(tokens.size[k], v, k);
    assert.ok(root.includes(`--sheen-size-${k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}:${v}px;`), k);
  }
});

test('avatar: its rules are in the built CSS and the element is in the bundle', () => {
  assert.ok(own.includes(':where(.sheen-avatar)[hidden]{display:none!important}'));
  const base = rule('.sheen-avatar');
  for (const decl of ['display:inline-grid', 'place-items:center', 'flex:none', 'overflow:hidden', 'border-radius:50%',
    'background:var(--sheen-track)', 'color:var(--sheen-on-accent)', 'font-weight:700', 'line-height:1', 'letter-spacing:0', 'white-space:nowrap']) {
    assert.ok(base.includes(decl), decl);
  }
  assert.deepEqual(rule('.sheen-avatar>*'), ['grid-area:1/1']);
  assert.deepEqual(rule('.sheen-avatar>svg'), ['inline-size:55%', 'block-size:55%', 'color:var(--sheen-text-tertiary)']);
  assert.deepEqual(rule('.sheen-avatar>img'), ['inline-size:100%', 'block-size:100%', 'object-fit:cover']);
  assert.ok(js.includes("define('sheen-avatar'"));
});

test('avatar: .sheen-avatar-name sets the avatar beside a name and a second line, as a table cell draws a person', () => {
  assert.deepEqual(rule('.sheen-avatar-name'), ['display:inline-flex', 'align-items:center', 'gap:var(--sheen-space-s)']);
  assert.deepEqual(rule('.sheen-avatar-name b'), ['white-space:nowrap']);
  assert.deepEqual(rule('.sheen-avatar-name small'), ['display:block', 'color:var(--sheen-text-secondary)', 'font-size:var(--sheen-size-avatar-note-text)']);
});

test('avatar: additive and mirrored: every rule is its own class, with logical sizes and no colour of its own but black', () => {
  const selectors = [...own.matchAll(/(?:^|\})([^{}]+)\{/g)].map((m) => m[1].trim());
  assert.ok(selectors.length >= 10, selectors.join(' | '));
  for (const s of selectors) assert.match(s, /^(:where\()?\.sheen-avatar/, s);
  assert.doesNotMatch(own, /(^|[{;])(width|height|min-width|max-width|left|right|margin-left|margin-right|padding-left|padding-right|text-align:(left|right))[:;]/);
  assert.deepEqual([...new Set(own.match(/#[0-9A-Fa-f]{3,8}\b|rgba?\(|hsla?\(/g))], ['#000'], 'only black, to darken the tints');
  assert.doesNotMatch(own, /\d+px/, 'no pixel value: sizes come from the tokens');
});

// WCAG contrast. color-mix in srgb with black scales each gamma-encoded channel by P.
function hex(h) { return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); }
function luminance(c) { const f = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); const [r, g, b] = c.map(f); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
function contrast(a, b) { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }
function vars(block) { return Object.fromEntries([...block.matchAll(/--sheen-([a-z-]+):(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2]])); }
const toBlack = (color, percent) => hex(color).map((v) => (v * percent) / 100);
const eightBit = (c) => c.map((v) => Math.round(v * 255) / 255);

test('avatar: the fill runs from the tint to a darker shade of it, so the contrast only grows across the circle', () => {
  assert.deepEqual(rule('.sheen-avatar[data-tint]'), ['background:linear-gradient(135deg,var(--sheen-avatar-fill),color-mix(in srgb,var(--sheen-avatar-fill) 65%,#000))']);
});

test('avatar: white initials reach 4.5:1 on every tint in light and dark, with the least darkening that does it', () => {
  const root = vars(css.match(/:root\{[^}]*\}/)[0]);
  const themes = {
    light: { ...root, ...vars(css.match(/:root\[data-theme="light"\]\{[^}]*\}/)[0]) },
    dark: { ...root, ...vars(css.match(/:root\[data-theme="dark"\]\{[^}]*\}/)[0]) },
  };
  for (const n of ORDER) {
    const m = css.match(new RegExp(`\\.sheen-avatar\\[data-tint="${n}"\\]\\{--sheen-avatar-fill:color-mix\\(in srgb,var\\(--sheen-tint-${n}\\) (\\d+)%,#000\\)\\}`));
    assert.ok(m, `${n}: the fill mixes the --sheen-tint-${n} token toward black`);
    const p = Number(m[1]);
    for (const [theme, t] of Object.entries(themes)) {
      const fill = toBlack(t[`tint-${n}`], p);
      const ratio = contrast(hex(t['on-accent']), fill);
      assert.ok(ratio >= 4.5, `${n} ${p}% in ${theme}: ${ratio.toFixed(2)}`);
      assert.ok(contrast(hex(t['on-accent']), eightBit(fill)) >= 4.5, `${n} ${p}% in ${theme}, as drawn in 8 bits`);
    }
    // one more percent of the tint would fall below 4.5:1, so P darkens no more than it must
    if (p < 100) assert.ok(contrast(hex('#FFFFFF'), toBlack(root[`tint-${n}`], p + 1)) < 4.5, `${n}: ${p + 1}% would still pass`);
  }
});
