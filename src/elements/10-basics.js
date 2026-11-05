// <sheen-glyph name="play" size="20" label="Play">
//   A sheen glyph. Without label it is decorative (aria-hidden); with label it is an image with that name.
class SheenGlyph extends HTMLElement {
  static get observedAttributes() { return ['name', 'size', 'label']; }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  render() {
    var name = this.getAttribute('name');
    if (!name) return;
    this.replaceChildren(glyph(name, this.getAttribute('size') || 20, this.getAttribute('label')));
  }
}
define('sheen-glyph', SheenGlyph);

// <sheen-progress-ring value="0.42" size="56" label="Rendering" show-value indeterminate>
//   A round progress indicator. value is 0..1; without value (or with indeterminate) it spins (it holds still under
//   reduced motion). role=progressbar with aria-valuenow 0..100; label names it for screen readers.
class SheenProgressRing extends HTMLElement {
  static get observedAttributes() { return ['value', 'size', 'label', 'indeterminate', 'show-value']; }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  get value() { var v = parseFloat(this.getAttribute('value')); return isNaN(v) ? null : clamp(v, 0, 1); }
  set value(v) { this.setAttribute('value', String(v)); }
  render() {
    var size = parseFloat(this.getAttribute('size')) || 48, stroke = Math.max(3, size / 12), r = (size - stroke) / 2;
    var circ = 2 * Math.PI * r, v = this.value, spin = v == null || this.hasAttribute('indeterminate');
    this.setAttribute('role', 'progressbar');
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', '100');
    if (spin) this.removeAttribute('aria-valuenow'); else this.setAttribute('aria-valuenow', String(Math.round(v * 100)));
    if (this.getAttribute('label')) this.setAttribute('aria-label', this.getAttribute('label'));
    this.classList.toggle('sheen-spin', spin);
    this.style.setProperty('--sheen-ring-size', size + 'px');
    var dash = spin ? circ * 0.28 : circ * v;
    this.innerHTML = '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" aria-hidden="true">' +
      '<circle class="sheen-ring-track" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke-width="' + stroke + '"/>' +
      '<circle class="sheen-ring-value" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke-width="' + stroke +
      '" stroke-dasharray="' + dash + ' ' + circ + '"/></svg>';
    if (this.hasAttribute('show-value') && !spin) {
      this.appendChild(h('span', { class: 'sheen-ring-text sheen-num', 'aria-hidden': 'true', text: Math.round(v * 100) + '%' }));
    }
  }
}
define('sheen-progress-ring', SheenProgressRing);

// <sheen-drop-zone accept="video/*,.mkv" multiple label="Drop a video here" hint="or press Enter to choose a file">
//   A large target for dropping files or choosing them (Enter, Space or a click opens the file chooser). Fires
//   "sheen-files" with detail.files (an array of File). Children are kept and shown under the words.
class SheenDropZone extends HTMLElement {
  connectedCallback() {
    if (this.input) return;
    var self = this;
    this.input = h('input', { type: 'file', class: 'sheen-visually-hidden', tabindex: '-1', 'aria-hidden': 'true' });
    if (this.getAttribute('accept')) this.input.setAttribute('accept', this.getAttribute('accept'));
    if (this.hasAttribute('multiple')) this.input.multiple = true;
    this.input.addEventListener('change', function () { self.take(self.input.files); self.input.value = ''; });
    var extra = Array.prototype.slice.call(this.childNodes);
    var face = h('div', { class: 'sheen-drop-face' },
      glyph(this.getAttribute('glyph') || 'upload', 30),
      h('span', { class: 'sheen-drop-label', text: this.getAttribute('label') || '' }),
      this.getAttribute('hint') ? h('span', { class: 'sheen-drop-hint', text: this.getAttribute('hint') }) : null);
    extra.forEach(function (n) { face.appendChild(n); });
    this.replaceChildren(face, this.input);
    this.setAttribute('role', 'button');
    this.setAttribute('tabindex', this.getAttribute('tabindex') || '0');
    this.setAttribute('aria-label', [this.getAttribute('label'), this.getAttribute('hint')].filter(Boolean).join(', '));
    this.addEventListener('click', function (e) { if (e.target !== self.input && !self.hasAttribute('disabled')) self.input.click(); });
    this.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && !self.hasAttribute('disabled')) { e.preventDefault(); self.input.click(); }
    });
    this.addEventListener('dragover', function (e) { e.preventDefault(); self.classList.add('sheen-over'); });
    this.addEventListener('dragleave', function () { self.classList.remove('sheen-over'); });
    this.addEventListener('drop', function (e) {
      e.preventDefault();
      self.classList.remove('sheen-over');
      if (!self.hasAttribute('disabled') && e.dataTransfer) self.take(e.dataTransfer.files);
    });
  }
  take(list) {
    var files = Array.prototype.slice.call(list || []);
    if (!this.hasAttribute('multiple')) files = files.slice(0, 1);
    if (files.length) emit(this, 'sheen-files', { files: files });
  }
}
define('sheen-drop-zone', SheenDropZone);

// <sheen-toaster close-label="Dismiss" max="3">  — an aria-live region that queues toasts.
//   toaster.show({title, message, tone: 'info'|'success'|'warning'|'danger', timeout: ms (0 = stays),
//                 action: {label, onClick}}) → id;  toaster.dismiss(id).
//   sheenElements.toast(options) uses the first <sheen-toaster> on the page (and adds one if there is none).
//   Pointer over a toast or focus inside it pauses its timer. At most max are shown; the rest wait their turn.
class SheenToaster extends HTMLElement {
  connectedCallback() {
    this.setAttribute('role', 'region');
    this.setAttribute('aria-live', 'polite');
    if (!this.getAttribute('aria-label') && this.getAttribute('label')) this.setAttribute('aria-label', this.getAttribute('label'));
    this.queue = this.queue || [];
  }
  show(opts) {
    opts = opts || {};
    this.queue = this.queue || [];
    var id = uid('toast'), item = { id: id, opts: opts };
    this.queue.push(item);
    this.pump();
    return id;
  }
  pump() {
    var max = parseInt(this.getAttribute('max'), 10) || 3;
    while (this.querySelectorAll('.sheen-toast').length < max && this.queue.length) this.mount(this.queue.shift());
  }
  mount(item) {
    var self = this, o = item.opts, tone = o.tone || 'info';
    var node = h('div', { class: 'sheen-toast sheen-glass sheen-toast-' + tone, id: item.id, role: tone === 'danger' ? 'alert' : 'status' },
      h('span', { class: 'sheen-toast-dot', 'aria-hidden': 'true' }),
      h('div', { class: 'sheen-toast-text' },
        o.title ? h('b', { text: o.title }) : null,
        o.message ? h('span', { class: 'sheen-secondary', text: o.message }) : null),
      o.action ? h('button', { type: 'button', class: 'sheen-button sheen-small', text: o.action.label,
        onclick: function () { try { o.action.onClick(); } finally { self.dismiss(item.id); } } }) : null,
      h('button', { type: 'button', class: 'sheen-icon-button sheen-toast-close', 'aria-label': this.getAttribute('close-label') || '',
        onclick: function () { self.dismiss(item.id); } }, glyph('close', 18)));
    this.appendChild(node);
    var timeout = o.timeout == null ? 5000 : o.timeout;
    if (timeout > 0) {
      var left = timeout, started = Date.now(), timer = null;
      var run = function () { started = Date.now(); timer = setTimeout(function () { self.dismiss(item.id); }, left); };
      var hold = function () { clearTimeout(timer); left -= Date.now() - started; };
      node.addEventListener('pointerenter', hold);
      node.addEventListener('pointerleave', run);
      node.addEventListener('focusin', hold);
      node.addEventListener('focusout', run);
      run();
    }
  }
  dismiss(id) {
    var node = this.querySelector('#' + id);
    this.queue = (this.queue || []).filter(function (q) { return q.id !== id; });
    if (node) node.remove();
    this.pump();
  }
}
define('sheen-toaster', SheenToaster);
