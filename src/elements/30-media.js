// <sheen-video src="clip.mp4" poster="…" play-label="Play" pause-label="Pause" seek-label="Position"
//              mute-label="Mute" unmute-label="Unmute" keys>
//   A video with sheen controls: play/pause, the time, a scrubber and mute. The scrubber is a slider
//   (aria-valuetext "1:05 of 3:20"): ← → step 5 s along the reading direction, Home/End jump. In/out points
//   (video.inPoint / outPoint, in seconds) shade the kept part, and markers ([{time, label}]) draw ticks.
//   With keys, the element answers the editing keys while it (or something inside it) has focus:
//   Space or K play/pause, J back 5 s, L forward 5 s, I sets in, O sets out.
//   Events: "sheen-time" {time}, "sheen-inout" {in, out}. Methods: play(), pause(), toggle(), seek(t).
class SheenVideo extends HTMLElement {
  static get observedAttributes() { return ['src', 'poster']; }
  connectedCallback() {
    if (this.video) return;
    var self = this;
    this.inPoint = this.inPoint == null ? null : this.inPoint;
    this.outPoint = this.outPoint == null ? null : this.outPoint;
    this._markers = this._markers || [];
    this.video = h('video', { class: 'sheen-video-media', preload: 'metadata', playsinline: '' });
    this.playBtn = h('button', { type: 'button', class: 'sheen-icon-button sheen-video-play', 'aria-label': this.getAttribute('play-label') || '' }, glyph('play', 20));
    this.time = h('span', { class: 'sheen-video-time sheen-num', 'aria-hidden': 'true', text: '0:00 / 0:00' });
    this.range = h('div', { class: 'sheen-video-range' });
    this.fillBar = h('div', { class: 'sheen-video-fill' });
    this.knob = h('div', { class: 'sheen-video-knob' });
    this.ticks = h('div', { class: 'sheen-video-ticks' });
    this.scrub = h('div', { class: 'sheen-video-scrub', role: 'slider', tabindex: '0', 'aria-label': this.getAttribute('seek-label') || '',
      'aria-valuemin': '0', 'aria-valuemax': '0', 'aria-valuenow': '0' },
      h('div', { class: 'sheen-video-rail' }, this.range, this.fillBar, this.ticks), this.knob);
    this.muteBtn = h('button', { type: 'button', class: 'sheen-icon-button sheen-video-mute', 'aria-label': this.getAttribute('mute-label') || '' }, glyph('volume', 20));
    this.bar = h('div', { class: 'sheen-video-bar sheen-glass' }, this.playBtn, this.time, this.scrub, this.muteBtn);
    this.replaceChildren(this.video, this.bar);
    this.sync();
    this.playBtn.addEventListener('click', function () { self.toggle(); });
    this.video.addEventListener('click', function () { self.toggle(); });
    this.muteBtn.addEventListener('click', function () { self.video.muted = !self.video.muted; self.paint(); });
    ['timeupdate', 'loadedmetadata', 'play', 'pause', 'durationchange', 'volumechange'].forEach(function (t) {
      self.video.addEventListener(t, function () {
        if (t === 'timeupdate' && self.outPoint != null && self.video.currentTime >= self.outPoint && !self.video.paused) self.video.pause();
        self.paint();
        if (t === 'timeupdate') emit(self, 'sheen-time', { time: self.video.currentTime });
      });
    });
    var dragging = false;
    var seekAt = function (e) { self.seek(pointerFraction(e, self.scrub) * (self.duration || 0)); };
    this.scrub.addEventListener('pointerdown', function (e) {
      dragging = true;
      if (self.scrub.setPointerCapture) self.scrub.setPointerCapture(e.pointerId);
      seekAt(e);
    });
    this.scrub.addEventListener('pointermove', function (e) { if (dragging) seekAt(e); });
    this.scrub.addEventListener('pointerup', function () { dragging = false; });
    this.scrub.addEventListener('keydown', function (e) {
      var step = arrowStep(e, self.scrub);
      if (step) { e.preventDefault(); self.seek(self.currentTime + step * (e.shiftKey ? 1 : 5)); }
      else if (e.key === 'Home') { e.preventDefault(); self.seek(0); }
      else if (e.key === 'End') { e.preventDefault(); self.seek(self.duration); }
    });
    this.addEventListener('keydown', function (e) { if (self.hasAttribute('keys')) self.onKey(e); });
    this.paint();
  }
  attributeChangedCallback() { if (this.video) this.sync(); }
  sync() {
    if (this.getAttribute('src') && this.video.getAttribute('src') !== this.getAttribute('src')) this.video.setAttribute('src', this.getAttribute('src'));
    if (this.getAttribute('poster')) this.video.setAttribute('poster', this.getAttribute('poster'));
  }
  get currentTime() { return this.video ? this.video.currentTime || 0 : 0; }
  get duration() { return this.video && isFinite(this.video.duration) ? this.video.duration : (parseFloat(this.getAttribute('duration')) || 0); }
  get markers() { return this._markers || []; }
  set markers(v) { this._markers = Array.isArray(v) ? v : []; if (this.video) this.paint(); }
  play() { var p = this.video.play(); if (p && p.catch) p.catch(function () {}); }
  pause() { this.video.pause(); }
  toggle() { if (this.video.paused) this.play(); else this.pause(); }
  seek(t) {
    var d = this.duration;
    try { this.video.currentTime = clamp(t, 0, d || Math.max(0, t)); } catch (e) { /* not loaded yet */ }
    this.paint();
    emit(this, 'sheen-time', { time: this.currentTime });
  }
  setInOut(inPoint, outPoint) {
    this.inPoint = inPoint; this.outPoint = outPoint;
    this.paint();
    emit(this, 'sheen-inout', { in: inPoint, out: outPoint });
  }
  onKey(e) {
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    var k = e.key.toLowerCase();
    if (k === ' ' && e.target === this.scrub) { e.preventDefault(); this.toggle(); return; }
    if (k === ' ' || k === 'k') { if (e.target.tagName === 'BUTTON' && k === ' ') return; e.preventDefault(); this.toggle(); }
    else if (k === 'j') { e.preventDefault(); this.seek(this.currentTime - 5); }
    else if (k === 'l') { e.preventDefault(); this.seek(this.currentTime + 5); }
    else if (k === 'i') { e.preventDefault(); this.setInOut(this.currentTime, this.outPoint); }
    else if (k === 'o') { e.preventDefault(); this.setInOut(this.inPoint, this.currentTime); }
  }
  paint() {
    var d = this.duration, t = this.currentTime, f = d ? t / d : 0, paused = this.video.paused;
    this.playBtn.replaceChildren(glyph(paused ? 'play' : 'pause', 20));
    this.playBtn.setAttribute('aria-label', this.getAttribute(paused ? 'play-label' : 'pause-label') || '');
    this.muteBtn.replaceChildren(glyph(this.video.muted ? 'mute' : 'volume', 20));
    this.muteBtn.setAttribute('aria-label', this.getAttribute(this.video.muted ? 'unmute-label' : 'mute-label') || '');
    this.time.textContent = fmtTime(t) + ' / ' + fmtTime(d);
    this.scrub.setAttribute('aria-valuemax', String(Math.round(d)));
    this.scrub.setAttribute('aria-valuenow', String(Math.round(t)));
    this.scrub.setAttribute('aria-valuetext', fmtTime(t) + ' / ' + fmtTime(d));
    this.fillBar.style.inlineSize = (f * 100) + '%';
    this.knob.style.insetInlineStart = (f * 100) + '%';
    var a = this.inPoint != null && d ? this.inPoint / d : 0, b = this.outPoint != null && d ? this.outPoint / d : 1;
    this.range.hidden = this.inPoint == null && this.outPoint == null;
    this.range.style.insetInlineStart = (a * 100) + '%';
    this.range.style.inlineSize = (Math.max(0, b - a) * 100) + '%';
    this.ticks.replaceChildren.apply(this.ticks, this.markers.filter(function () { return d; }).map(function (m) {
      return h('span', { class: 'sheen-video-tick', title: m.label || null, style: 'inset-inline-start:' + (m.time / d * 100) + '%' });
    }));
    this.classList.toggle('sheen-playing', !paused);
  }
}
define('sheen-video', SheenVideo);

// <sheen-waveform duration="90" label="Audio position" progress="12.5">
//   Audio peaks drawn as bars (waveform.peaks = [0..1, …]); the played part takes the accent. It is a slider:
//   a click, a drag or ← → seeks and fires "sheen-seek" {time}. Mirrors in right-to-left pages.
class SheenWaveform extends HTMLElement {
  static get observedAttributes() { return ['progress', 'duration']; }
  connectedCallback() {
    if (this.canvas) return;
    var self = this;
    this._peaks = this._peaks || [];
    this.canvas = h('canvas', { class: 'sheen-wave-canvas', 'aria-hidden': 'true' });
    this.replaceChildren(this.canvas);
    this.setAttribute('role', 'slider');
    this.setAttribute('tabindex', this.getAttribute('tabindex') || '0');
    if (this.getAttribute('label')) this.setAttribute('aria-label', this.getAttribute('label'));
    var drag = false;
    var at = function (e) { self.seekTo(pointerFraction(e, self) * self.duration); };
    this.addEventListener('pointerdown', function (e) { drag = true; at(e); });
    this.addEventListener('pointermove', function (e) { if (drag) at(e); });
    this.addEventListener('pointerup', function () { drag = false; });
    this.addEventListener('keydown', function (e) {
      var s = arrowStep(e, self);
      if (s) { e.preventDefault(); self.seekTo(self.progress + s * (e.shiftKey ? 1 : 5)); }
    });
    if (window.ResizeObserver) { this.ro = new ResizeObserver(function () { self.draw(); }); this.ro.observe(this); }
    this.draw();
  }
  disconnectedCallback() { if (this.ro) this.ro.disconnect(); }
  attributeChangedCallback() { if (this.canvas) this.draw(); }
  get peaks() { return this._peaks || []; }
  set peaks(v) { this._peaks = Array.isArray(v) ? v : []; if (this.canvas) this.draw(); }
  get duration() { return parseFloat(this.getAttribute('duration')) || 0; }
  get progress() { return parseFloat(this.getAttribute('progress')) || 0; }
  set progress(v) { this.setAttribute('progress', String(v)); }
  seekTo(t) {
    t = clamp(t, 0, this.duration);
    this.progress = t;
    emit(this, 'sheen-seek', { time: t });
  }
  draw() {
    var d = this.duration, p = this.progress;
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', String(Math.round(d)));
    this.setAttribute('aria-valuenow', String(Math.round(p)));
    this.setAttribute('aria-valuetext', fmtTime(p) + ' / ' + fmtTime(d));
    var ctx = this.canvas.getContext ? this.canvas.getContext('2d') : null;
    if (!ctx) return;
    var w = this.clientWidth || 300, hgt = this.clientHeight || 56, dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(hgt * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, hgt);
    var peaks = this.peaks, n = peaks.length;
    if (!n) return;
    var bar = 3, gap = 2, count = Math.max(1, Math.floor(w / (bar + gap))), rtl = isRtl(this);
    var played = cssVar(this, '--sheen-accent', '#1F6FEB'), rest = cssVar(this, '--sheen-text-tertiary', '#868E9D');
    for (var i = 0; i < count; i++) {
      var v = peaks[Math.floor(i / count * n)] || 0, bh = Math.max(2, v * (hgt - 4));
      var x = i * (bar + gap); if (rtl) x = w - x - bar;
      ctx.fillStyle = d && (i / count) <= p / d ? played : rest;
      ctx.fillRect(x, (hgt - bh) / 2, bar, bh);
    }
  }
}
define('sheen-waveform', SheenWaveform);

// <sheen-compare before="in.jpg" after="out.jpg" kind="image|video" label="Compare before and after"
//                before-label="Before" after-label="After" position="50">
//   A split view: the "after" picture over the "before", cut at a handle you drag or move with ← → (a slider).
//   With kind="video" both videos play together (compare.play() / pause(); they stay in sync).
class SheenCompare extends HTMLElement {
  static get observedAttributes() { return ['before', 'after', 'position']; }
  connectedCallback() {
    if (this.handle) return;
    var self = this, video = this.getAttribute('kind') === 'video';
    var media = function (src) {
      return video ? h('video', { src: src, muted: '', playsinline: '', preload: 'metadata', class: 'sheen-compare-media' })
        : h('img', { src: src, alt: '', class: 'sheen-compare-media' });
    };
    this.before = media(this.getAttribute('before'));
    this.after = media(this.getAttribute('after'));
    if (video) { this.before.muted = true; this.after.muted = true; }
    this.afterWrap = h('div', { class: 'sheen-compare-after' }, this.after);
    this.handle = h('div', { class: 'sheen-compare-handle', role: 'slider', tabindex: '0', 'aria-label': this.getAttribute('label') || '',
      'aria-valuemin': '0', 'aria-valuemax': '100' }, h('span', { class: 'sheen-compare-grip sheen-glass' }, glyph('compare', 18)));
    // replaceChildren(null) would insert the text "null": only real nodes go in
    this.replaceChildren.apply(this, [this.before, this.afterWrap, this.handle,
      this.getAttribute('before-label') ? h('span', { class: 'sheen-compare-tag sheen-glass-clear sheen-compare-tag-before', text: this.getAttribute('before-label') }) : null,
      this.getAttribute('after-label') ? h('span', { class: 'sheen-compare-tag sheen-glass-clear sheen-compare-tag-after', text: this.getAttribute('after-label') }) : null].filter(Boolean));
    var drag = false;
    this.addEventListener('pointerdown', function (e) { drag = true; self.position = pointerFraction(e, self) * 100; });
    this.addEventListener('pointermove', function (e) { if (drag) self.position = pointerFraction(e, self) * 100; });
    window.addEventListener('pointerup', function () { drag = false; });
    this.handle.addEventListener('keydown', function (e) {
      var s = arrowStep(e, self.handle);
      if (s) { e.preventDefault(); self.position = self.position + s * (e.shiftKey ? 10 : 2); }
    });
    if (video) {
      this.before.addEventListener('timeupdate', function () {
        if (Math.abs(self.after.currentTime - self.before.currentTime) > 0.15) self.after.currentTime = self.before.currentTime;
      });
    }
    this.paint();
  }
  attributeChangedCallback(name) {
    if (!this.handle) return;
    if (name === 'before') this.before.setAttribute('src', this.getAttribute('before'));
    if (name === 'after') this.after.setAttribute('src', this.getAttribute('after'));
    this.paint();
  }
  get position() { var v = parseFloat(this.getAttribute('position')); return isNaN(v) ? 50 : clamp(v, 0, 100); }
  set position(v) { this.setAttribute('position', String(clamp(v, 0, 100))); emit(this, 'sheen-change', { position: this.position }); }
  play() { [this.before, this.after].forEach(function (m) { if (m.play) { var p = m.play(); if (p && p.catch) p.catch(function () {}); } }); }
  pause() { [this.before, this.after].forEach(function (m) { if (m.pause) m.pause(); }); }
  paint() {
    var p = this.position;
    this.style.setProperty('--sheen-compare', p + '%');
    this.handle.setAttribute('aria-valuenow', String(Math.round(p)));
    this.handle.setAttribute('aria-valuetext', Math.round(p) + '%');
  }
}
define('sheen-compare', SheenCompare);
