// Shared helpers for the sheen elements. Every element:
// - draws in the light DOM, so sheen.css styles it and pages can restyle it;
// - takes all of its words from attributes (already translated); it never renders text of its own;
// - mirrors for dir="rtl" (positions use inset-inline-start, keys follow the reading direction);
// - follows light/dark through the sheen tokens and stops motion under prefers-reduced-motion.
var VERSION = '0.3.0';

function define(tag, cls) {
  if (!window.customElements.get(tag)) window.customElements.define(tag, cls);
}

function emit(el, type, detail) {
  return el.dispatchEvent(new CustomEvent(type, { detail: detail, bubbles: true, cancelable: true }));
}

function h(tag, attrs) {
  var e = document.createElement(tag);
  if (attrs) {
    for (var k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k) || attrs[k] == null || attrs[k] === false) continue;
      if (k === 'text') e.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on' && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    }
  }
  for (var i = 2; i < arguments.length; i++) {
    var c = arguments[i];
    if (c == null || c === false) continue;
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return e;
}

// A sheen glyph (the Flutter sheen icons plus the media glyphs) as an inline SVG. Decorative unless label is given.
function glyph(name, size, label) {
  var body = GLYPHS[name];
  if (!body) throw new Error('Unknown sheen glyph "' + name + '"');
  var t = document.createElement('template');
  t.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';
  var svg = t.content.firstChild;
  var s = String(size || 20);
  svg.setAttribute('width', s);
  svg.setAttribute('height', s);
  svg.setAttribute('class', 'sheen-glyph');
  svg.setAttribute('focusable', 'false');
  if (label) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', label); }
  else svg.setAttribute('aria-hidden', 'true');
  return svg;
}

function isRtl(el) {
  var holder = el.closest('[dir]');
  return (holder ? holder.getAttribute('dir') : document.documentElement.getAttribute('dir')) === 'rtl';
}

function reducedMotion() {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

var uidCount = 0;
function uid(prefix) { uidCount += 1; return (prefix || 'sheen') + '-' + uidCount; }

// 75 → "1:15", 3725 → "1:02:05"; tenths with precise=true ("1:15.4").
function fmtTime(sec, precise) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  var whole = Math.floor(sec), hrs = Math.floor(whole / 3600), mins = Math.floor((whole % 3600) / 60), s = whole % 60;
  var out = (hrs ? hrs + ':' + String(mins).padStart(2, '0') : String(mins)) + ':' + String(s).padStart(2, '0');
  if (precise) out += '.' + Math.floor((sec - whole) * 10);
  return out;
}

// "Photo @n of @all" style templates: fill('@n of @all', {n: 2, all: 5}).
function fill(template, values) {
  return String(template || '').replace(/@(\w+)/g, function (m, k) { return values[k] != null ? values[k] : m; });
}

// Arrow keys along the reading direction: +1 forward, -1 back, 0 otherwise.
function arrowStep(e, el) {
  var fwd = isRtl(el) ? 'ArrowLeft' : 'ArrowRight', back = isRtl(el) ? 'ArrowRight' : 'ArrowLeft';
  if (e.key === fwd || e.key === 'ArrowUp') return 1;
  if (e.key === back || e.key === 'ArrowDown') return -1;
  return 0;
}

// The fraction (0..1) of a pointer along an element, from its inline start.
function pointerFraction(e, el) {
  var r = el.getBoundingClientRect();
  if (!r.width) return 0;
  var f = (e.clientX - r.left) / r.width;
  return clamp(isRtl(el) ? 1 - f : f, 0, 1);
}

function cssVar(el, name, fallback) {
  var v = window.getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}
