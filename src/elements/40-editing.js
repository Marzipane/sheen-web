// <sheen-timeline duration="90" playhead="12" label="Timeline" zoom-in-label="Zoom in" zoom-out-label="Zoom out"
//                 split-label="Split at the playhead">
//   A simple multi-track timeline (not a full editor). timeline.tracks =
//     [{id, label, kind: 'video'|'audio'|'captions'|'overlay', peaks?: [0..1], clips: [{id, start, end, label}]}]
//   Clips sit on lanes by time; the playhead is a line. Click a lane or the ruler to seek ("sheen-seek" {time}).
//   Each clip is a button with trim handles at both ends (drag them). Keyboard on a focused clip:
//     Alt+← → trims its start, Shift+← → trims its end (0.5 s; with Ctrl 0.1 s), S splits it at the playhead,
//     Delete removes it. ← → alone move the playhead by 1 s.
//   Events: "sheen-clipchange" {track, clip}, "sheen-split" {track, clip, time}, "sheen-clipdelete" {track, clip},
//   "sheen-seek" {time}. The element changes its own tracks first, so listeners can save timeline.tracks.
class SheenTimeline extends HTMLElement {
  static get observedAttributes() { return ['playhead', 'duration']; }
  connectedCallback() {
    if (this.scroller) return;
    var self = this;
    this._tracks = this._tracks || [];
    this.zoom = 1;
    var tool = function (g, attr, fn) {
      return h('button', { type: 'button', class: 'sheen-icon-button sheen-small-icon', 'aria-label': self.getAttribute(attr) || '', title: self.getAttribute(attr) || null, onclick: fn }, glyph(g, 18));
    };
    this.toolbar = h('div', { class: 'sheen-tl-tools', role: 'toolbar', 'aria-label': this.getAttribute('label') || '' },
      tool('zoom-out', 'zoom-out-label', function () { self.setZoom(self.zoom / 1.5); }),
      tool('zoom-in', 'zoom-in-label', function () { self.setZoom(self.zoom * 1.5); }),
      tool('split', 'split-label', function () { self.splitAt(self.playhead); }));
    this.canvasWrap = h('div', { class: 'sheen-tl-body' });
    this.scroller = h('div', { class: 'sheen-tl-scroll' }, this.canvasWrap);
    this.replaceChildren(this.toolbar, this.scroller);
    this.setAttribute('role', 'group');
    if (this.getAttribute('label')) this.setAttribute('aria-label', this.getAttribute('label'));
    this.scroller.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.sheen-tl-clip')) return;
      var lane = e.target.closest('.sheen-tl-lane, .sheen-tl-ruler');
      if (lane) self.seek(self.timeAt(e, lane));
    });
    if (window.ResizeObserver) { this.ro = new ResizeObserver(function () { self.render(); }); this.ro.observe(this); }
    this.render();
  }
  disconnectedCallback() { if (this.ro) this.ro.disconnect(); }
  attributeChangedCallback(name) { if (!this.scroller) return; if (name === 'playhead') this.paintHead(); else this.render(); }
  get tracks() { return this._tracks || []; }
  set tracks(v) { this._tracks = Array.isArray(v) ? v : []; if (this.scroller) this.render(); }
  get duration() { return parseFloat(this.getAttribute('duration')) || 0; }
  get playhead() { return parseFloat(this.getAttribute('playhead')) || 0; }
  set playhead(v) { this.setAttribute('playhead', String(clamp(v, 0, this.duration))); }
  pps() {
    // at zoom 1 the whole duration fits beside the track names
    var head = parseFloat(cssVar(this, '--sheen-tl-head-size', '96')) || 96, w = (this.scroller.clientWidth || 600) - head - 8;
    return this.duration ? (Math.max(80, w) / this.duration) * this.zoom : 10;
  }
  setZoom(z) { this.zoom = clamp(z, 1, 40); this.render(); emit(this, 'sheen-zoom', { zoom: this.zoom }); }
  timeAt(e, lane) {
    var r = lane.getBoundingClientRect(), x = isRtl(this) ? r.right - e.clientX : e.clientX - r.left;
    return clamp(x / this.pps(), 0, this.duration);
  }
  seek(t) { this.playhead = t; emit(this, 'sheen-seek', { time: this.playhead }); }
  find(clipId) {
    for (var i = 0; i < this.tracks.length; i++) {
      var c = (this.tracks[i].clips || []).filter(function (x) { return x.id === clipId; })[0];
      if (c) return { track: this.tracks[i], clip: c };
    }
    return null;
  }
  splitAt(time, clipId) {
    var self = this, done = false;
    this.tracks.forEach(function (tr) {
      (tr.clips || []).slice().forEach(function (c) {
        if (done || (clipId && c.id !== clipId) || !(time > c.start + 0.05 && time < c.end - 0.05)) return;
        if (!clipId && tr.kind !== 'video') return;
        var right = Object.assign({}, c, { id: c.id + '-' + Math.round(time * 1000), start: time });
        c.end = time;
        tr.clips.splice(tr.clips.indexOf(c) + 1, 0, right);
        done = true;
        self.render();
        emit(self, 'sheen-split', { track: tr, clip: c, time: time });
      });
    });
    return done;
  }
  trim(track, clip, edge, delta) {
    var i = track.clips.indexOf(clip), prev = track.clips[i - 1], next = track.clips[i + 1];
    if (edge === 'start') clip.start = clamp(clip.start + delta, prev ? prev.end : 0, clip.end - 0.2);
    else clip.end = clamp(clip.end + delta, clip.start + 0.2, next ? next.start : this.duration);
  }
  render() {
    var self = this, pps = this.pps(), width = Math.max(1, this.duration * pps);
    var step = [0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300].filter(function (s) { return s * pps >= 64; })[0] || 600;
    var ruler = h('div', { class: 'sheen-tl-ruler', 'aria-hidden': 'true', style: 'inline-size:' + width + 'px' });
    for (var t = 0; t < this.duration - step * 0.4; t += step) {   // no label hanging over the end
      ruler.appendChild(h('span', { class: 'sheen-tl-mark sheen-num', style: 'inset-inline-start:' + t * pps + 'px', text: fmtTime(t) }));
    }
    var rows = this.tracks.map(function (tr) {
      var lane = h('div', { class: 'sheen-tl-lane sheen-tl-' + (tr.kind || 'video'), style: 'inline-size:' + width + 'px' });
      if (tr.peaks && tr.peaks.length) lane.appendChild(self.peaksCanvas(tr.peaks, width));
      (tr.clips || []).forEach(function (c) { lane.appendChild(self.clipNode(tr, c, pps)); });
      return h('div', { class: 'sheen-tl-track', role: 'group', 'aria-label': tr.label || '' },
        h('div', { class: 'sheen-tl-head', 'aria-hidden': 'true' }, h('span', { class: 'sheen-ellipsis', text: tr.label || '' })), lane);
    });
    this.head = h('div', { class: 'sheen-tl-playhead', 'aria-hidden': 'true' });
    this.canvasWrap.replaceChildren.apply(this.canvasWrap, [h('div', { class: 'sheen-tl-track sheen-tl-ruler-row' },
      h('div', { class: 'sheen-tl-head' }), ruler)].concat(rows, [this.head]));
    this.paintHead();
  }
  paintHead() {
    if (!this.head) return;
    this.head.style.insetInlineStart = 'calc(var(--sheen-tl-head-size) + ' + (this.playhead * this.pps()) + 'px)';
  }
  peaksCanvas(peaks, width) {
    var cv = h('canvas', { class: 'sheen-tl-peaks', 'aria-hidden': 'true' });
    var ctx = cv.getContext ? cv.getContext('2d') : null;
    if (!ctx) return cv;
    var hgt = 40, rtl = isRtl(this);
    cv.width = Math.min(8000, Math.round(width)); cv.height = hgt;
    ctx.fillStyle = cssVar(this, '--sheen-text-tertiary', '#868E9D');
    for (var x = 0; x < cv.width; x += 3) {
      var v = peaks[Math.floor(x / cv.width * peaks.length)] || 0, bh = Math.max(1, v * (hgt - 4));
      ctx.fillRect(rtl ? cv.width - x - 2 : x, (hgt - bh) / 2, 2, bh);
    }
    return cv;
  }
  clipNode(tr, c, pps) {
    var self = this;
    var node = h('button', { type: 'button', class: 'sheen-tl-clip', 'data-clip': c.id,
      'aria-label': (c.label || '') + ' ' + fmtTime(c.start, true) + ' – ' + fmtTime(c.end, true),
      style: 'inset-inline-start:' + c.start * pps + 'px;inline-size:' + Math.max(4, (c.end - c.start) * pps) + 'px' },
      h('span', { class: 'sheen-tl-grip sheen-tl-grip-start', 'data-edge': 'start', 'aria-hidden': 'true' }),
      h('span', { class: 'sheen-tl-clip-label sheen-ellipsis', text: c.label || '' }),
      h('span', { class: 'sheen-tl-grip sheen-tl-grip-end', 'data-edge': 'end', 'aria-hidden': 'true' }));
    node.addEventListener('pointerdown', function (e) {
      var edge = e.target.getAttribute('data-edge');
      if (!edge) return;
      e.preventDefault();
      var x0 = e.clientX, start = c[edge], dir = isRtl(self) ? -1 : 1;
      var move = function (ev) {
        var d = (ev.clientX - x0) * dir / pps;
        self.trim(tr, c, edge, start + d - c[edge]);
        node.style.insetInlineStart = c.start * pps + 'px';
        node.style.inlineSize = Math.max(4, (c.end - c.start) * pps) + 'px';
      };
      var up = function () {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        emit(self, 'sheen-clipchange', { track: tr, clip: c });
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });
    node.addEventListener('click', function () { emit(self, 'sheen-select', { track: tr, clip: c }); });
    node.addEventListener('keydown', function (e) {
      var s = arrowStep(e, self), amount = e.ctrlKey ? 0.1 : 0.5;
      if (s && (e.altKey || e.shiftKey) && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        self.trim(tr, c, e.altKey ? 'start' : 'end', s * amount);
        self.render();
        self.focusClip(c.id);
        emit(self, 'sheen-clipchange', { track: tr, clip: c });
      } else if (s && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        self.seek(self.playhead + s);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (self.splitAt(self.playhead, c.id)) self.focusClip(c.id);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        tr.clips.splice(tr.clips.indexOf(c), 1);
        self.render();
        emit(self, 'sheen-clipdelete', { track: tr, clip: c });
      }
    });
    return node;
  }
  focusClip(id) { var n = this.querySelector('[data-clip="' + id + '"]'); if (n) n.focus(); }
}
define('sheen-timeline', SheenTimeline);

// <sheen-transcript label="Transcript" current="12.4" removed-label="cut" follow>
//   Text-based editing. transcript.words = [{text, start, end, kind: 'word'|'filler'|'pause', removed}] (a pause
//   token's text is given by the page, e.g. "1.4 s"). It is a multi-select listbox: click a word to jump there
//   ("sheen-seek" {time}), Shift+click or Shift+← → to select a run, Delete or Backspace to cut the selection (or put
//   it back if all of it was cut). Fillers and long pauses are highlighted; transcript.removeKind('filler') cuts all of
//   a kind at once. Every change fires "sheen-edit" {removed: [index…], restored: [index…]} after updating words.
//   The word at the current time is marked; with follow it is kept in view.
class SheenTranscript extends HTMLElement {
  static get observedAttributes() { return ['current']; }
  connectedCallback() {
    if (this.listId) return;
    var self = this;
    this.listId = uid('transcript');
    this._words = this._words || [];
    this.active = 0; this.anchor = 0; this.selected = new Set();
    this.setAttribute('role', 'listbox');
    this.setAttribute('aria-multiselectable', 'true');
    this.setAttribute('tabindex', '0');
    if (this.getAttribute('label')) this.setAttribute('aria-label', this.getAttribute('label'));
    this.addEventListener('click', function (e) {
      var w = e.target.closest('[data-i]');
      if (!w) return;
      var i = +w.getAttribute('data-i');
      if (e.shiftKey) self.selectRange(self.anchor, i); else { self.anchor = i; self.selectRange(i, i); emit(self, 'sheen-seek', { time: self.words[i].start }); }
      self.active = i; self.mark();
    });
    this.addEventListener('keydown', function (e) { self.onKey(e); });
    this.render();
  }
  attributeChangedCallback() { if (this.listId) this.paintNow(); }
  get words() { return this._words || []; }
  set words(v) { this._words = Array.isArray(v) ? v : []; if (this.listId) { this.selected = new Set(); this.render(); } }
  selectRange(a, b) {
    this.selected = new Set();
    for (var i = Math.min(a, b); i <= Math.max(a, b); i++) this.selected.add(i);
    this.mark();
  }
  onKey(e) {
    var n = this.words.length, s = arrowStep(e, this);
    if (!n) return;
    if (s && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      this.active = clamp(this.active + s, 0, n - 1);
      if (e.shiftKey) this.selectRange(this.anchor, this.active); else { this.anchor = this.active; this.selectRange(this.active, this.active); }
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      this.active = e.key === 'Home' ? 0 : n - 1;
      if (e.shiftKey) this.selectRange(this.anchor, this.active); else { this.anchor = this.active; this.selectRange(this.active, this.active); }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      emit(this, 'sheen-seek', { time: this.words[this.active].start });
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      this.toggleCut(this.selected.size ? Array.from(this.selected) : [this.active]);
    }
  }
  toggleCut(indices) {
    var words = this.words, allCut = indices.every(function (i) { return words[i] && words[i].removed; });
    var changed = indices.filter(function (i) { return words[i] && !!words[i].removed === allCut; });
    changed.forEach(function (i) { words[i].removed = !allCut; });
    this.render();
    emit(this, 'sheen-edit', allCut ? { removed: [], restored: changed } : { removed: changed, restored: [] });
    return changed;
  }
  removeKind(kind) {
    var idx = [];
    this.words.forEach(function (w, i) { if (w.kind === kind && !w.removed) idx.push(i); });
    if (!idx.length) return [];
    idx.forEach(function (i) { this.words[i].removed = true; }, this);
    this.render();
    emit(this, 'sheen-edit', { removed: idx, restored: [] });
    return idx;
  }
  render() {
    var self = this, cut = this.getAttribute('removed-label');
    var nodes = this.words.map(function (w, i) {
      var label = w.removed && cut ? w.text + ', ' + cut : null;
      return h('span', { class: 'sheen-word sheen-word-' + (w.kind || 'word') + (w.removed ? ' sheen-removed' : ''),
        role: 'option', id: self.listId + '-' + i, 'data-i': String(i), 'aria-selected': 'false', 'aria-label': label, dir: 'auto',
        title: fmtTime(w.start, true), text: w.text });
    });
    var frag = [];
    nodes.forEach(function (n) { frag.push(n, document.createTextNode(' ')); });
    this.replaceChildren.apply(this, frag);
    this.mark();
    this.paintNow();
  }
  mark() {
    var self = this;
    this.querySelectorAll('[data-i]').forEach(function (n) {
      var i = +n.getAttribute('data-i');
      n.setAttribute('aria-selected', self.selected.has(i) ? 'true' : 'false');
      n.classList.toggle('sheen-active', i === self.active);
    });
    if (this.words.length) this.setAttribute('aria-activedescendant', this.listId + '-' + this.active);
  }
  paintNow() {
    var t = parseFloat(this.getAttribute('current')), now = null;
    if (isNaN(t)) return;
    this.querySelectorAll('.sheen-now').forEach(function (n) { n.classList.remove('sheen-now'); });
    for (var i = 0; i < this.words.length; i++) {
      var w = this.words[i];
      if (t >= w.start && t < w.end) { now = this.querySelector('[data-i="' + i + '"]'); break; }
    }
    if (now) {
      now.classList.add('sheen-now');
      if (this.hasAttribute('follow') && now.scrollIntoView) now.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
    }
  }
}
define('sheen-transcript', SheenTranscript);
