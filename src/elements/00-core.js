// Shared helpers for the sheen elements. Every element:
// - draws in the light DOM, so sheen.css styles it and pages can restyle it;
// - takes all of its words from attributes (already translated); it never renders text of its own;
// - mirrors for dir="rtl" (positions use inset-inline-start, keys follow the reading direction);
// - follows light/dark through the sheen tokens and stops motion under prefers-reduced-motion.
var VERSION = '0.9.1';

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
// A Flutter sheen filled icon ("check-circle-fill") is filled with the text colour instead of stroked.
function glyph(name, size, label) {
  var body = GLYPHS[name];
  if (!body) throw new Error('Unknown sheen glyph "' + name + '"');
  var t = document.createElement('template');
  t.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' + (FILLED[name] ? 'fill="currentColor" stroke="none">'
    : 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">') + body + '</svg>';
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

// Places a fixed (or top-layer) box under an anchor's rectangle: lined up with the anchor's start edge (read from the
// box's own direction), on the other edge
// when that would leave the screen, and above the anchor when it doesn't fit below
// and there is more room above. A box with auto width shrinks to the room between its left and the screen's end, so it
// is measured at 0,0 first, where nothing narrows it. Returns { flip, up } for the caller's classes.
function placeUnder(box, a) {
  var rtl = isRtl(box), s = box.style, gap = 6, w = window.innerWidth, h = window.innerHeight;
  s.position = 'fixed'; s.margin = '0'; s.right = 'auto'; s.bottom = 'auto'; s.left = '0px'; s.top = '0px';
  var r = box.getBoundingClientRect(), width = r.right - r.left, height = r.bottom - r.top;
  var atEnd = rtl;   // in Arabic the start edge is the anchor's right edge
  var left = atEnd ? a.right - width : a.left;
  var flip = left < 0 || left + width > w;
  if (flip) left = atEnd ? a.left : a.right - width;
  // Wider than the room on either side (a phone): it keeps to the screen, and from 0.8.0 the minimum gap
  // (--sheen-space-min) from its edges where the screen has that much room to spare, so it never sits flush against one.
  var room = Math.max(0, w - width);
  if (left < 0 || left > room) {
    var edge = Math.min(parseFloat(cssVar(document.documentElement, '--sheen-space-min', '0')) || 0, room / 2);
    left = clamp(left, edge, room - edge);
  }
  var up = a.bottom + gap + height > h && a.top > h - a.bottom;
  s.left = left + 'px';
  s.top = (up ? Math.max(0, a.top - height - gap) : a.bottom + gap) + 'px';
  return { flip: flip, up: up };
}

// A popup opened from an anchor (0.8.0): a menu, a select's list, a calendar. popup(box, anchor, host, gone) shows box in
// the top layer (popover) where the API exists, else fixed, so no scrolling box, glass box or sticky cell cuts it off, and
// places it under anchor (placeUnder), marking it sheen-menu-flip when it lines up with the anchor's other edge and
// sheen-menu-up when it opens upward. It follows the anchor on any scroll but its own and on resize, and calls gone() on a
// press outside host, or once the anchor has wholly left the box that scrolled (or the screen). Returns { place, stop }:
// place() places it again; stop() takes it out of the top layer, hides it and drops the listeners.
function popup(box, anchor, host, gone) {
  function place() {
    box.classList.remove('sheen-menu-flip', 'sheen-menu-up');
    var at = placeUnder(box, anchor.getBoundingClientRect());
    box.classList.toggle('sheen-menu-flip', at.flip);
    box.classList.toggle('sheen-menu-up', at.up);
  }
  // Whether the anchor has wholly left this box.
  function outside(r) {
    var b = anchor.getBoundingClientRect();
    return b.bottom <= r.top || b.top >= r.bottom || b.right <= r.left || b.left >= r.right;
  }
  function onPress(e) { if (!host.contains(e.target)) gone(); }
  function onScroll(e) {
    var t = e.target;
    if (t && t.nodeType === 1 && box.contains(t)) return;
    if (outside(t && t.nodeType === 1 && t.contains(anchor) ? t.getBoundingClientRect() : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight })) return gone();
    place();
  }
  function stop() {
    // A removed box has already left the top layer, and hiding it again would throw.
    if (box.hasAttribute('popover') && box.isConnected && !box.hidden) box.hidePopover();
    box.hidden = true;
    document.removeEventListener('pointerdown', onPress, true);
    window.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('resize', place);
  }
  box.hidden = false;
  if (typeof box.showPopover === 'function') { box.setAttribute('popover', 'manual'); box.showPopover(); }
  place();
  document.addEventListener('pointerdown', onPress, true);
  window.addEventListener('scroll', onScroll, true);
  window.addEventListener('resize', place);
  // The popup and its anchor can change size while it is open (a field whose chips wrap, a list a search shortens, a
  // month with one more week): it is placed again each time, so it never covers the field or floats away from it.
  var sized = window.ResizeObserver ? new window.ResizeObserver(function () { place(); }) : null;
  if (sized) { sized.observe(box); sized.observe(anchor); }
  var drop = stop;
  stop = function () { if (sized) sized.disconnect(); drop(); };
  return { place: place, stop: stop };
}

// The ids that name a field from its <label>s (0.8.0). A label apart from the field names it whole. A label around the
// field names it by its children outside the field (its words, a hint under it): the whole label would read the field's
// value and an open popup into the name (Chromium does). A label around the field with bare words only names it whole.
// Labels and parts without an id get one.
function labelIds(labels, field) {
  var ids = [];
  Array.prototype.forEach.call(labels || [], function (l) {
    var parts = l.contains(field) ? Array.prototype.filter.call(l.children, function (c) { return !c.contains(field); }) : [];
    (parts.length ? parts : [l]).forEach(function (p) { ids.push(p.id || (p.id = uid('sheen-label'))); });
  });
  return ids;
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

// The sidebar as a drawer under 760px (0.7.1): a .sheen-nav-button inside a .sheen-sidebar-shell opens the .sheen-sidebar
// its aria-controls names, by data-nav-open on the shell, and puts focus on its first link. Esc, a press outside the
// drawer or on one of its links, or the button again closes it, and focus goes back to the button. While it is open the
// rest of the shell is inert, so Tab stays in it. The CSS makes a drawer only of a shell that holds its button and hides
// a closed drawer and the button above 760px; growing past 760px closes it. sheen.js and the elements carry this same
// code: whichever loads first marks <html data-sheen-drawer> and sets it up, the other finds it marked and adds nothing.
(function () {
  if (typeof document === 'undefined') return;
  var root = document.documentElement;
  if (root.hasAttribute('data-sheen-drawer')) return;
  root.setAttribute('data-sheen-drawer', '');
  var narrow = window.matchMedia ? window.matchMedia('(max-width:760px)') : null, open = null;
  function drawer(button) {
    var side = document.getElementById(button.getAttribute('aria-controls') || ''), shell = side && side.closest('.sheen-sidebar-shell');
    return shell && shell.contains(button) ? { button: button, side: side, shell: shell } : null;
  }
  function set(d, on, quiet) {
    d.shell.toggleAttribute('data-nav-open', on);
    d.button.setAttribute('aria-expanded', on ? 'true' : 'false');
    var page = d.shell.querySelector('.sheen-app-main');
    if (page) page.toggleAttribute('inert', on);
    open = on ? d : null;
    if (quiet) return;
    if (on) (d.side.querySelector('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])') || d.side).focus();
    else d.button.focus();
  }
  document.addEventListener('click', function (e) {
    var t = e.target, b = t && t.nodeType === 1 && t.closest('.sheen-nav-button');
    if (b) { var d = drawer(b); if (d) set(d, !d.shell.hasAttribute('data-nav-open')); return; }
    if (open && (!open.side.contains(t) || (t.nodeType === 1 && t.closest('a[href]')))) set(open, false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && open && !e.defaultPrevented) { e.preventDefault(); set(open, false); }
  });
  if (narrow) {
    var grown = function () { if (!narrow.matches && open) set(open, false, true); };
    if (narrow.addEventListener) narrow.addEventListener('change', grown); else if (narrow.addListener) narrow.addListener(grown);
  }
})();

// Keyboard navigation (0.7.0): Tab or Shift+Tab marks <html data-sheen-keyboard>, and only then do buttons, links, tabs
// and menu items draw their thin focus ring; the next press clears it. Esc, Enter, letters and arrows never set it, so
// closing a panel with Esc or typing in a field brings no ring back. A text field never draws one: its caret shows focus.
// The page is marked <html data-sheen-focus> by whichever of sheen.js and the elements loads first (the other finds it
// marked and adds nothing); a page with neither script keeps the browser's own :focus-visible rings.
(function () {
  if (typeof document === 'undefined') return;
  var root = document.documentElement;
  if (root.hasAttribute('data-sheen-focus')) return;
  root.setAttribute('data-sheen-focus', '');
  document.addEventListener('keydown', function (e) { if (e.key === 'Tab') root.setAttribute('data-sheen-keyboard', ''); }, true);
  document.addEventListener('pointerdown', function () { root.removeAttribute('data-sheen-keyboard'); }, true);
})();
