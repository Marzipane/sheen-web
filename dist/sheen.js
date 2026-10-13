/*! sheen-web | MIT | https://github.com/Marzipane/sheen-web */
// Small behaviours for sheen-web components. No dependencies; everything works by event delegation on the document,
// so markup added later (Livewire, Alpine, fetch) needs no set-up call.
//
// - Photo viewer: <dialog class="sheen-viewer" id="…"> with a <script type="application/json" class="sheen-viewer-data">
//   [{"label":"Ship","photos":[{"src":"…","alt":"…","caption":"…"}]}, …]. Any element with data-sheen-viewer="id"
//   opens it (data-sheen-group, data-sheen-index pick the photo). Arrows, a swipe, the chips and the strip move; Esc closes.
//   Words come from the dialog: data-label-of="Photo @n of @all".
// - Stepper: <div class="sheen-stepper" data-sheen-stepper> with an <input type="number" min max> and two buttons
//   data-sheen-step="-1" / "1". The buttons disable at the bounds; the input fires "input" and "change".
(function () {
  'use strict';
  if (typeof document === 'undefined' || window.sheenWeb) return;

  var state = new WeakMap();

  function data(dialog) {
    var s = state.get(dialog);
    if (s) return s;
    var node = dialog.querySelector('script.sheen-viewer-data');
    var groups = [];
    try { groups = JSON.parse(node ? node.textContent : '[]'); } catch (e) { groups = []; }
    s = { groups: groups.filter(function (g) { return g && g.photos && g.photos.length; }), group: 0, index: 0 };
    state.set(dialog, s);
    return s;
  }

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }

  function render(dialog) {
    var s = data(dialog);
    var g = s.groups[s.group];
    if (!g) return;
    var p = g.photos[s.index];
    var img = dialog.querySelector('.sheen-viewer-stage img');
    if (img) { img.src = p.src; img.alt = p.alt || ''; }
    var cap = dialog.querySelector('.sheen-viewer-caption');
    if (cap) cap.textContent = p.caption || '';
    var of = dialog.querySelector('.sheen-viewer-of');
    if (of) of.textContent = (dialog.getAttribute('data-label-of') || '@n / @all').replace('@n', String(s.index + 1)).replace('@all', String(g.photos.length));
    var chips = dialog.querySelector('.sheen-viewer-chips');
    if (chips) {
      chips.textContent = '';
      if (s.groups.length > 1) s.groups.forEach(function (gr, i) {
        var b = el('button', { type: 'button', 'aria-pressed': String(i === s.group), 'data-sheen-viewer-group': String(i) }, gr.label + ' · ' + gr.photos.length);
        chips.appendChild(b);
      });
    }
    var strip = dialog.querySelector('.sheen-viewer-strip');
    if (strip) {
      strip.textContent = '';
      g.photos.forEach(function (ph, i) {
        var b = el('button', { type: 'button', 'aria-current': String(i === s.index), 'data-sheen-viewer-index': String(i), 'aria-label': ph.alt || String(i + 1) });
        b.appendChild(el('img', { src: ph.src, alt: '', loading: 'lazy' }));
        strip.appendChild(b);
      });
    }
    var many = g.photos.length > 1;
    dialog.querySelectorAll('.sheen-viewer-prev,.sheen-viewer-next').forEach(function (b) { b.hidden = !many; });
  }

  function move(dialog, by) {
    var s = data(dialog);
    var n = s.groups[s.group].photos.length;
    s.index = (s.index + by + n) % n;
    render(dialog);
  }

  function open(dialog, group, index) {
    var s = data(dialog);
    if (!s.groups.length) return;
    s.group = Math.min(Math.max(group || 0, 0), s.groups.length - 1);
    s.index = Math.min(Math.max(index || 0, 0), s.groups[s.group].photos.length - 1);
    render(dialog);
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    document.documentElement.style.overflow = 'hidden';
    var close = dialog.querySelector('.sheen-viewer-close');
    if (close) close.focus();
  }

  function rtl(node) { return getComputedStyle(node).direction === 'rtl'; }

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-sheen-viewer],[data-sheen-viewer-group],[data-sheen-viewer-index],.sheen-viewer-prev,.sheen-viewer-next,.sheen-viewer-close,[data-sheen-step]');
    if (!t) return;
    var dialog;
    if (t.hasAttribute('data-sheen-viewer')) {
      dialog = document.getElementById(t.getAttribute('data-sheen-viewer'));
      if (!dialog) return;
      e.preventDefault();
      open(dialog, parseInt(t.getAttribute('data-sheen-group') || '0', 10), parseInt(t.getAttribute('data-sheen-index') || '0', 10));
      return;
    }
    if (t.hasAttribute('data-sheen-step')) {
      var box = t.closest('[data-sheen-stepper]');
      var input = box && box.querySelector('input');
      if (!input) return;
      var min = input.min === '' ? -Infinity : Number(input.min);
      var max = input.max === '' ? Infinity : Number(input.max);
      var v = Math.min(max, Math.max(min, (Number(input.value) || 0) + Number(t.getAttribute('data-sheen-step'))));
      if (String(v) !== input.value) {
        input.value = String(v);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      sync(box);
      return;
    }
    dialog = t.closest('.sheen-viewer');
    if (!dialog) return;
    var s = data(dialog);
    if (t.classList.contains('sheen-viewer-close')) { dialog.close ? dialog.close() : dialog.removeAttribute('open'); return; }
    if (t.classList.contains('sheen-viewer-prev')) return move(dialog, -1);
    if (t.classList.contains('sheen-viewer-next')) return move(dialog, 1);
    if (t.hasAttribute('data-sheen-viewer-group')) { s.group = Number(t.getAttribute('data-sheen-viewer-group')); s.index = 0; return render(dialog); }
    if (t.hasAttribute('data-sheen-viewer-index')) { s.index = Number(t.getAttribute('data-sheen-viewer-index')); return render(dialog); }
  });

  document.addEventListener('keydown', function (e) {
    var dialog = document.querySelector('.sheen-viewer[open]');
    if (!dialog) return;
    var back = rtl(dialog) ? 'ArrowRight' : 'ArrowLeft';
    var fwd = rtl(dialog) ? 'ArrowLeft' : 'ArrowRight';
    if (e.key === back) { e.preventDefault(); move(dialog, -1); }
    else if (e.key === fwd) { e.preventDefault(); move(dialog, 1); }
  });

  document.addEventListener('close', function (e) {
    if (e.target.classList && e.target.classList.contains('sheen-viewer')) document.documentElement.style.overflow = '';
  }, true);

  var touch = null;
  document.addEventListener('touchstart', function (e) {
    var stage = e.target.closest && e.target.closest('.sheen-viewer-stage');
    touch = stage ? { x: e.touches[0].clientX, y: e.touches[0].clientY, d: stage.closest('.sheen-viewer') } : null;
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (!touch) return;
    var dx = e.changedTouches[0].clientX - touch.x;
    var dy = e.changedTouches[0].clientY - touch.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) move(touch.d, (dx < 0) !== rtl(touch.d) ? 1 : -1);
    touch = null;
  }, { passive: true });

  function sync(box) {
    var input = box.querySelector('input');
    if (!input) return;
    var v = Number(input.value) || 0;
    box.querySelectorAll('[data-sheen-step]').forEach(function (b) {
      var step = Number(b.getAttribute('data-sheen-step'));
      b.disabled = (step < 0 && input.min !== '' && v <= Number(input.min)) || (step > 0 && input.max !== '' && v >= Number(input.max));
    });
  }
  function syncAll() { document.querySelectorAll('[data-sheen-stepper]').forEach(sync); }
  document.addEventListener('input', function (e) { var b = e.target.closest && e.target.closest('[data-sheen-stepper]'); if (b) sync(b); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncAll); else syncAll();
  document.addEventListener('livewire:navigated', syncAll);

  window.sheenWeb = { version: '0.1.0', openViewer: open, syncSteppers: syncAll };
})();
