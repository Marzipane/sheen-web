// <sheen-side-panel label="Booking" close-label="Close"> … </sheen-side-panel>
//   A panel on the end edge (the left in Arabic) with no backdrop, so the page behind keeps its scroll, filters and
//   selection. panel.open() and panel.close(). It takes focus when it opens, and Esc or the close button gives it back
//   to what had focus before the first open(). Children added at any time go into its body, whatever the loading order.
//   Fires "sheen-panel-close".
class SheenSidePanel extends HTMLElement {
  connectedCallback() {
    if (this.body) return;
    var self = this;
    this.body = h('div', { class: 'sheen-panel-body' });
    this.closeButton = h('button', { type: 'button', class: 'sheen-button sheen-small sheen-panel-close', 'aria-label': this.getAttribute('close-label') || '', onclick: function () { self.close(); } }, glyph('close', 18));
    this.adopt();
    this.appendChild(this.closeButton);
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
    });
  }
  adopt() {
    var self = this;
    Array.prototype.slice.call(this.childNodes).forEach(function (n) {
      if (n !== self.closeButton && n !== self.body) self.body.appendChild(n);
    });
  }
  static get observedAttributes() { return ['label', 'close-label']; }
  attributeChangedCallback(name, was, now) {
    if (name === 'label') this.setAttribute('aria-label', now || '');
    else if (this.closeButton) this.closeButton.setAttribute('aria-label', now || '');
  }
  open() {
    // Opened again from inside (a next-record button), it keeps the first opener.
    if (this.hidden) this.opener = document.activeElement;
    this.hidden = false;
    this.focus();
  }
  close() {
    if (this.hidden) return;
    this.hidden = true;
    emit(this, 'sheen-panel-close', {});
    if (this.opener && this.opener.focus) this.opener.focus();
  }
}
define('sheen-side-panel', SheenSidePanel);
