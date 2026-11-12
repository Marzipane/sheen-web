// <sheen-avatar name="Maria Santos" size="s" letters="1" tint-key="p-1024" image="/photos/a.jpg" label="Maria Santos">
//   (0.8.0) A person's initials in a circle, as Flutter sheen's SheenAvatar. It shows the image once it loads, else the
//   initials (the first letter of the first two words of name; letters sets how many words) on the tint the key picks,
//   else the filled user glyph. The key is tint-key when set (a record's ID keeps the colour when the name changes),
//   else the name. size: "s" or "xs" (the stylesheet maps them to the size tokens); 40 without. With label it is an
//   image with that name; without, screen readers skip it (the name sits beside it). It follows later changes to every
//   attribute.

// "Maria Santos" → "MS": the first code point of each of the first n words, in capitals.
function avatarInitials(name, n) {
  return name.split(/\s+/).filter(Boolean).slice(0, n)
    .map(function (w) { return String.fromCodePoint(w.codePointAt(0)).toUpperCase(); }).join('');
}

// FNV-1a (32 bits) over the UTF-16 code units of the trimmed, lower-cased key picks one of TINTS, as Flutter sheen's
// SheenAvatar.tintOf, so a person gets the same colour in the app and on the web.
function avatarTint(key) {
  var s = key.trim().toLowerCase(), h = 0x811c9dc5;
  for (var i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return TINTS[h % TINTS.length];
}

class SheenAvatar extends HTMLElement {
  static get observedAttributes() { return ['name', 'letters', 'tint-key', 'image', 'label']; }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  render() {
    var self = this, name = (this.getAttribute('name') || '').trim(), key = (this.getAttribute('tint-key') || '').trim();
    var letters = parseInt(this.getAttribute('letters'), 10), label = this.getAttribute('label'), src = this.getAttribute('image') || '';
    this.classList.add('sheen-avatar');
    if (name) this.setAttribute('data-tint', avatarTint(key || name)); else this.removeAttribute('data-tint');
    if (label) {
      this.setAttribute('role', 'img');
      this.setAttribute('aria-label', label);
      this.removeAttribute('aria-hidden');
    } else {
      this.removeAttribute('role');
      this.removeAttribute('aria-label');
      this.setAttribute('aria-hidden', 'true');
    }
    // The photo stays hidden until it loads, so the initials show meanwhile. One that fails is dropped and not asked for
    // again; a photo that stays the same is kept, so a change of name doesn't load it again.
    if (!src || src === this.failed) this.photo = null;
    else if (!this.photo || this.photo.getAttribute('src') !== src) {
      var img = h('img', { alt: '' });
      img.hidden = true;
      img.addEventListener('load', function () { img.hidden = false; });
      img.addEventListener('error', function () {
        self.failed = img.getAttribute('src');
        img.remove();
        if (self.photo === img) self.photo = null;
      });
      img.setAttribute('src', src);
      this.photo = img;
    }
    var face = name ? h('span', { text: avatarInitials(name, letters > 0 ? letters : 2) }) : glyph('user-fill', 22);
    if (this.photo) this.replaceChildren(face, this.photo); else this.replaceChildren(face);
  }
}
define('sheen-avatar', SheenAvatar);
