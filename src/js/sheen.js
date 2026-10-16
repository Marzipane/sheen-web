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
// - Picker: <x-sheen::picker> (see below). sheenWeb.initPickers() sets up pickers added after the page loaded.
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

  // Picker: <div data-sheen-picker> with a <select>, a .sheen-picker-trigger (shown once this runs, the select hidden)
  // and a <template class="sheen-picker-template"> holding the list. The list opens under the field (a sheet in the
  // middle with data-layout="sheet", from the bottom on phones), in the top layer when the browser has popovers, so a
  // dialog or a clipped parent never cuts it. Choosing sets the select and fires "input" and "change".
  var pick = null;
  var narrow = window.matchMedia ? window.matchMedia('(max-width: 640px)') : { matches: false };
  var coarse = window.matchMedia ? window.matchMedia('(pointer: coarse)') : { matches: false };

  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  function pickerShow(root) {
    var select = root.querySelector('select'), value = root.querySelector('.sheen-picker-trigger > span');
    if (!select || !value) return;
    var op = select.options[select.selectedIndex];
    value.textContent = op ? op.textContent : '';
    value.classList.toggle('sheen-picker-placeholder', !op || op.value === '');
  }

  function pickerInit(root) {
    if (root.classList.contains('sheen-picker-ready')) return;
    var select = root.querySelector('select'), trigger = root.querySelector('.sheen-picker-trigger');
    if (!select || !trigger) return;
    var label = root.querySelector('label[for]');
    if (label) label.htmlFor = trigger.id;
    select.tabIndex = -1;
    select.addEventListener('change', function () { pickerShow(root); });
    // a required select with nothing chosen cannot take the browser's focus once hidden: the field takes it
    select.addEventListener('invalid', function () { root.classList.add('sheen-picker-invalid'); trigger.focus(); });
    root.classList.add('sheen-picker-ready');
    pickerShow(root);
  }
  function pickerAll() { document.querySelectorAll('[data-sheen-picker]').forEach(pickerInit); }

  function pickerItems(p) {
    var q = norm(p.input ? p.input.value.trim() : '');
    var all = [].slice.call(p.select.options).filter(function (op) { return !(op.value === '' && op.disabled); });
    var text = function (op) { return norm([op.textContent, op.value, op.getAttribute('data-keywords')].join(' ')); };
    var groups = [];
    var popular = (p.root.getAttribute('data-popular') || '').split(',').filter(Boolean);
    if (q) {
      var found = all.filter(function (op) { return text(op).indexOf(q) >= 0; });
      // the exact value first ("usd"), then popular ones ("dollar" finds the US dollar first), then names that start
      // with what was typed, then the rest, each in the list's order
      var rank = function (op) {
        if (norm(op.value) === q) return 0;
        if (popular.indexOf(op.value) >= 0) return 1;
        return norm(op.getAttribute('data-label') || op.textContent).indexOf(q) === 0 ? 2 : 3;
      };
      found = found.map(function (op, i) { return [rank(op), i, op]; }).sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }).map(function (x) { return x[2]; });
      groups.push({ head: '', options: found });
    } else {
      var top = popular.map(function (v) { return all.filter(function (op) { return op.value === v; })[0]; }).filter(Boolean);
      if (top.length) {
        groups.push({ head: p.root.getAttribute('data-label-popular') || '', options: top });
        groups.push({ head: p.root.getAttribute('data-label-all') || '', options: all.filter(function (op) { return top.indexOf(op) < 0; }) });
      } else {
        all.forEach(function (op) {
          var g = op.parentNode.tagName === 'OPTGROUP' ? op.parentNode.label : '';
          if (!groups.length || groups[groups.length - 1].head !== g) groups.push({ head: g, options: [] });
          groups[groups.length - 1].options.push(op);
        });
      }
    }
    return groups;
  }

  function pickerFill(p) {
    p.list.textContent = '';
    p.items = [];
    var chosen = -1;
    pickerItems(p).forEach(function (g) {
      if (!g.options.length) return;
      if (g.head) p.list.appendChild(el('li', { role: 'presentation', 'class': 'sheen-picker-head' }, g.head));
      g.options.forEach(function (op) {
        var li = el('li', { role: 'option', id: p.list.id + '-' + p.items.length, 'class': 'sheen-picker-option', 'aria-selected': String(op.selected && op.value !== '') });
        if (op.disabled) li.setAttribute('aria-disabled', 'true');
        if (op.getAttribute('data-badge')) li.appendChild(el('span', { 'class': 'sheen-picker-badge' }, op.getAttribute('data-badge')));
        li.appendChild(el('span', { 'class': 'sheen-picker-label' }, op.getAttribute('data-label') || op.textContent));
        if (op.getAttribute('data-hint')) li.appendChild(el('span', { 'class': 'sheen-picker-hint' }, op.getAttribute('data-hint')));
        if (op.selected && op.value !== '' && chosen < 0) chosen = p.items.length;
        p.list.appendChild(li);
        p.items.push(op);
      });
    });
    var typed = p.input ? p.input.value.trim() : '';
    p.empty.hidden = p.items.length > 0;
    p.empty.textContent = p.items.length ? '' : (p.empty.getAttribute('data-label') || '').replace('@q', typed);
    pickerActive(p, typed ? 0 : Math.max(chosen, 0), !typed);
  }

  function pickerActive(p, i, center) {
    var was = p.list.querySelector('.sheen-active');
    if (was) was.classList.remove('sheen-active');
    var holder = p.input || p.list;
    if (!p.items.length) { p.active = -1; holder.removeAttribute('aria-activedescendant'); return; }
    p.active = Math.min(Math.max(i, 0), p.items.length - 1);
    var li = document.getElementById(p.list.id + '-' + p.active);
    li.classList.add('sheen-active');
    holder.setAttribute('aria-activedescendant', li.id);
    if (center) p.list.scrollTop = li.offsetTop - p.list.clientHeight / 2 + li.offsetHeight / 2;
    else if (li.scrollIntoView) li.scrollIntoView({ block: 'nearest' });
  }

  function pickerPlace(p) {
    var pop = p.pop;
    var vv = window.visualViewport;
    var vh = vv ? vv.height : window.innerHeight;
    pop.style.setProperty('--sheen-picker-vh', vh + 'px');
    pop.style.setProperty('--sheen-picker-kb', Math.max(0, window.innerHeight - vh - (vv ? vv.offsetTop : 0)) + 'px');
    if (p.sheet) { ['left', 'top', 'bottom', 'width', 'maxHeight'].forEach(function (k) { pop.style[k] = ''; }); return; }
    var r = (p.trigger.closest('.sheen-picker-field,.sheen-picker-pill') || p.trigger).getBoundingClientRect();
    var vw = document.documentElement.clientWidth;
    var w = Math.min(Math.max(r.width, 300), vw - 16);
    var below = window.innerHeight - r.bottom - 12, above = r.top - 12;
    var up = below < 260 && above > below;
    var left = rtl(p.root) ? r.right - w : r.left;
    pop.style.width = w + 'px';
    pop.style.left = Math.min(Math.max(8, left), vw - w - 8) + 'px';
    pop.style.maxHeight = Math.max(160, Math.min(440, (up ? above : below) - 6)) + 'px';
    pop.style.top = up ? '' : (r.bottom + 6) + 'px';
    pop.style.bottom = up ? (window.innerHeight - r.top + 6) + 'px' : '';
  }
  function pickerReplace() { if (pick) pickerPlace(pick); }

  function pickerOpen(root) {
    pickerClose(false);
    var select = root.querySelector('select'), trigger = root.querySelector('.sheen-picker-trigger');
    var pop = root.querySelector('.sheen-picker-pop');
    if (!pop) {
      var tpl = root.querySelector('template.sheen-picker-template');
      if (!tpl) return;
      pop = tpl.content.querySelector('.sheen-picker-pop').cloneNode(true);
      root.appendChild(pop);
    }
    var p = pick = { root: root, select: select, trigger: trigger, pop: pop, list: pop.querySelector('[role="listbox"]'), input: pop.querySelector('.sheen-picker-search input'), empty: pop.querySelector('.sheen-picker-empty'), active: -1, items: [] };
    p.sheet = root.getAttribute('data-layout') === 'sheet' || narrow.matches;
    pop.classList.toggle('sheen-picker-sheet', p.sheet);
    if (p.input) p.input.value = '';
    root.classList.add('sheen-picker-open');
    root.classList.remove('sheen-picker-invalid');
    trigger.setAttribute('aria-expanded', 'true');
    pop.hidden = false;
    if (pop.showPopover) { try { pop.showPopover(); } catch (e) { /* not in the document or already open */ } }
    pickerPlace(p);
    pickerFill(p);
    if (p.sheet && narrow.matches) { p.overflow = document.documentElement.style.overflow; document.documentElement.style.overflow = 'hidden'; }
    // on a touch screen the keyboard waits for a tap on the search box
    (p.input && !coarse.matches ? p.input : p.list).focus({ preventScroll: true });
    window.addEventListener('resize', pickerReplace);
    window.addEventListener('scroll', pickerReplace, true);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', pickerReplace);
  }

  function pickerClose(back) {
    var p = pick;
    if (!p) return;
    pick = null;
    if (p.pop.hidePopover) { try { p.pop.hidePopover(); } catch (e) { /* already closed */ } }
    p.pop.hidden = true;
    p.root.classList.remove('sheen-picker-open');
    p.trigger.setAttribute('aria-expanded', 'false');
    if (p.overflow !== undefined) document.documentElement.style.overflow = p.overflow;
    window.removeEventListener('resize', pickerReplace);
    window.removeEventListener('scroll', pickerReplace, true);
    if (window.visualViewport) window.visualViewport.removeEventListener('resize', pickerReplace);
    if (back) p.trigger.focus({ preventScroll: true });
  }

  function pickerChoose(p, i) {
    var op = p.items[i];
    if (!op || op.disabled) return;
    var changed = p.select.value !== op.value;
    p.select.value = op.value;
    pickerShow(p.root);
    pickerClose(true);
    if (changed) {
      p.select.dispatchEvent(new Event('input', { bubbles: true }));
      p.select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.sheen-picker-trigger,.sheen-picker-option,.sheen-picker-close');
    if (!t) return;
    if (t.classList.contains('sheen-picker-trigger')) {
      var root = t.closest('[data-sheen-picker]');
      if (!root) return;
      pickerInit(root);
      if (pick && pick.root === root) pickerClose(true); else pickerOpen(root);
    } else if (pick && t.classList.contains('sheen-picker-close')) pickerClose(true);
    else if (pick && pick.list.contains(t)) pickerChoose(pick, Number(t.id.slice(pick.list.id.length + 1)));
  });

  // a press outside closes the list; on a sheet, a press on its backdrop lands on the sheet itself
  document.addEventListener('pointerdown', function (e) {
    if (!pick) return;
    var t = e.target;
    if (t === pick.pop) {
      var r = pick.pop.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) return;
    } else if (pick.root.contains(t)) return;
    pickerClose(false);
  });

  document.addEventListener('input', function (e) {
    if (pick && e.target === pick.input) pickerFill(pick);
  });

  var typed = '', typedAt = 0;
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (!pick && t.classList && t.classList.contains('sheen-picker-trigger') && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      pickerOpen(t.closest('[data-sheen-picker]'));
      return;
    }
    if (!pick || !pick.pop.contains(t)) return;
    var p = pick, inList = t === p.list || t === p.input;
    var page = Math.max(1, Math.floor(p.list.clientHeight / 44) - 1);
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); pickerClose(true); }
    else if (e.key === 'Tab') { e.preventDefault(); pickerClose(true); }
    else if (!inList) return;
    else if (e.key === 'ArrowDown') { e.preventDefault(); pickerActive(p, p.active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); pickerActive(p, p.active - 1); }
    else if (e.key === 'PageDown') { e.preventDefault(); pickerActive(p, p.active + page); }
    else if (e.key === 'PageUp') { e.preventDefault(); pickerActive(p, p.active - page); }
    else if ((e.key === 'Home' || e.key === 'End') && t === p.list) { e.preventDefault(); pickerActive(p, e.key === 'Home' ? 0 : p.items.length); }
    else if (e.key === 'Enter') { e.preventDefault(); if (p.active >= 0) pickerChoose(p, p.active); }
    else if (t === p.list && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // no search box: typing jumps to the first name that starts with the letters
      var now = Date.now();
      typed = (now - typedAt > 700 ? '' : typed) + norm(e.key);
      typedAt = now;
      for (var i = 0; i < p.items.length; i++) {
        if (norm(p.items[i].getAttribute('data-label') || p.items[i].textContent).indexOf(typed) === 0) { pickerActive(p, i); break; }
      }
    }
  }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pickerAll); else pickerAll();
  document.addEventListener('livewire:navigated', pickerAll);

  window.sheenWeb = { version: '0.2.1', openViewer: open, syncSteppers: syncAll, initPickers: pickerAll, closePicker: pickerClose };
})();
