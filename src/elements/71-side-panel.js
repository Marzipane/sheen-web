// <sheen-side-panel label="Booking" close-label="Close"> … </sheen-side-panel>
//   A panel on the end edge (the left in Arabic) with no backdrop, so the page behind keeps its scroll, filters and
//   selection. panel.open() and panel.close(). It takes focus when it opens, and Esc or the close button gives it back
//   to what had focus before the first open(). Children added at any time go into its body, whatever the loading order.
//   heading="Filters" puts that title and the close button on one row above the body (0.7.0).
//   modal dims the page behind it: a press on the dim closes it, Tab stays inside while it is open, and focus that lands
//   outside comes back in (0.7.0). Hidden by its attribute, it takes its dim away too; moved while open, it keeps one.
//   --sheen-panel-size sets its width (440px by default).
//   Fires "sheen-panel-close".
class SheenSidePanel extends HTMLElement {
  connectedCallback() {
    if (this.body) { if (!this.hidden && this.hasAttribute('modal')) this.shade(); return; }
    var self = this;
    this.body = h('div', { class: 'sheen-panel-body' });
    this.closeButton = h('button', { type: 'button', class: 'sheen-button sheen-small sheen-panel-close', 'aria-label': this.getAttribute('close-label') || '', onclick: function () { self.close(); } }, glyph('close', 18));
    this.top = h('div', { class: 'sheen-panel-top' });
    this.adopt();
    this.frame();
    this.appendChild(this.body);
    // Children that arrive later (the parser after an early script, or a page filling it in) move into the body too.
    if (window.MutationObserver) {
      this.watch = new window.MutationObserver(function () { self.adopt(); });
      this.watch.observe(this, { childList: true });
    }
    this.classList.add('sheen-glass');
    this.setAttribute('role', 'dialog');
    this.setAttribute('aria-modal', 'false');
    this.setAttribute('aria-label', this.getAttribute('label') || '');
    this.tabIndex = -1;
    this.hidden = true;
    // An inner layer (a menu, a hover card) that handled Esc marks it, so one Esc closes only that layer.
    this.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !e.defaultPrevented) { e.preventDefault(); self.close(); }
      else if (e.key === 'Tab' && self.hasAttribute('modal')) self.trap(e);
    });
  }
  disconnectedCallback() { this.undim(); }
  adopt() {
    var self = this;
    Array.prototype.slice.call(this.childNodes).forEach(function (n) {
      if (n !== self.closeButton && n !== self.body && n !== self.top) self.body.appendChild(n);
    });
  }
  // With a heading: the title and the close button on one row. Without: the close button alone, as before 0.7.0.
  // An empty heading is no heading. The headed look keys on sheen-headed, which only a real heading sets.
  frame() {
    var heading = this.getAttribute('heading');
    this.classList.toggle('sheen-headed', !!heading);
    if (heading) {
      this.top.replaceChildren(h('h2', { class: 'sheen-panel-title', text: heading }), this.closeButton);
      this.insertBefore(this.top, this.firstChild);
    } else {
      if (this.top.parentNode) this.top.remove();
      this.insertBefore(this.closeButton, this.firstChild);
    }
  }
  static get observedAttributes() { return ['label', 'close-label', 'heading', 'hidden']; }
  attributeChangedCallback(name, was, now) {
    if (name === 'hidden') { if (now !== null) this.undim(); }
    else if (name === 'label') this.setAttribute('aria-label', now || '');
    else if (!this.closeButton) return;
    else if (name === 'heading') this.frame();
    else this.closeButton.setAttribute('aria-label', now || '');
  }
  open() {
    // Opened again from inside (a next-record button), it keeps the first opener.
    if (this.hidden) this.opener = document.activeElement;
    this.hidden = false;
    this.setAttribute('aria-modal', this.hasAttribute('modal') ? 'true' : 'false');
    if (this.hasAttribute('modal')) this.shade();
    // A modal panel puts focus on its first control (the close button); otherwise the panel itself takes it (0.4.0).
    var first = this.hasAttribute('modal') ? this.focusables()[0] : null;
    (first || this).focus();
  }
  // The dim behind a modal panel, and a guard that brings focus landing outside back in. Another dialog or popover keeps
  // the focus it takes.
  shade() {
    var self = this;
    if (!this.dim) {
      this.dim = h('div', { class: 'sheen-panel-dim', 'aria-hidden': 'true', onclick: function () { self.close(); } });
      this.parentNode.insertBefore(this.dim, this);
    }
    if (!this.guard) {
      this.guard = function (e) {
        var t = e.target;
        if (self.contains(t) || (t && t.nodeType === 1 && t.closest('[role="dialog"],dialog,[popover]'))) return;
        (self.focusables()[0] || self).focus();
      };
      document.addEventListener('focusin', this.guard);
    }
  }
  close() {
    this.undim();
    if (this.hidden) return;
    this.hidden = true;
    emit(this, 'sheen-panel-close', {});
    if (this.opener && this.opener.focus) this.opener.focus();
  }
  undim() {
    if (this.dim) { this.dim.remove(); this.dim = null; }
    if (this.guard) { document.removeEventListener('focusin', this.guard); this.guard = null; }
  }
  // The controls Tab stops on, in order: not disabled, hidden or taken out with tabindex -1, and one radio per group (its
  // checked radio, or its first while none is checked). Tab from the last goes to the first, Shift+Tab from the first to
  // the last.
  focusables() {
    var all = Array.prototype.slice.call(this.querySelectorAll('button,[href],input,select,textarea,[tabindex]')).filter(function (el) {
      return !el.disabled && el.tabIndex >= 0 && el.type !== 'hidden' && !el.closest('[hidden]') &&
        (typeof el.checkVisibility !== 'function' || el.checkVisibility({ visibilityProperty: true }));
    });
    var stop = {};
    all.forEach(function (el) { if (el.type === 'radio' && el.name && (el.checked || !(el.name in stop))) stop[el.name] = el; });
    return all.filter(function (el) { return el.type !== 'radio' || !el.name || stop[el.name] === el; });
  }
  trap(e) {
    var all = this.focusables();
    if (!all.length) return;
    var first = all[0], last = all[all.length - 1], at = document.activeElement;
    if (e.shiftKey && (at === first || at === this)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && at === last) { e.preventDefault(); first.focus(); }
  }
}
define('sheen-side-panel', SheenSidePanel);
