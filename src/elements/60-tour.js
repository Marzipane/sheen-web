// <sheen-tour label="Welcome tour" next-label="Next" back-label="Back" done-label="Done" skip-label="Skip"
//             step-label="@n of @all">
//   A short guided tour. tour.steps = [{target: 'CSS selector', title, text}]; tour.start() / tour.stop().
//   Each step dims the page around its target and shows a glass card beside it (a non-modal dialog that keeps focus
//   inside while open): Enter or Next moves on, Back goes back, Esc or Skip ends. A step whose target is missing is
//   shown in the middle. Targets with display: contents have no box, so point at a child instead.
//   Fires "sheen-tour-step" {index} and "sheen-tour-end" {completed: true|false}.
class SheenTour extends HTMLElement {
  connectedCallback() {
    if (this.card) return;
    var self = this;
    this._steps = this._steps || [];
    this.index = 0;
    this.spot = h('div', { class: 'sheen-tour-spot', 'aria-hidden': 'true' });
    this.titleEl = h('h2', { class: 'sheen-headline', id: uid('tour-title') });
    this.textEl = h('p', { class: 'sheen-secondary' });
    this.countEl = h('span', { class: 'sheen-footnote sheen-tertiary sheen-num' });
    this.back = h('button', { type: 'button', class: 'sheen-button sheen-small', text: this.getAttribute('back-label') || '', onclick: function () { self.go(self.index - 1); } });
    this.next = h('button', { type: 'button', class: 'sheen-button sheen-small sheen-glass-prominent', onclick: function () { self.go(self.index + 1); } });
    this.skip = h('button', { type: 'button', class: 'sheen-button sheen-small sheen-tour-skip', text: this.getAttribute('skip-label') || '', onclick: function () { self.stop(false); } });
    this.card = h('div', { class: 'sheen-tour-card sheen-glass', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': this.titleEl.id, tabindex: '-1' },
      this.countEl, this.titleEl, this.textEl, h('div', { class: 'sheen-row sheen-tour-actions' }, this.skip, h('span', { class: 'sheen-tour-gap' }), this.back, this.next));
    this.replaceChildren(this.spot, this.card);
    this.hidden = true;
    this.card.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); self.stop(false); }
      else if (e.key === 'Enter' && e.target === self.card) { e.preventDefault(); self.go(self.index + 1); }
      else if (e.key === 'Tab') {
        var f = Array.prototype.slice.call(self.card.querySelectorAll('button:not([hidden])'));
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    this.onResize = function () { if (!self.hidden) self.place(); };
    window.addEventListener('resize', this.onResize);
  }
  disconnectedCallback() { window.removeEventListener('resize', this.onResize); }
  get steps() { return this._steps || []; }
  set steps(v) { this._steps = Array.isArray(v) ? v : []; }
  get running() { return !this.hidden; }
  start(i) { this.hidden = false; this.go(i || 0); }
  stop(completed) {
    if (this.hidden) return;
    this.hidden = true;
    emit(this, 'sheen-tour-end', { completed: !!completed });
  }
  go(i) {
    if (i >= this.steps.length) { this.stop(true); return; }
    this.index = clamp(i, 0, this.steps.length - 1);
    var s = this.steps[this.index];
    this.titleEl.textContent = s.title || '';
    this.textEl.textContent = s.text || '';
    this.countEl.textContent = fill(this.getAttribute('step-label') || '', { n: this.index + 1, all: this.steps.length });
    this.back.hidden = this.index === 0;
    this.next.textContent = this.getAttribute(this.index === this.steps.length - 1 ? 'done-label' : 'next-label') || '';
    var t = s.target ? document.querySelector(s.target) : null;
    if (t && t.scrollIntoView) t.scrollIntoView({ block: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' });
    this.place();
    this.card.focus();
    emit(this, 'sheen-tour-step', { index: this.index });
  }
  place() {
    var s = this.steps[this.index] || {}, t = s.target ? document.querySelector(s.target) : null;
    var r = t ? t.getBoundingClientRect() : null, pad = 8;
    if (!r || (!r.width && !r.height)) {
      this.spot.hidden = true;
      this.card.classList.add('sheen-tour-center');
      this.card.style.top = ''; this.card.style.insetInlineStart = '';
      return;
    }
    this.spot.hidden = false;
    this.card.classList.remove('sheen-tour-center');
    this.spot.style.top = (r.top - pad) + 'px';
    this.spot.style.insetInlineStart = (isRtl(this) ? window.innerWidth - r.right - pad : r.left - pad) + 'px';
    this.spot.style.width = (r.width + pad * 2) + 'px';
    this.spot.style.height = (r.height + pad * 2) + 'px';
    var cardH = this.card.offsetHeight || 180, below = r.bottom + 16 + cardH < window.innerHeight;
    this.card.style.top = Math.max(12, below ? r.bottom + 16 : r.top - 16 - cardH) + 'px';
    var start = isRtl(this) ? window.innerWidth - r.right : r.left;
    this.card.style.insetInlineStart = clamp(start, 12, Math.max(12, window.innerWidth - (this.card.offsetWidth || 360) - 12)) + 'px';
  }
}
define('sheen-tour', SheenTour);
