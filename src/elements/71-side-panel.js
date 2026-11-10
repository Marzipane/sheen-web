// <sheen-side-panel label="Booking" close-label="Close"> … </sheen-side-panel>
//   A panel on the end edge (the left in Arabic) with no backdrop, so the page behind keeps its scroll, filters and
//   selection. panel.open() and panel.close(). It takes focus when it opens, and Esc or the close button gives it back
//   to what had focus before the first open(). Children added at any time go into its body, whatever the loading order.
//   heading="Filters" puts that title and the close button on one row above the body (0.7.0).
//   modal dims the page behind it: a press on the dim closes it, and Tab stays inside while it is open (0.7.0).
//   --sheen-panel-size sets its width (440px by default).
//   Fires "sheen-panel-close".
class SheenSidePanel extends HTMLElement {
  connectedCallback() {
    if (this.body) return;
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
  frame() {
    var heading = this.getAttribute('heading');
    if (heading) {
      this.top.replaceChildren(h('h2', { class: 'sheen-panel-title', text: heading }), this.closeButton);
      this.insertBefore(this.top, this.firstChild);
    } else {
      if (this.top.parentNode) this.top.remove();
      this.insertBefore(this.closeButton, this.firstChild);
    }
  }
  static get observedAttributes() { return ['label', 'close-label', 'heading']; }
  attributeChangedCallback(name, was, now) {
    if (name === 'label') this.setAttribute('aria-label', now || '');
    else if (!this.closeButton) return;
    else if (name === 'heading') this.frame();
    else this.closeButton.setAttribute('aria-label', now || '');
  }
  open() {
    // Opened again from inside (a next-record button), it keeps the first opener.
    if (this.hidden) this.opener = document.activeElement;
    this.hidden = false;
    this.setAttribute('aria-modal', this.hasAttribute('modal') ? 'true' : 'false');
    if (this.hasAttribute('modal') && !this.dim) {
      var self = this;
      this.dim = h('div', { class: 'sheen-panel-dim', 'aria-hidden': 'true', onclick: function () { self.close(); } });
      this.parentNode.insertBefore(this.dim, this);
    }
    this.focus();
  }
  close() {
    if (this.hidden) return;
    this.hidden = true;
    this.undim();
    emit(this, 'sheen-panel-close', {});
    if (this.opener && this.opener.focus) this.opener.focus();
  }
  undim() {
    if (this.dim) { this.dim.remove(); this.dim = null; }
  }
  // Tab from the last control goes to the first, Shift+Tab from the first to the last.
  trap(e) {
    var all = Array.prototype.slice.call(this.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'))
      .filter(function (el) { return !el.disabled && !el.closest('[hidden]'); });
    if (!all.length) return;
    var first = all[0], last = all[all.length - 1], at = document.activeElement;
    if (e.shiftKey && (at === first || at === this)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && at === last) { e.preventDefault(); first.focus(); }
  }
}
define('sheen-side-panel', SheenSidePanel);
