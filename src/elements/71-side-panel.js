// <sheen-side-panel label="Booking" close-label="Close"> … </sheen-side-panel>
//   A panel on the end edge (the left in Arabic) with no backdrop, so the page behind keeps its scroll, filters and
//   selection. panel.open() and panel.close(). It takes focus when it opens, and Esc or the close button gives it back.
//   Fires "sheen-panel-close".
class SheenSidePanel extends HTMLElement {
  connectedCallback() {
    if (this.body) return;
    var self = this;
    this.body = h('div', { class: 'sheen-panel-body' });
    while (this.firstChild) this.body.appendChild(this.firstChild);
    this.closeButton = h('button', { type: 'button', class: 'sheen-button sheen-small sheen-panel-close', 'aria-label': this.getAttribute('close-label') || '', onclick: function () { self.close(); } }, glyph('close', 18));
    this.appendChild(this.closeButton);
    this.appendChild(this.body);
    this.classList.add('sheen-glass');
    this.setAttribute('role', 'dialog');
    this.setAttribute('aria-modal', 'false');
    this.setAttribute('aria-label', this.getAttribute('label') || '');
    this.tabIndex = -1;
    this.hidden = true;
    this.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); self.close(); }
    });
  }
  static get observedAttributes() { return ['label', 'close-label']; }
  attributeChangedCallback(name, was, now) {
    if (name === 'label') this.setAttribute('aria-label', now || '');
    else if (this.closeButton) this.closeButton.setAttribute('aria-label', now || '');
  }
  open() {
    this.opener = document.activeElement;
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
