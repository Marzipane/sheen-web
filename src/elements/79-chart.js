// <sheen-chart kind="line" label="Rating by week" unit="%" height="160" highlight="4" limit="90" limit-label="Limit 90%">
//   (0.11.0) A small bar or line chart in SVG and CSS, as the app mockups draw a report card's chart: the value over each
//   bar or point, the labels under them, an optional highlighted bar, an optional dashed limit line with its words.
//   chart.points = [{label, value, text}]: value is a number from 0 up, or null for a gap (no bar, a break in the line);
//   text, when given, is the value as the page writes it, else the value in the nearest lang's digits followed by unit.
//   kind: "bar" (the default) or "line". highlight: the index of the bar that stands out, the others dimmed. limit: a
//   value drawn as a dashed line, with limit-label as its words (else the limit's value and unit). height: the chart's
//   height in px, else --sheen-chart-height, else the size token (180). label: the chart's name for screen readers.
//   The shapes are SVG stretched to the width; every word is HTML on top, so no text stretches. Screen readers skip the
//   drawing and read a table of the labels and values. In Arabic the chart runs from the right. Every word comes from
//   the page; the element writes none of its own.
var CHART_W = 600;        // the viewBox width; the drawing stretches to the element's width
var CHART_BELOW = 18;     // the band under the axis that holds the labels
var CHART_ABOVE = 12;     // the room over the highest value, for its words
var CHART_HEADROOM = 1.15; // the scale runs 15% past the highest value (or the limit)

class SheenChart extends HTMLElement {
  static get observedAttributes() { return ['kind', 'label', 'unit', 'height', 'highlight', 'limit', 'limit-label', 'lang']; }
  connectedCallback() {
    // A property a framework set before this element was defined sits on the instance and hides the accessor: set it again.
    if (Object.prototype.hasOwnProperty.call(this, 'points')) { var v = this.points; delete this.points; this.points = v; }
    this.render();
  }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  get points() { return this._points || []; }
  set points(v) {
    this._points = Array.isArray(v) ? v.filter(function (p) { return p && typeof p === 'object'; }) : [];
    if (this.isConnected) this.render();
  }
  // The chart's height in px: the attribute, else the page's --sheen-chart-height, else the size token.
  height() {
    var n = parseFloat(this.getAttribute('height'));
    if (n > 0) return n;
    n = parseFloat(cssVar(this, '--sheen-chart-height', '')) || parseFloat(cssVar(this, '--sheen-size-chart', ''));
    return n > 0 ? n : 180;
  }
  // A point's value as a number, or null for a gap; below 0 counts as 0.
  amount(p) {
    var v = p.value;
    return typeof v === 'number' && isFinite(v) ? Math.max(0, v) : null;
  }
  words(v, text) {
    if (text != null && text !== '') return String(text);
    if (v == null) return '';
    var nf;
    try { nf = new Intl.NumberFormat(nearestLang(this)); } catch (e) { nf = new Intl.NumberFormat(); }
    return nf.format(v) + (this.getAttribute('unit') || '');
  }
  render() {
    var self = this, pts = this.points, n = pts.length, H = this.height(), bar = this.getAttribute('kind') !== 'line';
    var values = pts.map(function (p) { return self.amount(p); });
    var limit = parseFloat(this.getAttribute('limit'));
    if (!(limit >= 0)) limit = null;
    var hi = parseInt(this.getAttribute('highlight'), 10);
    if (!(hi >= 0 && hi < n)) hi = null;
    var top0 = Math.max.apply(null, values.concat([limit || 0]).map(function (v) { return v || 0; }));
    var max = top0 > 0 ? top0 * CHART_HEADROOM : 1, base = H - CHART_BELOW, room = H - CHART_BELOW - CHART_ABOVE;
    var y = function (v) { return base - (v / max) * room; };
    var x = function (i) { return (i + 0.5) / n * 100; };
    var px = function (v) { return v.toFixed(1) + 'px'; };
    var at = function (cls, i, top, text) {
      var s = h('span', { class: 'sheen-chart-at ' + cls, text: text });
      s.style.setProperty('--sheen-chart-x', x(i).toFixed(2) + '%');
      s.style.top = px(top);
      return s;
    };

    this.classList.add('sheen-chart');
    this.style.setProperty('--sheen-chart-height', H + 'px');
    var svg = svgEl('svg', { viewBox: '0 0 ' + CHART_W + ' ' + H, preserveAspectRatio: 'none', focusable: 'false' });
    svg.appendChild(svgEl('line', { class: 'sheen-chart-axis', x1: 0, x2: CHART_W, y1: base, y2: base }));
    if (limit != null) svg.appendChild(svgEl('line', { class: 'sheen-chart-limit', x1: 0, x2: CHART_W, y1: y(limit), y2: y(limit) }));
    var plot = h('div', { class: 'sheen-chart-plot', 'aria-hidden': 'true' }, svg);
    if (bar) {
      values.forEach(function (v, i) {
        if (v == null) return;
        var b = h('span', { class: 'sheen-chart-bar' + (hi != null && hi !== i ? ' sheen-chart-dim' : '') });
        b.style.setProperty('--sheen-chart-x', ((i + 0.2) / n * 100).toFixed(2) + '%');
        b.style.setProperty('--sheen-chart-w', (0.6 / n * 100).toFixed(2) + '%');
        b.style.top = px(y(v));
        b.style.height = px(base - y(v));
        plot.appendChild(b);
      });
    } else {
      // Each run of points without a gap is one line over its own shaded area.
      var runs = [], run = [];
      values.forEach(function (v, i) {
        if (v == null) { if (run.length) runs.push(run); run = []; return; }
        run.push([(i + 0.5) * CHART_W / n, y(v)]);
      });
      if (run.length) runs.push(run);
      runs.forEach(function (r) {
        var line = r.map(function (p) { return p[0] + ' ' + p[1]; }).join(' L ');
        svg.appendChild(svgEl('path', { class: 'sheen-chart-area', d: 'M ' + r[0][0] + ' ' + base + ' L ' + line + ' L ' + r[r.length - 1][0] + ' ' + base + ' Z' }));
        svg.appendChild(svgEl('path', { class: 'sheen-chart-line', d: 'M ' + line }));
      });
    }
    var shown = pts.map(function (p, i) { return self.words(values[i], p.text); });
    values.forEach(function (v, i) { if (v != null && shown[i]) plot.appendChild(at('sheen-chart-value', i, y(v) - 17, shown[i])); });
    pts.forEach(function (p, i) { if (p.label != null && p.label !== '') plot.appendChild(at('sheen-chart-label', i, H - 15, String(p.label))); });
    var limitWords = limit == null ? '' : this.getAttribute('limit-label') || this.words(limit);
    if (limitWords) {
      var lim = h('span', { class: 'sheen-chart-limit-label', text: limitWords });
      lim.style.top = px(y(limit) - 16);
      plot.appendChild(lim);
    }

    // What screen readers read: a table of the labels and values, the highlighted row current, then the limit.
    var label = this.getAttribute('label');
    var table = h('table', { class: 'sheen-visually-hidden' }, label ? h('caption', { text: label }) : null,
      h('tbody', null, ...pts.map(function (p, i) {
        return h('tr', { 'aria-current': hi === i ? 'true' : null }, h('th', { scope: 'row', text: p.label == null ? '' : String(p.label) }), h('td', { text: shown[i] }));
      })));
    if (limitWords) this.replaceChildren(plot, table, h('p', { class: 'sheen-visually-hidden', text: limitWords }));
    else this.replaceChildren(plot, table);
  }
}
define('sheen-chart', SheenChart);
