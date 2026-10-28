// window.sheenElements: the version, the glyphs and a toast shortcut.
//   sheenElements.glyph(name, size?, label?) → <svg>    sheenElements.glyphNames() → [names]
//   sheenElements.toast({title, message, tone, timeout, action}) → id   (uses or adds a <sheen-toaster>)
//   sheenElements.fmtTime(seconds, precise?) → "1:05"
window.sheenElements = {
  version: VERSION,
  glyph: glyph,
  glyphNames: function () { return Object.keys(GLYPHS).sort(); },
  fmtTime: fmtTime,
  toast: function (opts) {
    var t = document.querySelector('sheen-toaster');
    if (!t) { t = document.createElement('sheen-toaster'); document.body.appendChild(t); }
    return t.show(opts);
  }
};
