// <sheen-hover-card label="Customer details" delay="350"> … </sheen-hover-card>
//   A card of facts and quick actions beside a link. card.attach(trigger) joins it to one element at a time.
//   Hover opens it after the delay, so moving across a table sends nothing; focus and Space open it with no pointer; a
//   touch never does. It stays while the pointer is over it, and Esc closes it from anywhere while it is open (WCAG
//   1.4.13), giving focus back to the trigger when focus was inside the card. It closes when the keyboard leaves it.
//   It is placed again when its content changes size, and never grows taller than the window.
//   Fires "sheen-hover-open" {trigger} just before it shows, which is when to load the facts, and "sheen-hover-close".
var HOVER_LEAVE_MS = 200;
var HOVER_DELAY_MS = 350;
var HOVER_GAP = 8;
var HOVER_MARGIN = 12;

class SheenHoverCard extends HTMLElement {
  connectedCallback() {
    if (!this.wired) this.wire();
    if (this.pending) { var t = this.pending; this.pending = null; this.attach(t); }
  }
  // Listeners on the card itself are added once, so moving the card in the page adds no second set.
  wire() {
    var self = this;
    this.wired = true;
    this.hidden = true;
    this.classList.add('sheen-glass');
    this.setAttribute('role', 'dialog');
    this.setAttribute('aria-modal', 'false');
    this.setAttribute('aria-label', this.getAttribute('label') || '');
    this.tabIndex = -1;
    this.addEventListener('pointerenter', function () { window.clearTimeout(self.leaveTimer); });
    this.addEventListener('pointerleave', function () { self.leaveSoon(); });
    this.addEventListener('focusout', function (e) { self.focusLeft(e); });
    // While open, Esc closes it wherever focus is. Capture runs before any layer the card sits in, and the handled
    // key is marked, so one Esc closes only this card.
    this.onDocKey = function (e) {
      if (e.key !== 'Escape' || e.defaultPrevented || self.hidden) return;
      e.preventDefault();
      var inside = self.contains(document.activeElement);
      self.close();
      if (inside && self.trigger) self.trigger.focus();
    };
  }
  static get observedAttributes() { return ['label']; }
  attributeChangedCallback(name, was, now) { this.setAttribute('aria-label', now || ''); }
  get delay() {
    var d = parseInt(this.getAttribute('delay'), 10);
    return isNaN(d) || d < 0 ? HOVER_DELAY_MS : d;
  }
  get ready() { return this.isConnected && this.wired; }
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
      window.clearTimeout(self.openTimer);
      self.openTimer = window.setTimeout(function () { self.open(); }, self.delay);
    };
    this.onLeave = function () { window.clearTimeout(self.openTimer); self.leaveSoon(); };
    this.onKey = function (e) {
      if (e.key === ' ' && self.hidden) {
        e.preventDefault();
        self.open();
        var first = self.querySelector('a[href],button:not([disabled]),input,select,textarea');
        (first || self).focus();
      }
    };
    this.onBlur = function (e) { self.focusLeft(e); };
    trigger.addEventListener('pointerenter', this.onEnter);
    trigger.addEventListener('pointerleave', this.onLeave);
    trigger.addEventListener('keydown', this.onKey);
    trigger.addEventListener('focusout', this.onBlur);
  }
  // Leaves the old trigger as it found it: closed, no pending open, no popup attributes, no listeners.
  detach() {
    window.clearTimeout(this.openTimer);
    window.clearTimeout(this.leaveTimer);
    if (!this.trigger) return;
    this.close();
    this.trigger.removeEventListener('pointerenter', this.onEnter);
    this.trigger.removeEventListener('pointerleave', this.onLeave);
    this.trigger.removeEventListener('keydown', this.onKey);
    this.trigger.removeEventListener('focusout', this.onBlur);
    this.trigger.removeAttribute('aria-expanded');
    this.trigger.removeAttribute('aria-haspopup');
    this.trigger = null;
  }
  // Moving the card in the page keeps its trigger: it is joined again when the card is back on the page.
  disconnectedCallback() {
    var t = this.trigger;
    this.detach();
    if (t) this.pending = t;
  }
  // Focus went somewhere that is neither the card nor its trigger: the keyboard has left, so the card closes.
  focusLeft(e) {
    var to = e.relatedTarget;
    if (this.hidden || !to) return;
    if (this.contains(to) || (this.trigger && this.trigger.contains(to))) return;
    this.close();
  }
  leaveSoon() {
    var self = this;
    window.clearTimeout(this.leaveTimer);
    this.leaveTimer = window.setTimeout(function () { self.close(); }, HOVER_LEAVE_MS);
  }
  open() {
    if (!this.hidden) return;
    var self = this;
    emit(this, 'sheen-hover-open', { trigger: this.trigger });
    this.hidden = false;
    if (this.trigger) this.trigger.setAttribute('aria-expanded', 'true');
    document.addEventListener('keydown', this.onDocKey, true);
    // The facts usually arrive after sheen-hover-open, so the card is placed again whenever its size changes.
    if (window.ResizeObserver) {
      this.sizeWatch = new window.ResizeObserver(function () { self.place(); });
      this.sizeWatch.observe(this);
    }
    this.place();
  }
  close() {
    window.clearTimeout(this.openTimer);
    if (this.hidden) return;
    this.hidden = true;
    document.removeEventListener('keydown', this.onDocKey, true);
    if (this.sizeWatch) { this.sizeWatch.disconnect(); this.sizeWatch = null; }
    if (this.trigger) this.trigger.setAttribute('aria-expanded', 'false');
    emit(this, 'sheen-hover-close', {});
  }
  // Where a fixed card's top-start corner sits on screen when its top and start are 0. That is the window's corner,
  // unless an ancestor holds fixed children itself (backdrop-filter on .sheen-glass, a transform, a filter).
  origin(rtl) {
    this.style.top = '0px';
    this.style.insetInlineStart = '0px';
    var b = this.getBoundingClientRect();
    if (!b.width && !b.height) return { top: 0, start: 0 }; // no layout to measure: nothing to correct
    return { top: b.top, start: rtl ? window.innerWidth - b.right : b.left };
  }
  place() {
    if (!this.trigger) return;
    var r = this.trigger.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
    var w = this.offsetWidth || 300, hh = this.offsetHeight || 200, rtl = isRtl(this);
    var start = rtl ? W - r.right : r.left;
    var top = r.bottom + HOVER_GAP + hh < H ? r.bottom + HOVER_GAP : r.top - HOVER_GAP - hh;
    var o = this.origin(rtl);
    this.style.top = (clamp(top, HOVER_MARGIN, Math.max(HOVER_MARGIN, H - hh - HOVER_MARGIN)) - o.top) + 'px';
    this.style.insetInlineStart = (clamp(start, HOVER_MARGIN, Math.max(HOVER_MARGIN, W - w - HOVER_MARGIN)) - o.start) + 'px';
  }
}
define('sheen-hover-card', SheenHoverCard);
