// window.sheenElements: the version, the glyphs and a toast shortcut.
//   sheenElements.glyph(name, size?, label?) → <svg>    sheenElements.glyphNames() → [names]
//   sheenElements.toast({title, message, tone, timeout, action}) → id   (uses or adds a <sheen-toaster>)
//   sheenElements.fmtTime(seconds, precise?) → "1:05"
//   sheenElements.paintRange(input) sets --sheen-range-fill from the value; every <input class="sheen-range"> on the
//   page is painted this way on its own (when added and on each input), so the filled part follows the thumb.
function paintRange(r) {
  var min = parseFloat(r.min), max = parseFloat(r.max), v = parseFloat(r.value);
  if (isNaN(min)) min = 0;
  if (isNaN(max)) max = 100;
  r.style.setProperty('--sheen-range-fill', (max > min ? Math.round(clamp((v - min) / (max - min), 0, 1) * 10000) / 100 : 0) + '%');
}
function paintRangesIn(root) {
  if (root.nodeType !== 1) return;
  if (root.matches('input.sheen-range')) paintRange(root);
  Array.prototype.forEach.call(root.querySelectorAll('input.sheen-range'), paintRange);
}
document.addEventListener('input', function (e) { if (e.target.matches && e.target.matches('input.sheen-range')) paintRange(e.target); }, true);
if (window.MutationObserver) {
  new MutationObserver(function (list) {
    list.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, paintRangesIn); });
  }).observe(document.documentElement, { childList: true, subtree: true });
}
if (document.body) paintRangesIn(document.body);

window.sheenElements = {
  version: VERSION,
  glyph: glyph,
  glyphNames: function () { return Object.keys(GLYPHS).sort(); },
  fmtTime: fmtTime,
  paintRange: paintRange,
  toast: function (opts) {
    var t = document.querySelector('sheen-toaster');
    if (!t) { t = document.createElement('sheen-toaster'); document.body.appendChild(t); }
    return t.show(opts);
  }
};
