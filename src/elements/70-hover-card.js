// <sheen-hover-card label="Customer details" delay="350"> … </sheen-hover-card>
//   A card of facts and quick actions beside a link. card.attach(trigger) joins it to one element at a time.
//   Hover opens it after the delay, so moving across a table sends nothing; focus and Space open it with no pointer; a
//   touch never does. It stays while the pointer is over it, and Esc closes it and returns focus (WCAG 1.4.13).
//   Fires "sheen-hover-open" {trigger} just before it shows, which is when to load the facts, and "sheen-hover-close".
var HOVER_LEAVE_MS = 200;

class SheenHoverCard extends HTMLElement {
  connectedCallback() {
    if (this.ready) return;
    this.ready = true;
    var self = this;
    this.hidden = true;
    this.classList.add('sheen-glass');
    this.setAttribute('role', 'dialog');
    this.setAttribute('aria-modal', 'false');
    this.setAttribute('aria-label', this.getAttribute('label') || '');
    this.tabIndex = -1;
    this.addEventListener('pointerenter', function () { window.clearTimeout(self.leaveTimer); });
    this.addEventListener('pointerleave', function () { self.leaveSoon(); });
    this.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); self.close(); if (self.trigger) self.trigger.focus(); }
    });
    if (this.pending) { var t = this.pending; this.pending = null; this.attach(t); }
  }
  get delay() { return parseInt(this.getAttribute('delay'), 10) || 350; }
  attach(trigger) {
    if (!this.ready) { this.pending = trigger; return; }
    var self = this;
    this.detach();
    this.trigger = trigger;
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');
    this.onEnter = function (e) {
      if (e.pointerType === 'touch') return;
      window.clearTimeout(self.leaveTimer);
      self.openTimer = window.setTimeout(function () { self.open(); }, self.delay);
    };
    this.onLeave = function () { window.clearTimeout(self.openTimer); self.leaveSoon(); };
    this.onKey = function (e) {
      if (e.key === ' ' && self.hidden) {
        e.preventDefault();
        self.open();
        var first = self.querySelector('a[href],button:not([disabled]),input,select,textarea');
        (first || self).focus();
      } else if (e.key === 'Escape') self.close();
    };
    trigger.addEventListener('pointerenter', this.onEnter);
    trigger.addEventListener('pointerleave', this.onLeave);
    trigger.addEventListener('keydown', this.onKey);
  }
  detach() {
    if (!this.trigger) return;
    this.trigger.removeEventListener('pointerenter', this.onEnter);
    this.trigger.removeEventListener('pointerleave', this.onLeave);
    this.trigger.removeEventListener('keydown', this.onKey);
    this.trigger = null;
  }
  disconnectedCallback() {
    window.clearTimeout(this.openTimer);
    window.clearTimeout(this.leaveTimer);
    this.detach();
    this.ready = false;
  }
  leaveSoon() {
    var self = this;
    window.clearTimeout(this.leaveTimer);
    this.leaveTimer = window.setTimeout(function () { self.close(); }, HOVER_LEAVE_MS);
  }
  open() {
    if (!this.hidden) return;
    emit(this, 'sheen-hover-open', { trigger: this.trigger });
    this.hidden = false;
    if (this.trigger) this.trigger.setAttribute('aria-expanded', 'true');
    this.place();
  }
  close() {
    window.clearTimeout(this.openTimer);
    if (this.hidden) return;
    this.hidden = true;
    if (this.trigger) this.trigger.setAttribute('aria-expanded', 'false');
    emit(this, 'sheen-hover-close', {});
  }
  place() {
    if (!this.trigger) return;
    var r = this.trigger.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight, gap = 8;
    var w = this.offsetWidth || 300, hh = this.offsetHeight || 200, rtl = isRtl(this);
    var start = rtl ? W - r.right : r.left, top = r.bottom + gap + hh < H ? r.bottom + gap : r.top - gap - hh;
    this.style.top = clamp(top, 12, Math.max(12, H - hh - 12)) + 'px';
    this.style.insetInlineStart = clamp(start, 12, Math.max(12, W - w - 12)) + 'px';
  }
}
define('sheen-hover-card', SheenHoverCard);
