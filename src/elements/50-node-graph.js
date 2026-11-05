// <sheen-node-graph label="Pipeline" connect-label="Connect from @name: choose a node and press Enter"
//                   connected-label="Connected @from to @to" remove-label="Remove">
//   A small node-graph canvas. graph.nodes = [{id, label, sub, glyph, x, y}] (x, y in px from the inline start and the
//   top), graph.edges = [{from, to}]. Drag a node to move it; drag from its out-port (inline end) to another node to
//   connect them. Each node is a button, so the keyboard works too: ← → ↑ ↓ move the focused node (Shift: farther),
//   C starts a connection from it (then Tab to the target and press Enter; Esc cancels), Delete removes it.
//   A focused edge (Tab reaches them after the nodes) is removed with Delete.
//   Every change fires "sheen-graphchange" {nodes, edges}; "sheen-nodeopen" {node} on double-click.
class SheenNodeGraph extends HTMLElement {
  connectedCallback() {
    if (this.svg) return;
    var self = this;
    this._nodes = this._nodes || []; this._edges = this._edges || [];
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'sheen-graph-edges');
    this.layer = h('div', { class: 'sheen-graph-nodes' });
    this.live = h('div', { class: 'sheen-visually-hidden', 'aria-live': 'polite' });
    this.replaceChildren(this.svg, this.layer, this.live);
    this.setAttribute('role', 'group');
    if (this.getAttribute('label')) this.setAttribute('aria-label', this.getAttribute('label'));
    this.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && self.connecting) { self.connecting = null; self.classList.remove('sheen-connecting'); self.say(''); }
    });
    this.render();
  }
  get nodes() { return this._nodes || []; }
  set nodes(v) { this._nodes = Array.isArray(v) ? v : []; if (this.svg) this.render(); }
  get edges() { return this._edges || []; }
  set edges(v) { this._edges = Array.isArray(v) ? v : []; if (this.svg) this.render(); }
  say(t) { this.live.textContent = t; }
  changed() { emit(this, 'sheen-graphchange', { nodes: this.nodes, edges: this.edges }); }
  node(id) { return this.nodes.filter(function (n) { return n.id === id; })[0]; }
  connect(from, to) {
    if (!from || !to || from === to) return false;
    if (this.edges.some(function (e) { return e.from === from && e.to === to; })) return false;
    // a pipeline node has one way in and one way out: a new edge replaces the old ones at both ends
    this._edges = this.edges.filter(function (e) { return e.from !== from && e.to !== to; });
    this._edges.push({ from: from, to: to });
    this.render();
    this.say(fill(this.getAttribute('connected-label'), { from: this.node(from).label, to: this.node(to).label }));
    this.changed();
    return true;
  }
  remove(id) {
    this._nodes = this.nodes.filter(function (n) { return n.id !== id; });
    this._edges = this.edges.filter(function (e) { return e.from !== id && e.to !== id; });
    this.render();
    this.changed();
  }
  render() {
    var self = this;
    this.layer.replaceChildren.apply(this.layer, this.nodes.map(function (n) { return self.nodeEl(n); }));
    this.drawEdges();
  }
  nodeEl(n) {
    var self = this;
    var el = h('button', { type: 'button', class: 'sheen-graph-node sheen-glass', 'data-node': n.id,
        style: 'inset-inline-start:' + (n.x || 0) + 'px;inset-block-start:' + (n.y || 0) + 'px' },
      h('span', { class: 'sheen-graph-port sheen-graph-in', 'aria-hidden': 'true' }),
      n.glyph ? glyph(n.glyph, 20) : null,
      h('span', { class: 'sheen-graph-text' }, h('b', { class: 'sheen-ellipsis', text: n.label || '' }),
        n.sub ? h('small', { class: 'sheen-secondary sheen-ellipsis', text: n.sub }) : null),
      h('span', { class: 'sheen-graph-port sheen-graph-out', 'data-port': 'out', 'aria-hidden': 'true' }));
    el.addEventListener('dblclick', function () { emit(self, 'sheen-nodeopen', { node: n }); });
    el.addEventListener('pointerdown', function (e) {
      var port = e.target.getAttribute('data-port') === 'out', x0 = e.clientX, y0 = e.clientY, nx = n.x || 0, ny = n.y || 0;
      var dir = isRtl(self) ? -1 : 1, moved = false, ghost = null;
      e.preventDefault();
      el.focus();
      var move = function (ev) {
        moved = true;
        if (port) {
          if (!ghost) { ghost = document.createElementNS('http://www.w3.org/2000/svg', 'path'); ghost.setAttribute('class', 'sheen-graph-ghost'); self.svg.appendChild(ghost); }
          var r = self.getBoundingClientRect(), a = self.portPoint(n, 'out');
          var bx = isRtl(self) ? r.right - ev.clientX : ev.clientX - r.left;
          ghost.setAttribute('d', self.curve(a.x, a.y, bx, ev.clientY - r.top));
        } else {
          n.x = Math.max(0, nx + (ev.clientX - x0) * dir); n.y = Math.max(0, ny + ev.clientY - y0);
          el.style.insetInlineStart = n.x + 'px'; el.style.insetBlockStart = n.y + 'px';
          self.drawEdges();
        }
      };
      var up = function (ev) {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        if (ghost) ghost.remove();
        if (port) {
          var target = document.elementFromPoint ? document.elementFromPoint(ev.clientX, ev.clientY) : null;
          var t = target && target.closest ? target.closest('[data-node]') : null;
          if (t) self.connect(n.id, t.getAttribute('data-node'));
        } else if (moved) self.changed();
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });
    el.addEventListener('keydown', function (e) {
      var big = e.shiftKey ? 40 : 10, dir = isRtl(self) ? -1 : 1, dx = 0, dy = 0;
      if (e.key === 'ArrowLeft') dx = -big * dir; else if (e.key === 'ArrowRight') dx = big * dir;
      else if (e.key === 'ArrowUp') dy = -big; else if (e.key === 'ArrowDown') dy = big;
      if (dx || dy) {
        e.preventDefault();
        n.x = Math.max(0, (n.x || 0) + dx); n.y = Math.max(0, (n.y || 0) + dy);
        el.style.insetInlineStart = n.x + 'px'; el.style.insetBlockStart = n.y + 'px';
        self.drawEdges(); self.changed();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        self.connecting = n.id; self.classList.add('sheen-connecting');
        self.say(fill(self.getAttribute('connect-label'), { name: n.label }));
      } else if (e.key === 'Enter' && self.connecting && self.connecting !== n.id) {
        e.preventDefault();
        var from = self.connecting; self.connecting = null; self.classList.remove('sheen-connecting');
        self.connect(from, n.id);
        self.focusNode(n.id);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        self.remove(n.id);
      }
    });
    return el;
  }
  focusNode(id) { var el = this.querySelector('[data-node="' + id + '"]'); if (el) el.focus(); }
  size(n) {
    var el = this.querySelector('[data-node="' + n.id + '"]');
    return { w: (el && el.offsetWidth) || 180, h: (el && el.offsetHeight) || 56 };
  }
  portPoint(n, which) {
    var s = this.size(n);
    return { x: (n.x || 0) + (which === 'out' ? s.w : 0), y: (n.y || 0) + s.h / 2 };
  }
  curve(ax, ay, bx, by) {
    var c = Math.max(40, Math.abs(bx - ax) / 2);
    return 'M' + ax + ',' + ay + ' C' + (ax + c) + ',' + ay + ' ' + (bx - c) + ',' + by + ' ' + bx + ',' + by;
  }
  drawEdges() {
    var self = this, w = 0, hh = 0;
    this.nodes.forEach(function (n) { var s = self.size(n); w = Math.max(w, (n.x || 0) + s.w + 60); hh = Math.max(hh, (n.y || 0) + s.h + 40); });
    this.svg.setAttribute('width', String(w)); this.svg.setAttribute('height', String(hh));
    this.layer.style.minBlockSize = hh + 'px';
    this.layer.style.minInlineSize = w + 'px';
    var paths = this.edges.map(function (e) {
      var a = self.node(e.from), b = self.node(e.to);
      if (!a || !b) return null;
      var p1 = self.portPoint(a, 'out'), p2 = self.portPoint(b, 'in');
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', self.curve(p1.x, p1.y, p2.x, p2.y));
      path.setAttribute('class', 'sheen-graph-edge');
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'button');
      path.setAttribute('aria-label', (a.label || '') + ' → ' + (b.label || '') + (self.getAttribute('remove-label') ? ' (' + self.getAttribute('remove-label') + ')' : ''));
      path.addEventListener('keydown', function (ev) {
        if (ev.key === 'Delete' || ev.key === 'Backspace') {
          ev.preventDefault();
          self._edges = self.edges.filter(function (x) { return x !== e; });
          self.drawEdges(); self.changed();
        }
      });
      return path;
    }).filter(Boolean);
    this.svg.replaceChildren.apply(this.svg, paths);
  }
  // the nodes in pipeline order: follow the edges from the node nothing points to (unlinked nodes go last, by x)
  order() {
    var edges = this.edges, next = {}, hasIn = {};
    edges.forEach(function (e) { next[e.from] = e.to; hasIn[e.to] = true; });
    var seen = {}, out = [];
    var starts = this.nodes.filter(function (n) { return !hasIn[n.id]; }).sort(function (a, b) { return (a.x || 0) - (b.x || 0); });
    starts.forEach(function (s) { for (var id = s.id; id && !seen[id]; id = next[id]) { seen[id] = true; out.push(id); } });
    this.nodes.forEach(function (n) { if (!seen[n.id]) out.push(n.id); });
    return out;
  }
}
define('sheen-node-graph', SheenNodeGraph);
