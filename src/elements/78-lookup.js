// <sheen-lookup name="area" placeholder="Any area" search="Search areas" loading="Searching…" empty="No matches"
//   error="Couldn't load the areas" retry="Try again" more="@count of @total shown. Type to narrow" clear="Clear"> (0.9.0)
//   A select whose options the page brings, one answer per query, for lists too long to load whole (a search through an
//   API over 10 000 rows). It is <sheen-select> (75-select.js, 76-select-more.js) with the same field, list, keys, ARIA,
//   chips, clear button, looks and native select (the form value); only where the options come from differs.
//   The list always opens with a search box. Opening asks for "" at once; typing asks for the trimmed query once the
//   person stops typing for delay ms (250 by default), and never while an input method composes. Each ask fires
//   sheen-lookup-query {query, signal, respond} on the element. Call respond(answer) with the options
//   [{value, label, disabled, hint, group}], with {options, total} (total: how many match in all), or with a promise of
//   either, and pass signal to fetch(). A newer ask, closing the list or leaving the page aborts the signal, and the
//   answer to an older ask is dropped, so a slow reply never overwrites a newer one. A promise that rejects shows the
//   error line, unless its signal was aborted. el.options = [...] is the answer to the current ask, without respond.
//   Every ask needs an answer: until one comes the spinner turns and Enter picks nothing, so a page that skips a query
//   (one too short to send) answers it with [] or with what it already has.
//   While an ask is out, a spinner takes the search glyph's place and the listbox is aria-busy; the rows of the last
//   answer stay, and Enter picks nothing until the new ones arrive. One status line (role=status) under the rows says what
//   there is: loading while no rows are drawn yet, empty for an answer with none, error with a retry button (retry;
//   Enter in the search box does the same), more ("@count" rows, "@total" in all, written for the nearest lang) when
//   the answer holds fewer than total.
//   A state whose attribute is missing leaves the line quiet.
//   Chosen options stay chosen when an answer lacks them: they stay in the native select, hidden from the list, and keep
//   their label in the field or their chip. Chips follow the order the options were chosen in. el.chosen reads
//   [{value, label}] and sets the choice with its labels (an edit form's stored value, which no answer has brought yet),
//   without events, as value and values do; value and values reach only options the select holds. In the markup, the
//   chosen options are the starting choice and the others go. A single lookup keeps a hidden "" option first, so
//   nothing chosen is the value "" and required works as on a select with a placeholder option.
if (typeof SheenSelect === 'function' && typeof SheenSelect.prototype.buildSearch === 'function') (function () {
  var LOOKUP_DELAY = 250;

  // The entries of an answer or a choice, by their value as text: a value twice keeps its first entry, and "" (nothing
  // chosen) is no entry.
  function lookupEntries(list) {
    var seen = Object.create(null);
    return (Array.isArray(list) ? list : []).filter(function (e) {
      if (!e) return false;
      var v = e.value == null ? '' : String(e.value);
      if (v === '' || seen[v]) return false;
      seen[v] = true;
      return true;
    });
  }

  class SheenLookup extends SheenSelect {
    connectedCallback() {
      // A choice a framework set before this element was defined sits on the instance: set it again.
      if (Object.prototype.hasOwnProperty.call(this, 'chosen')) {
        var v = this.chosen;
        delete this.chosen;
        this.chosen = v;
      }
      super.connectedCallback();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.halt();
    }

    attributeChangedCallback(name) {
      super.attributeChangedCallback(name);
      // A select this element made turned single or multiple: the "" option comes or goes.
      if (name === 'multiple' && this.made && this.trigger) this.show(this.lastList || []);
    }

    // The select's frame, then the markup's options settled (the chosen ones stay, kept) and a choice set before the build.
    build() {
      super.build();
      if (!this._options) this.place(null);
      var chosen = this._chosen;
      this._chosen = null;
      if (chosen) this.chosen = chosen;
      if (this.watcher) this.watcher.takeRecords();
      this.sync();
    }

    // Options set before the build: the answer to the first ask.
    writeOptions() { this.place(this._options); }

    set options(list) {
      this._options = Array.isArray(list) ? list : [];
      if (this.trigger) this.answered(this._options);
    }

    get chosen() {
      if (!this.trigger) return (this._chosen || []).map(function (c) { return { value: String(c.value), label: c.label == null ? '' : String(c.label) }; });
      return this.chosenOptions().map(function (o) { return { value: o.value, label: o.label }; });
    }

    // Chooses exactly these entries, with their labels, drawn at once and without events.
    set chosen(list) {
      var want = lookupEntries(Array.isArray(list) ? list : list ? [list] : []);
      if (!this.trigger) { this._chosen = want; return; }
      var n = this.native, all = Object.create(null);
      if (!n.multiple) want = want.slice(0, 1);
      Array.prototype.forEach.call(n.options, function (o) {
        if (!o.hasAttribute('data-none') && !(o.value in all)) all[o.value] = o;
      });
      this.order = want.map(function (c) {
        var value = String(c.value), o = all[value];
        if (!o) {
          o = h('option', { value: value, 'data-kept': '' });
          o.hidden = true;
          n.appendChild(o);
        }
        if (c.label != null) o.textContent = String(c.label);
        return value;
      });
      this.restore(this.order);
      if (this.watcher) this.watcher.takeRecords();
      this.sync();
    }

    // The chosen options, the "" option of a single lookup left out, in the order they were chosen: those chosen before
    // in their order, then the new ones in the list's order.
    chosenOptions() {
      var n = this.native, was = this.order || [];
      var sel = this.picked().filter(function (o) { return !o.hasAttribute('data-none') && (n.multiple || o.value !== ''); });
      var values = sel.map(function (o) { return o.value; });
      this.order = was.filter(function (v) { return values.indexOf(v) >= 0; })
        .concat(values.filter(function (v, i) { return was.indexOf(v) < 0 && values.indexOf(v) === i; }));
      return this.order.map(function (v) { return sel[values.indexOf(v)]; });
    }

    // The chips: every chosen option, those no answer holds now too, in the order they were chosen.
    chipItems() {
      var items = this.items;
      return this.chosenOptions().map(function (o) {
        var g = o.parentElement;
        return items.filter(function (i) { return i.option === o; })[0] ||
          { option: o, value: o.value, label: o.label, disabled: o.disabled || !!(g && g.tagName === 'OPTGROUP' && g.disabled) };
      });
    }

    // The "" option of a single lookup: hidden, without words (the placeholder shows), first.
    noneOption() {
      var n = this.native, none = this.none && this.none.parentNode === n ? this.none : n.querySelector('option[data-none]');
      if (!none) none = Array.prototype.filter.call(n.options, function (o) { return o.value === ''; })[0] || null;
      if (!none) none = h('option', { value: '' });
      none.setAttribute('data-none', '');
      none.hidden = true;
      none.textContent = '';
      this.none = none;
      return none;
    }

    // Writes an answer into the native select: the "" option of a single lookup, then one option per entry (inside one
    // <optgroup label> per group, in the order the groups first appear), then the chosen options the answer lacks,
    // hidden and kept. A chosen option the answer holds keeps its node and takes the answer's words. null: no answer.
    place(list) {
      var n = this.native, chosen = this.chosenOptions(), keep = chosen.map(function (o) { return o.value; });
      var nodes = n.multiple ? [] : [this.noneOption()], groups = Object.create(null), used = Object.create(null), byValue = Object.create(null);
      chosen.forEach(function (o) { byValue[o.value] = o; });
      lookupEntries(list).forEach(function (e) {
        var value = String(e.value), o = byValue[value] || h('option', { value: value });
        used[value] = true;
        o.textContent = e.label == null ? '' : String(e.label);
        o.disabled = !!e.disabled;
        selectPut(o, 'data-hint', e.hint ? String(e.hint) : null);
        o.hidden = false;
        o.removeAttribute('data-kept');
        if (e.group == null || e.group === '') { nodes.push(o); return; }
        if (!groups[e.group]) nodes.push(groups[e.group] = h('optgroup', { label: String(e.group) }));
        groups[e.group].appendChild(o);
      });
      chosen.forEach(function (o) {
        if (used[o.value]) return;
        o.hidden = true;
        o.setAttribute('data-kept', '');
        nodes.push(o);
      });
      n.replaceChildren.apply(n, nodes);
      this.restore(keep);
    }

    // Chooses exactly these values through the browser's own accessors; a single lookup with none goes to its "" option.
    restore(values) {
      var n = this.native;
      if (n.multiple || values.length) this.choose(values);
      else selectRaw(n, 'selectedIndex', this.none && this.none.parentNode === n ? this.none.index : -1);
    }

    // Writes the rows and draws them; while open, the active option stays where it still is, else goes to the chosen one
    // of a single lookup, else to the first.
    show(list) {
      var was = this.active && this.active.option;
      this.place(list);
      if (this.watcher) this.watcher.takeRecords();
      this.sync();
      if (this.isOpen()) {
        var reach = this.visibleItems(), multiple = this.native.multiple;
        this.activate(reach.filter(function (i) { return i.option === was; })[0] ||
          (multiple ? null : reach.filter(function (i) { return i.option.selected; })[0]) || reach[0] || null);
      }
      this.status();
    }

    delay() {
      var d = parseFloat(this.getAttribute('delay'));
      return isFinite(d) && d >= 0 ? d : LOOKUP_DELAY;
    }

    // Asks the page for the options that match the query, now.
    ask(query) {
      var self = this, once = false;
      clearTimeout(this.timer);
      this.timer = null;
      if (this.ctrl) this.ctrl.abort();
      var ctrl = this.ctrl = window.AbortController ? new AbortController() : null;
      var ticket = this.ticket = (this.ticket || 0) + 1;
      this.asked = query;
      this.waiting = true;
      this.failed = false;
      this.status();
      emit(this, 'sheen-lookup-query', { query: query, signal: ctrl ? ctrl.signal : null, respond: function (answer) {
        if (once) return;
        once = true;
        var live = function () { return ticket === self.ticket && !(ctrl && ctrl.signal.aborted); };
        Promise.resolve(answer).then(function (a) { if (live()) self.answered(a); }, function () { if (live()) self.fail(); });
      } });
    }

    answered(a) {
      var list = Array.isArray(a) ? a : a && Array.isArray(a.options) ? a.options : [];
      var total = !Array.isArray(a) && a && a.total != null && isFinite(Number(a.total)) ? Number(a.total) : null;
      this.waiting = false;
      this.failed = false;
      this.answer = { total: total };
      this.lastList = list;
      this.show(list);
    }

    fail() {
      this.waiting = false;
      this.failed = true;
      this.answer = null;
      this.lastList = [];
      this.show([]);
    }

    retry() { this.ask(this.searchInput ? this.searchInput.value.trim() : ''); }

    // Stops the ask that is out and the one waiting for the typing to pause; an answer still on its way is dropped.
    halt() {
      clearTimeout(this.timer);
      this.timer = null;
      if (this.ctrl) this.ctrl.abort();
      this.ctrl = null;
      this.ticket = (this.ticket || 0) + 1;
      this.waiting = false;
    }

    // The search box is always there; the rows are the page's answer, so the query hides none of them.
    hasSearch() { return true; }
    filter() {}

    // The typing: an ask once the person pauses; back to the query asked last, nothing new.
    searched(e) {
      if ((e && e.isComposing) || this.composing) return;
      var self = this, q = this.searchInput.value.trim();
      clearTimeout(this.timer);
      this.timer = null;
      if (q !== this.asked || this.failed) this.timer = setTimeout(function () { self.ask(q); }, this.delay());
      this.status();
    }

    // The select's parts, and the lookup's own: the spinner beside the search glyph, the status line under the rows.
    buildMore() {
      var self = this;
      if (!this.searchInput) {
        this.buildSearch();
        var input = this.searchInput;
        this.searchGlyph = input.previousElementSibling;
        this.spin = glyph('refresh', 15);
        this.spin.classList.add('sheen-lookup-spin');
        this.spin.setAttribute('hidden', '');
        input.parentElement.insertBefore(this.spin, input);
        input.addEventListener('compositionstart', function () { self.composing = true; });
        input.addEventListener('compositionend', function () { self.composing = false; self.searched(); });
      }
      if (!this.statusLine) {
        this.statusWords = h('span', { class: 'sheen-lookup-words' });
        this.retryButton = h('button', { type: 'button', class: 'sheen-link-button sheen-lookup-retry', tabindex: '-1' });
        this.retryButton.hidden = true;
        this.retryButton.addEventListener('click', function (e) { e.preventDefault(); self.retry(); });
        this.statusLine = h('div', { class: 'sheen-lookup-status', role: 'status', 'aria-live': 'polite', 'data-quiet': '' }, this.statusWords, this.retryButton);
        this.pop.insertBefore(this.statusLine, this.list.nextSibling);
      }
      if (this.hasAttribute('clear') && !this.clearButton) this.buildClear();
      this.nameSearch();
    }

    // The search box's name: its search words, else the field's own name.
    nameSearch() {
      var input = this.searchInput;
      if (!input) return;
      var own = this.hasAttribute('search');
      selectPut(input, 'aria-labelledby', own ? null : this.trigger.getAttribute('aria-labelledby'));
      selectPut(input, 'aria-label', own ? this.getAttribute('search') : this.trigger.getAttribute('aria-label'));
    }

    name() {
      super.name();
      this.nameSearch();
    }

    drawClear() {
      super.drawClear();
      this.status();
    }

    onOpen() {
      super.onOpen();
      this.nameSearch();
      this.ask('');
    }

    // Closing stops every ask and drops the rows; the choice stays.
    onClose() {
      super.onClose();
      this.halt();
      this.asked = null;
      this.answer = null;
      this.failed = false;
      this.lastList = [];
      this.show([]);
    }

    // Enter and Alt+Up pick nothing while an ask is out (the rows are an older answer's); after an error Enter asks again.
    // Alt+Up picks only in a single list with an active option; anywhere else it closes, as the select's does.
    onKey(e) {
      var altUpPicks = e.key === 'ArrowUp' && e.altKey && !this.native.multiple && !!this.active;
      var picks = e.key === 'Enter' || altUpPicks;
      if (this.isOpen() && picks && !e.isComposing && !e.defaultPrevented) {
        if (this.failed && e.key === 'Enter') { e.preventDefault(); this.retry(); return; }
        if (this.timer || this.waiting) { e.preventDefault(); return; }
      }
      super.onKey(e);
    }

    // A number for the more line, written for the nearest lang (its digits and grouping), as the date field writes dates.
    number(n) {
      var holder = this.closest('[lang]'), lang = holder ? holder.getAttribute('lang') : '';
      try { return new Intl.NumberFormat(lang || undefined).format(n); } catch (e) { return String(n); }
    }

    // The spinner, aria-busy and the status line, from where the asking stands.
    status() {
      var line = this.statusLine;
      if (!line) return;
      var pending = !!this.timer || !!this.waiting, rows = this.items.length, a = this.answer, words = '', retry = false;
      if (this.failed) { words = this.getAttribute('error') || ''; retry = this.hasAttribute('retry'); }
      else if (pending) { if (!rows) words = this.getAttribute('loading') || ''; }
      else if (a && !rows) words = this.getAttribute('empty') || '';
      else if (a && a.total != null && a.total > rows) words = fill(this.getAttribute('more') || '', { count: this.number(rows), total: this.number(a.total) });
      this.statusWords.textContent = words;
      this.retryButton.textContent = retry ? this.getAttribute('retry') : '';
      this.retryButton.hidden = !retry;
      line.toggleAttribute('data-quiet', !words && !retry);
      this.spin.toggleAttribute('hidden', !pending);
      if (this.searchGlyph) this.searchGlyph.toggleAttribute('hidden', pending);
      selectPut(this.list, 'aria-busy', pending ? 'true' : null);
      this.toggleAttribute('data-loading', pending);
    }
  }
  define('sheen-lookup', SheenLookup);
})();
