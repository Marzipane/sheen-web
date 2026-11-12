// <sheen-select search="Search areas" empty="No matches" clear="Clear" remove="Remove @label"> (0.8.0): the rest of the select.
//   search: the list opens with a search box at its top, focused, the value as its placeholder and name. Typing hides the
//   options whose label doesn't hold the query (case- and accent-blind, as type-ahead; in Arabic hamza seats and short
//   vowels too), hides a group left with none, makes the first visible option active, and shows the empty line (empty)
//   while nothing is left. Closing empties the query. The box never submits a form, and its own input and change events
//   stay inside the element.
//   clear: a round button in the field while something is chosen: a single select goes to its "" option (or none without
//   one), a multiple one to none. Delete or Backspace on the closed trigger of a single select does the same. Focus stays on
//   the trigger.
//   multiple: one chip per chosen option inside the field, in document order, each with a remove mark (remove, "@label"
//   filled, is its tooltip); Backspace on the closed trigger removes the last one. A chosen disabled option keeps its chip
//   without a mark, and neither clear nor Backspace takes it away, as the list can't either.
//   Every change fires input then change on the native select, as a pick in the list does.
if (typeof SheenSelect === 'function' && typeof selectFold === 'function') (function (P) {
  function enabled(self) { return !self.native.matches(':disabled'); }

  // The chosen options the person can take away: in a multiple select the enabled ones (the list can't change a
  // disabled one either), in a single select the chosen one unless it is the "" option.
  function removable(self) {
    if (!enabled(self)) return [];
    if (!self.native.multiple) {
      var one = self.native.options[self.native.selectedIndex];
      return one && one.value !== '' ? [one] : [];
    }
    return self.items.filter(function (it) { return it.option.selected && !it.disabled; }).map(function (it) { return it.option; });
  }

  // Builds the parts whose attributes are set, once each. setupMore, drawClear and onOpen all call it, so an attribute
  // set after the element was built still gets its part.
  function build(self) {
    if (self.hasAttribute('search') && !self.searchInput) {
      var input = h('input', { type: 'text', class: 'sheen-select-input', role: 'combobox', 'aria-expanded': 'true',
        'aria-autocomplete': 'list', 'aria-controls': self.list.id, autocomplete: 'off', spellcheck: 'false' });
      input.addEventListener('keydown', function (e) {
        // A key that ends a composition (IME) belongs to the input method.
        if (e.isComposing || e.keyCode === 229) return;
        self.onKey(e);
        // A search box inside a form never submits it, even with nothing to pick.
        if (e.key === 'Enter') e.preventDefault();
      });
      // The page listens to the native select; the query's own events stop here.
      input.addEventListener('input', function (e) {
        e.stopPropagation();
        filter(self);
        self.activate(self.visibleItems()[0] || null);
      });
      input.addEventListener('change', function (e) { e.stopPropagation(); });
      self.searchInput = input;
      self.pop.insertBefore(h('div', { class: 'sheen-select-search' }, glyph('search', 15), input), self.list);
      name(self);
    }
    if (self.hasAttribute('empty') && !self.emptyLine) {
      self.emptyLine = h('div', { class: 'sheen-select-empty', text: self.getAttribute('empty') });
      self.emptyLine.hidden = true;
      self.pop.insertBefore(self.emptyLine, self.list.nextSibling);
    }
    if (self.hasAttribute('clear') && !self.clearButton) {
      var b = h('button', { type: 'button', class: 'sheen-select-clear', tabindex: '-1' }, glyph('close', 16));
      b.hidden = true;
      // A press keeps focus where it is; the click then puts it on the trigger.
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function (e) {
        e.preventDefault();
        self.clear();
        self.trigger.focus();
      });
      self.clearButton = b;
      self.insertBefore(b, self.trigger.nextSibling);
    }
  }

  function name(self) {
    var words = self.getAttribute('search') || '';
    self.searchInput.setAttribute('placeholder', words);
    self.searchInput.setAttribute('aria-label', words);
  }

  // Shows the options whose label holds the query, and the groups and the empty line that go with them.
  function filter(self) {
    var q = self.searchInput ? selectFold(self.searchInput.value).trim() : '', any = false;
    self.items.forEach(function (it) {
      it.row.hidden = q !== '' && selectFold(it.label).indexOf(q) < 0;
      if (!it.row.hidden) any = true;
    });
    Array.prototype.forEach.call(self.list.querySelectorAll('.sheen-select-group'), function (g) {
      g.hidden = q !== '' && !g.querySelector('.sheen-select-option:not([hidden])');
    });
    if (self.emptyLine) {
      self.emptyLine.textContent = self.getAttribute('empty') || '';
      self.emptyLine.hidden = q === '' || any || !self.hasAttribute('empty');
    }
  }

  function unchoose(self, options) {
    if (!options.length) return false;
    options.forEach(function (o) { o.selected = false; });
    self.commit();
    return true;
  }

  P.setupMore = function () { build(this); };

  // Clears the choice as the clear button does; false when there was nothing to clear.
  P.clear = function () {
    var gone = removable(this);
    if (!gone.length) return false;
    if (this.native.multiple) return unchoose(this, gone);
    var none = Array.prototype.filter.call(this.native.options, function (o) { return o.value === ''; })[0];
    if (none) none.selected = true;
    else this.native.selectedIndex = -1;
    this.commit();
    return true;
  };

  P.drawChosen = function (into) {
    var self = this, live = enabled(this), words = this.getAttribute('remove');
    var box = h('span', { class: 'sheen-select-chips' });
    this.items.forEach(function (it) {
      if (!it.option.selected) return;
      var mark = null;
      if (live && !it.disabled) {
        mark = h('span', { class: 'sheen-select-chip-remove', 'aria-hidden': 'true', title: words ? fill(words, { label: it.label }) : null }, glyph('close', 14));
        mark.addEventListener('click', function (e) {
          e.preventDefault();
          if (enabled(self) && it.option.selected) unchoose(self, [it.option]);
        });
      }
      box.appendChild(h('span', { class: 'sheen-select-chip', 'data-value': it.value }, h('span', { text: it.label }), mark));
    });
    if (box.firstChild) into.appendChild(box);
  };

  // Called after every redraw. A sync while the list is open and searched (options that arrived late) drew every row
  // again: the query applies to the new rows, and the active option moves off a row it hides.
  P.drawClear = function () {
    build(this);
    if (this.searchInput && this.searchInput.value && this.isOpen()) {
      filter(this);
      var at = this.list.querySelector('.sheen-select-option.sheen-active');
      if (!at || at.hidden || at.closest('.sheen-select-group[hidden]')) this.activate(this.visibleItems()[0] || null);
    }
    var b = this.clearButton;
    if (!b) return;
    b.setAttribute('aria-label', this.getAttribute('clear') || '');
    b.hidden = !this.hasAttribute('clear') || !removable(this).length;
  };

  P.onOpen = function () {
    build(this);
    var input = this.searchInput;
    if (!input) return;
    name(this);
    input.value = '';
    filter(this);
    input.focus();
  };

  P.onClose = function () {
    if (!this.searchInput) return;
    this.searchInput.value = '';
    filter(this);
  };

  P.keyMore = function (e) {
    if (this.isOpen() || e.altKey || e.ctrlKey || e.metaKey) return false;
    var done = false;
    if (this.native.multiple) {
      if (e.key === 'Backspace') done = unchoose(this, removable(this).slice(-1));
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && this.hasAttribute('clear')) {
      done = this.clear();
    }
    if (done) e.preventDefault();
    return done;
  };

  // The core defines the element before this file runs, so a select already in the page was built without these hooks:
  // it gets its parts and its field now.
  Array.prototype.forEach.call(document.querySelectorAll('sheen-select'), function (el) {
    if (el instanceof SheenSelect && el.trigger) { build(el); el.drawField(); }
  });
})(SheenSelect.prototype);
