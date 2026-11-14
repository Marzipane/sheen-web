# Changelog

## 0.10.0

The scope picker and the stat tile take the look of the app mockups, and the scope picker can search through the page
for lists that grow. The value, the change event and every attribute of 0.9.1 keep working.

### `<sheen-scope-picker>`

- The look, at 13px: the label in medium secondary words over a segmented bar of the three modes (an 11px radius on the
  tonal fill, 30px segments in semibold secondary words; the chosen one takes the surface, the text colour and a soft
  shadow). The modes stay one radio group, so arrows move the choice and Tab enters once; the chosen segment rings
  after Tab only. Then a 36px search field (the page background, a hairline, an 11px radius, no focus ring), a chip per
  pick, the groups and the foot.
- A chip per pick under the search, in pick order: 26px, a 13px radius, 12px semibold words and a close mark. A whole
  group shows as the group's name. A press removes the pick, fires the change, and leaves focus on the next chip or,
  after the last one, in the search box. `remove-label="Remove @label"` names each chip for screen readers.
- Each group row is 30px, its label bold, and ends in its count, `1 / 3`: how many of its members the rule picks over
  how many it has. Members sit 24px in, on 30px rows; the list scrolls past 260px (`--sheen-scope-list-max` sets
  another height).
- The foot: a hairline, then `result` in bold over `hint`, a new attribute, in small tertiary words. With neither, the
  foot hides.
- "Select all shown" shows only with `select-shown-label`, as the mockups draw no such button. A page that sets the
  label keeps it.
- A group may carry `total`, how many members it has in all. A group the page loaded in part then counts `1 / 12`, and
  ticking every row it shows keeps the rows by name instead of turning into the whole group. A group picked whole
  whose members the picker doesn't all know keeps its rows ticked and locked; its group row still unpicks it.
- The search the page answers: typing fires `sheen-scope-query` with `{query, signal, respond}` (the first ask at once,
  later ones once the person pauses for `delay` ms, 250 by default). A handler that calls `respond(groups)`, or
  `respond` with a promise of them, takes the search over: the picker shows the groups it gets, with their totals, and
  stops filtering its own. A newer ask aborts the signal and the picker drops the older answer. While an answer is out
  the list is `aria-busy` and `loading-label` shows; a promise that rejects shows `error-label`, and Enter asks again.
  Clearing the search shows `groups` again without asking. With no handler, the picker filters `groups` itself, as
  before.
- The picker names and counts from what it was given, `groups` and every answer, so a pick found through a search
  keeps its chip name after the search clears. Give it each picked item inside its group.

### Stat tile

- `.sheen-stat` takes the mockups' tile: the surface with no frame (a soft shadow in the light theme), an 18px radius,
  14px by 16px of padding, a 13px regular label in secondary words, a 26px value and a 12.5px semibold note in the
  text colour. A note takes `.sheen-success`, `.sheen-warning` or `.sheen-danger` for good or bad news.

### Tokens

- `size.scopeSegment` (30), `size.scopeRow` (30), `size.scopeChip` (26) and `size.scopeList` (260), as
  `--sheen-size-scope-*`.

## 0.9.1

Two fixes and a short text at an option's end. Additive: nothing else changes.

- An option of `<sheen-select>` takes `data-meta`, an `options` entry or a `<sheen-lookup>` answer takes `meta`: a short
  text at the row's end edge in the Filters panel count's look (12.5px, tertiary, tabular digits, 500), such as how many
  rows hold the value. The page writes it ready to show.

- Fixed: a `<sheen-select>` or `<sheen-lookup>` inside a glass `.sheen-field` lost its trigger, because the field's reset
  of its select outranked the rule that hides the native select. The rule now names its host
  (`sheen-select .sheen-select-native`, `sheen-lookup .sheen-select-native`), at the same specificity and later, and
  reaches the select wherever the element holds it. The search box keeps the list's words and width there too: the
  field's reset of every input no longer reaches it.
- Fixed: while an ask is out, `<sheen-lookup>` blocked Alt+Up everywhere. It now blocks only the pick, in a single list
  with an active option; in a multiple lookup or with no active option Alt+Up closes the list, as the select's does.

## 0.9.0

A select searched by the page, for lists too long to load. Additive: `<sheen-select>` looks and works as in 0.8.0.

### `<sheen-lookup>`

- A select whose options come from the page, one answer per query: put it where a `<sheen-select>` would hold 10 000
  options. It is built on the select's internals, so the field, the list, the keys (the select-only combobox), the
  ARIA, the chips of a `multiple` lookup, `clear`, `remove`, `variant="control"`, the looks in light and dark and in
  Arabic, and the native select that holds the form value are the select's. Every word comes from an attribute.
- The list always opens with a search box (`search` names it, else the field's own label does). Opening asks for `""`
  at once; typing asks for the trimmed query once the person pauses for `delay` ms (250 by default), never while an
  input method composes and never twice in a row for the same query.
- Each ask fires `sheen-lookup-query` with `{query, signal, respond}`. `respond(answer)` takes the options
  `[{value, label, disabled, hint, group}]`, `{options, total}`, or a promise of either; pass `signal` to `fetch()`.
  A newer ask, closing the list or taking the element out of the page aborts the signal, and the element drops the
  answer to an older ask. `options = [...]` sets the answer to the current ask without `respond`.
- While an ask is out, a 15px spinner takes the search glyph's place (still under less motion), the listbox is
  `aria-busy`, the last answer's rows stay, and neither Enter nor Alt+Up picks one. A status line under the rows, a
  polite live region with the empty line's look, says `loading` while no rows are drawn, `empty` for an answer with
  none, `error` with a `retry` link button when the promise rejects (Enter in the search box asks again too), and
  `more` with `@count` and `@total`, written by `Intl.NumberFormat` for the nearest `lang`, when the answer holds fewer
  rows than `total`. Without the attribute, the line stays quiet. Every ask needs an answer (`[]` for a query the page
  skips): until one comes the spinner turns.
- Chosen options stay chosen when an answer lacks them: they stay in the native select, hidden from the list, and keep
  their label in the field or their chip. Chips keep the order the options were chosen in. `chosen` reads and sets the
  choice with its labels (an edit form's stored value), without events. A single lookup keeps a hidden `""` option
  first, so nothing chosen is the value `""` and `required` works; options in the markup that are chosen are the
  starting choice, the others go. Closing drops the rows and keeps the choice.

### `<sheen-select>`

- Its "more" parts are methods now (`hasSearch()`, `buildMore()`, `searched()`, `filter()`, `chipItems()`), so the
  lookup builds on them. Nothing changes for a page that uses the select.
- The kit rules that name `sheen-select` (the field, the Filters panel control, disabled, open, the ring after Tab, the
  invalid ring, the chevron) name `sheen-lookup` too.
- Fix: in a list long enough to scroll, rows and groups no longer shrink below their content, so an option with a hint
  stays two lines tall instead of spilling over the next row.

## 0.8.0

A select and date fields of the kit's own, an avatar, a minimum gap between boxes, and the small parts app pages were
missing: a danger button, a 32px button, a confirm sheet, a wide side panel, a tight table, end-aligned cells, a compact
row •••, a unit after a value and pickers drawn as a cell's words or a status pill. Additive: a page that uses none of
the new elements, classes or attributes sees the same layout, with two exceptions (see "A minimum gap"): a dialog or
panel body no longer stacks two boxes flush, and a page that sets `--sheen-gap` under 8px on a stack, row or grid gets
8px there. An open popup now follows its field when either changes size.

### `<sheen-select>`

- A select whose list the page draws from the tokens, so it opens in the dark theme's colours (the browser's own list
  opened white there) and mirrors in Arabic. Put your `<select>` inside it. The select stays the form control: its
  name, value, `multiple`, `required`, its own or a fieldset's `disabled`, form reset and FormData work as before, a
  framework binds it as any select (Angular's `formControlName` or `(change)`), and a page without the elements script
  shows it as it is.
- The element hides the native select (out of the Tab order and the accessibility tree) and draws a `role="combobox"`
  button with the chosen label or the `placeholder`, an 18px chevron, and a popup with a `role="listbox"`: one
  `role="option"` row per option, a `role="group"` with its heading per optgroup, and an option's `data-hint` as a
  second line. Hidden options get no row. The popup opens in the top layer under the field, at least as wide as it.
- Keys follow the select-only combobox. Down, Up, Enter, Space and Alt+Down open; Home and End open on the first and
  last option. Open, Down and Up move over the enabled options and stop at the ends, PageDown and PageUp move ten,
  Enter or Space picks, Alt+Up picks and closes, Esc closes and marks the key handled (a side panel around it stays
  open), Tab closes and moves on. Letters jump to the next option that starts with them: no case, no accents or Arabic
  marks, 500 ms between keys, one letter typed again steps through the options that start with it.
- A person's choice fires `input` then `change` on the native select, bubbling. A single select closes first, so a
  `change` handler can move focus on; picking the chosen option again fires nothing. A multiple select toggles and
  stays open. Focus leaving the field fires `blur` and `focusout` on the native select, so a form marks it touched.
- A framework that sets `select.value`, `selectedIndex` or an option's `selected` gets a redrawn field and no events:
  the element wraps those three on a prototype of its own select and options only, never on `HTMLSelectElement`.
  Options and groups added, renamed or removed, and the select's `disabled`, `required` and `aria-invalid`, redraw it.
- With no inner select the element makes one from its own `name`, `multiple` and `required`, and
  `options = [{value, label, disabled, hint, group}]` fills it. `select`, `value`, `values`, `open()`, `close()`,
  `sync()` and `clear()` complete the API. Its name comes from the select's `<label>`s; for a `<label>` around the
  field it lists the label's parts outside the field, so a screen reader hears "Area", not the value twice.
- `search="Search areas"` puts a search box at the list's top with focus in it. Typing keeps the options whose label holds
  what you typed, blind to case, accents and Arabic hamza seats and short vowels, and hides a group left empty; the first
  option left becomes active; `empty="No matches"` shows while nothing is left. Closing empties the box. The box never
  submits a form and keeps its own events inside the element.
- `clear="Clear"` adds a round clear button while something is chosen and the select is enabled: a single select goes
  to its `""` option (or none), a multiple one to none, firing `input` then `change` once. Delete or Backspace on the
  closed field of a single select does the same.
- A `multiple` select shows a chip per chosen option, in the list's order. A press on a chip's remove mark unselects it
  without opening the list; `remove="Remove @label"` is the mark's tooltip. Backspace on the closed field removes the
  last chip. A chosen disabled option keeps its chip without a mark.
- Looks: the dense field by default (at least `--sheen-size-field`, 38px, an 11px radius, 14px words, the chevron at
  the end edge); `variant="control"` the 36px control of a Filters panel (`--sheen-size-control`). The list is a small
  menu: glass, or opaque on the theme's surface under `.sheen-solid`, a 16px radius, options scrolling inside
  `min(320px, 60vh)` under the search box. Options are the Filters panel's 36px rows: the active and hovered rows take
  the tonal fill, a chosen one the accent tint at 600; a multiple list ticks the Filters panel's 18px box, a single
  list shows a lone accent tick. Chips are 24px (`--sheen-size-select-chip`), the clear button 24px round
  (`--sheen-size-select-clear`), the search box 36px. Only Tab brings a ring, around the field; `aria-invalid="true"`
  rings it red. The select joins the selector lists of the kit rules it shares instead of copying them.

### `<sheen-date-field>` and `<sheen-date-range>`

- The kit's own date fields, in place of the browser's date input, which draws its own words and digits and lays out
  badly in Arabic. Put the element around your `<input type="date">` (two for a range). The input stays the form value,
  ISO `yyyy-mm-dd`, with its `name`, `min`, `max`, `required`, `disabled`, reset and FormData; a property set redraws the
  field and fires nothing, and focus leaving the field blurs the input, so a form marks it touched.
- The field shows the date from `Intl.DateTimeFormat` for the nearest `lang` (`en-AE` gives "8 Feb 2027"), a range a
  preset's label when it matches one, else `formatRange`. The dense field by default (`--sheen-size-field`, red with
  `aria-invalid`); `variant="control"` the find row's 36px control with a calendar glyph; `compact` keeps only the glyph.
- A press or Down opens the calendar in a popup. Arrows move by day and week (mirrored in Arabic), PageUp and PageDown by
  month (Shift: year), Home and End to the week's ends, Enter or Space picks, Esc closes as one layer, Tab stays inside.
  A pick fires `input` then `change` on the input. `min` and `max` dim the days outside them. Today has a thin ring;
  `today` takes it from your server. The week starts on the locale's first day; `first-day` (1 Monday … 7 Sunday) and
  `weekdays` override Intl.
- A range: the first pick sets the start, the second the end, and an end before the start swaps them. `from` and `to`
  show both ends, `presets = [{label, start, end}]` adds a 168px preset column (a 540px popup), `custom` a last row, and
  with `apply` (and `cancel`) the picks wait for Apply. `note` adds a footer line; `clear` a footer button.
- Words come only from attributes: `placeholder`, `label`, `prev`, `next`, `clear`, `from`, `to`, `apply`, `cancel`,
  `note`, `custom`. Size tokens: `--sheen-size-date-pop-min` (260px), `-date-pop-max` (360px), `-date-range-pop`
  (540px), `-date-presets` (168px), `-date-end` (42px), `-calendar-day` (30px), `-calendar-button` (24px).

### `<sheen-avatar>`

- A person's initials in a circle, as Flutter sheen's `SheenAvatar`. `name` gives the initials (the first letter of the
  first two words; `letters="1"` draws one) and the tint, through the same FNV-1a hash as `SheenAvatar.tintOf`, so a
  person gets the same colour in the app and on the web. `tint-key` (a record's ID) picks the tint in place of the name.
  `size="s"` is 30px with 12px initials, `size="xs"` 18px with 9px, 40px with 15px without. `image` covers the initials
  once it loads; one that fails goes away. Without a name it shows the filled user glyph. `label` makes it an image with
  that name; without it screen readers skip it.
- The fill is one of eight `--sheen-tint-*` tokens (Flutter sheen's `SheenTint`, the same in both themes, checked
  against the Flutter source in CI), mixed toward black until white initials reach 4.5:1, running at 135deg to 65% of
  that colour. `.sheen-avatar-name` sets an avatar beside a `<b>` name and a `<small>` second line.

### A minimum gap

- One token, `--sheen-space-min` (8px, `space.min`), is the least room between two boxes the kit lays out: fields, field
  rows, cards, buttons and controls never sit flush. Every kit layout gap between boxes reads
  `max(var(--sheen-space-min), <its own value>)`: stacks, rows and grids, field grids, forms and choices, chip rows, the
  find and applied rows, a list kit, dialog, panel and filter footers, a bulk bar, page header and status actions, empty
  and message actions, a small dialog. Today's values are all 8px or more, so these layouts look the same; raising the
  token raises every gap under it, and `--sheen-gap: 0` on a stack no longer makes its cards touch.
- A dialog body or a side panel body keeps the minimum between two boxes it stacks, so a form dialog that puts its
  fields straight in `.sheen-dialog-body` no longer draws them flush (0px became 8px in a dialog of a date, two times, a
  hub and a reason). Text keeps its own margins, a filter group stays spaced by its heading, and the rules sit at no
  specificity, so any rule that sets the margin wins.
- A popup wider than the room on both sides of its anchor (a phone) keeps the minimum gap from the screen's edges where
  the screen has that much to spare. One that fits still lines up with its anchor.

### Buttons and the confirm sheet

- `.sheen-button.sheen-danger`: a step that takes something away. The deal fill under white words, 5.6:1 in light and
  4.7:1 in dark; its hover darkens the fill so the words keep their contrast; a disabled one fades as any button.
- `.sheen-button.sheen-xsmall`: a 32px button for a bulk bar's actions (`--sheen-size-button-xsmall`), 13px words, 14px
  glyphs; `class="sheen-xsmall"` on a `<sheen-menu-button>` sizes its button the same (add `sheen-small` for the dense
  menu outside a bulk bar).
- `.sheen-dialog.sheen-small.sheen-confirm`: the sheet that asks before a risky step, 440px wide
  (`--sheen-size-confirm`), 14% down the window, scrolling inside when taller than the room. The question, the record
  (a `.sheen-pill` that hugs its words), the words (a 13.5px secondary `<p>`) and the buttons stack 10px apart; the
  buttons sit at the end edge, 34px tall (`--sheen-size-confirm-button`).

### Tables, panels and menu buttons

- `class="sheen-small sheen-wide"` on a `<sheen-side-panel>`: the dense content at 440px (`--sheen-size-panel-wide`), at
  no specificity like `sheen-small`.
- `.sheen-table.sheen-small.sheen-tight`: 9px at a cell's sides (`--sheen-size-table-tight-padding`) for a table with
  many columns; the pinned ••• cell keeps 4px.
- `class="sheen-end"` on a `th` or `td`: the words and a sort button at the end edge, mirrored in Arabic; with
  `sheen-num` a number column. `.sheen-num` alone is unchanged.
- `class="sheen-compact"` on a `.sheen-icon-button` or a `<sheen-menu-button glyph>`: the 30px row ••• (radius 9, no
  fill, an 18px secondary glyph, the tonal fill when hovered or open), so a small table row is 51px as in the app
  mockups instead of 65px. Tokens `--sheen-size-icon-button-compact`, `-radius` and `-glyph`.
- `<sheen-menu-button>` takes `variant="text"` (the words of a table cell, as `.sheen-cell-button`, underlined while
  open) and `variant="pill"` with `tone="success|warning|danger"` (a status pill, 22px with 12px words in a small table:
  `--sheen-size-pill-small`, `-text`), for a picker inside a cell, with no chevron and no frame. Menu, keys and focus
  stay the menu button's own.
- `.sheen-affix` in a dense field puts a unit after an input's value ("30 min") inside the field's box, at the end edge
  (a prefix when written before the input); a press on the unit focuses the input, an invalid input rings the box.
- A page header's ••• (`variant="control"` with a glyph) takes the font size around it, so a size probe reads the same
  font as on the app mockups; its box and glyph stay the same.
- Fixed: a switch in a small table drew at 16px, because the table's 16px checkbox rule hit it. The rule skips
  `role="switch"` and the kit's switch input now.

### Under the hood

- A shared `popup()` in the elements places, follows and closes every popup (menus, the select's list, the calendar);
  `<sheen-menu-button>` uses it and behaves as in 0.7.1. An open popup is placed again when it or its anchor changes
  size (a field whose chips wrap, a list a search shortens, a month with one more week), where the browser has
  `ResizeObserver`.
- A `<label>` around a select or a date field names it by its parts outside the field (`labelIds()`), so a screen
  reader never hears the open list or calendar in the field's name.
- Size tokens shared by the new parts: `--sheen-size-field` (38px, the dense field) and `--sheen-size-control` (36px).
- Tests, in jsdom and on the built CSS, per part: `select-core-0.8`, `select-more-0.8`, `select-css-0.8`,
  `date-field-0.8`, `avatar-0.8`, `space-0.8`, `actions-0.8`, `table-panel-0.8`, `affix-cell-0.8`. Size fixtures under
  `tests/size/` draw each part in English and Arabic, light and dark, for the size gate against the app mockups (2px on
  controls and rows, 4% on wide boxes, equal fonts).

## 0.7.1

An opt-in drawer for the sidebar shell under 760px, and three fixes to 0.7.0: less motion, forced colors after a press,
and a Views menu width that an app can set. An app that adds no nav button sees no change in its layout.

- A shell whose `.sheen-app-bar` holds a `.sheen-nav-button` turns its sidebar into a drawer under 760px. The drawer
  opens from the start edge (the left; the right in Arabic), `min(300px, 86vw)` wide, over a dim, so the page starts
  under the app bar. The button's `aria-controls` names the sidebar's id, and the button shows only under 760px. Opening
  puts focus on the drawer's first link and makes the rest of the shell inert, so Tab stays in the drawer. Esc, a press
  on the dim or on a link, or the button again closes it, and focus goes back to the button. Growing past 760px closes
  it. sheen.js and the elements carry the same drawer code; a page that loads both sets it up once.
- A shell without the button keeps 0.7.0's layout under 760px: the sidebar stacks over the page, up to 40% of the window
  high. A browser without `:has()` keeps that layout too.
- A closed drawer draws nothing: it is out of sight with no shadow and out of the Tab order. It hides once it has slid
  out, after `--sheen-motion-snappy-duration`. Each motion spring now gives its duration alone as
  `--sheen-motion-<spring>-duration`, next to `--sheen-motion-<spring>` (duration and easing).
- Fixed: with less motion, 0.7.0 gave every element a .01ms transition of every property, so a change eased for a moment
  and a part that was just shown refused focus until it ended (the drawer's links). With less motion nothing transitions
  now; animations still end at once as before.
- Fixed: with forced colors, a press took the system outline away from a select or a picker inside a `.sheen-field` or
  `.sheen-control`, from a picker's pill, and from a dense menu item that the arrows reached after the press. 0.7.0
  applied its rules that hide a ring after a press with forced colors too. With forced colors those rules stand aside
  now, so the outline marks focus after a press too. An open drawer's dim takes the side panel dim's forced colour.
- The Views menu width (320px to 360px for a menu button at the end of a views or find row) now sits at no specificity,
  like `sheen-small` on a side panel. An app's class rule on the menu button or an inline `--sheen-menu-min-size` or
  `--sheen-menu-max-size` wins over it; a value set on an ancestor of the button does not.
- Tests, in jsdom and on the built CSS:
  - the drawer's rules, the stack a shell without the button keeps, the hide delay from the token, and the
    forced-colors rules for both dims and for the press;
  - opening, Esc, a link, the dim and the button again, with focus and inert, with the elements, with sheen.js alone and
    with both;
  - a button outside its shell, which opens nothing;
  - the same drawer code in both scripts;
  - the Views width rule at no specificity.

## 0.7.0

The parts an app's list page and its forms need, at the sizes of the app mockups they were ported from: control-look
menu buttons with glyphs, a page header, solid layers, a modal side panel with a heading and a footer, a table card with
a small table, a group row and a pager, dense form fields, a small command palette and shortcuts sheet, a status block
and a toaster at the top. Focus rings now show only while the keyboard navigates, and text fields draw none. Mostly
additive; the fixes, the looks that change and one change against an earlier owner choice are listed last.

- `<sheen-menu-button>`: `variant="control"` draws the button as the find row's 36px control (a 36px square with
  `glyph`, for a page header's •••); `icon` puts a glyph before the label,
  `chevron` a chevron after it that turns while the menu is open, and `compact` keeps only the icon inside a narrow
  `.sheen-list-kit`. Items take `glyph` (before the label: secondary, red on a danger item, faint when off) and `accent`.
  A small menu (`class="sheen-small"`, a bulk bar or the end of a views row) is the dense app size: 13.5px, 36px rows,
  250px to 320px wide (`--sheen-menu-min-size`, `--sheen-menu-max-size`; 320px to 360px at the end of a views or find
  row; never wider than the window less 16px), plain outlined key caps; an item with a
  description lines its glyph up with its title and shows the description at 12px.
- `.sheen-solid` on a layer or on any box around it (the page's body) draws menus, toasts, the command palette, side
  panels and hover cards opaque, each with its own fill and shadow, so rows and buttons under them never show through.
  Modal layers then dim the page with a plain shade instead of a blur. Glass stays the default.
- `<sheen-side-panel>`: `heading` puts the title and a 34px close button on one row above the body and keeps a footer
  on the panel's bottom edge (an empty heading counts as none; the element marks a headed panel `sheen-headed`).
  `modal` dims the page behind it (a press on the dim closes it), puts focus on the first control, keeps Tab inside
  (one stop per radio group; hidden, disabled and `tabindex="-1"` controls skipped) and brings focus that lands outside
  back in, unless another dialog or popover took it. Hiding an open panel by its attribute takes the dim away; moving it
  keeps the dim. `class="sheen-small"` makes the panel 400px wide, for filters and editors (menu buttons inside take
  the dense size); `--sheen-panel-size` sets any other width (440px by default): a class rule on the panel or an inline
  value wins over `sheen-small`, a value set on an ancestor does not. With forced colors
  the panel keeps an edge toward the page and a modal panel's dim stays visible.
- List kit: `.sheen-control.sheen-on` tints the fill and glyph of a control whose filters are on, and in a narrow list
  kit a control with a count keeps its count; `.sheen-table-card` puts a table on an 18px surface card that still scrolls
  sideways; `.sheen-table.sheen-small` is the dense table (13.5px cells on one line up to 260px, a tinted 12px header row,
  16px checkboxes, a 4px side to its pinned end column) and `.sheen-wrap` wraps a table of long sentences. A
  `.sheen-link-button`'s glyph is 14px. A `tr.sheen-table-group` row of `th` names a group
  of rows, with its `small` count as a pill; `.sheen-table-foot` puts the count at the start and a `.sheen-pager` at the
  end, with 24px arrow buttons that mirror in Arabic. The Filters panel spaces its options 1px apart under their label
  and draws an outlined 18px box with a tick, the same in light and dark.
- Forms: `.sheen-form-field.sheen-small` is the dense field (a 13px label over a 38px box, a hint under it, a red ring
  and hint with `aria-invalid="true"`), two to a row in `.sheen-fields.sheen-small`, with `.sheen-wide` across both.
  `.sheen-select` around a `<select>` draws the field's chevron at the end edge. In forced colors the dense field keeps
  a 1px border (2px when invalid) and the chevron shows in the text colour. `.sheen-panel-foot` holds a side panel's
  Cancel and main action on its bottom edge, each at least 128px, side by side or one under the other when narrow; in a
  panel with a heading it sticks there while a long body scrolls under it. On a solid panel both footers take the
  panel's sheet, so rows never show through them.
  `.sheen-switch.sheen-large` is a 51 by 31 switch and `.sheen-switch-row` puts words and a switch on one row over a
  hairline; the default switch keeps its size.
- `<sheen-command-palette class="sheen-small">` is the 560px app palette with a 36px search field and 36px rows.
  `.sheen-dialog.sheen-small` is a 720px sheet; `.sheen-shortcuts.sheen-small` lays shortcuts out in three columns of
  `.sheen-keys` and words under `.sheen-shortcuts-head` headings (one column at 760px and under), with a
  `.sheen-shortcuts-note` line.
- `.sheen-status` (with `-glyph`, `-title`, `-actions` and the danger, warning and success tones) follows Flutter sheen's
  SheenStatusScreen: a glyph in a 72px circle of its tone, a title, words at 15px at most 34 characters wide and up to two
  actions stacked, and a `small` note in the tertiary colour. `.sheen-page-title` is an app page's 26px title.
- `.sheen-page-head` is an app page's header: `.sheen-page-head-text` holds `.sheen-page-crumbs` (12.5px), the
  `.sheen-page-title` and a 14px `.sheen-page-subtitle` with room for a `.sheen-pill` beside it, and
  `.sheen-page-head-actions` sits at the end edge on the bottom line. The words keep 320px; under that the actions move
  to a line of their own, still at the end edge.
- `<sheen-toaster position="top">` follows Flutter sheen's toast: under the app bar (`--sheen-toaster-top`), at the end
  edge (`--sheen-toaster-end`, `--sheen-toaster-size`), the action as a link, and a press on the toast closes it. Its
  close button shows only while it has keyboard focus (`.sheen-focus-only`: out of sight until focused). A toast's
  `glyph` replaces the tone's dot in either position, and Esc on any toast closes it.
- Tokens: `--sheen-size-app-bar` (60px, `size.appBar` in `tokens.json`, web only) is the block size of
  `.sheen-app-bar`, so an app places a top toaster under its bar from tokens alone:
  `--sheen-toaster-top: calc(var(--sheen-size-app-bar) + var(--sheen-space-m))`, `--sheen-toaster-end:
  var(--sheen-space-xxl)`. Number tokens with two-word keys take kebab-case names.
- Glyphs: the filled Flutter sheen icons draw as `<name>-fill` (`check-circle-fill`), filled in the text colour; `alert`
  is a warning triangle.
- Focus: on a page that loads sheen.js or the elements (they mark `<html data-sheen-focus>`), Tab or Shift+Tab marks
  `<html data-sheen-keyboard>`, and only then do buttons, links, tabs, selects and menu items draw their one 2px ring;
  the next press clears it. A press, Esc, Enter, typing and arrows never bring a ring, so closing a panel with Esc leaves
  its opener plain; in a dense menu the item the arrows reach shows the hover fill. A page with neither script keeps the
  browser's own `:focus-visible` rings. A text input or textarea never draws a ring, keyboard or not: its caret shows the
  focus (the find row's search drew two rings in 0.6.0); a select has no caret, so it rings after Tab, and inside a
  `.sheen-field` or `.sheen-control` the field rings around a select or picker button instead. Esc or the close button
  on a toast that holds focus gives focus back to where it was. sheen.js still loads in Node. The picker follows the
  same rule: its pill rings after Tab only, never on a press or while its list is open; an open picker takes the tonal
  fill instead of 0.1's ring and glow; its search box draws no ring. A
  control's 0.6.0 inset ring and 4px glow are gone. A menu button with an icon or a chevron takes its label as its
  name, so a compact one keeps a name. In forced colors the Filters checkboxes are the system's own.
- Fixed: a menu near the screen's end came out narrow, wrapped its labels and could open upward with room below, because
  it was measured after it was placed. It is now measured where nothing narrows it, then lined up under its button, on
  the other edge when it would leave the screen, and above only when it doesn't fit below and there is more room above.
  A menu wider than the room on either side (a phone) keeps to the screen. Two 0.5.0 placement tests now give the
  button's place instead of the menu's measured box, and assert the same flips.
- Fixed: in a find row, a views end kept the 6px it has under the views row's tabs, so a Views control there sat 3px
  higher than Filters; a control inside an app's inline wrapper sits at the top of its line, never on its baseline.
- Fixed: a long `.sheen-sidebar-shell` nav made the whole page scroll: the visually hidden words of its items belonged to
  the page, not to the scrolling nav, and stretched the document (1224px in a 1000px window). The nav and the content
  area now hold what is positioned inside them, and the shell is one row the window's height (`100dvh` where supported).
- Fixed: a sortable header in a `.sheen-table.sheen-small` took the cell's 10px 14px padding on top of its button's,
  so the header row was 3px taller and a sortable column grew by the cell's side padding.
- Fixed: the hidden attribute hides the list kit, page and footer parts that set their own display (menu buttons, page
  tabs, footers, the pager); page tabs drawn as links keep the tab colours instead of the base link rule's text colour.
- Looks that change: an enabled menu item with a `hint` shows its label at weight 600 (a title over its description);
  page tabs have 24px each side and mark the current page by its 2px line only, drawn inside the row so a scrolling row
  never clips it; `.sheen-list-message.sheen-danger` keeps its title in the text colour and gets a danger ring (0.6.0
  turned every word red); the Filters panel's options and boxes take the app mockups' spacing and look; a menu in a bulk
  bar or at the end of a views row is the dense size (13.5px, 36px rows); a `.sheen-table` with `aria-busy="true"` draws
  as one placeholder block; small buttons in the list kit, the Filters footer and list messages are 34px instead of 40px;
  the find row's "/" key cap is a plain outline; a side panel draws no ring when a press gives it focus; an open control
  (its menu or panel open) takes the tonal fill instead of 0.6.0's accent ring and 4px glow, since only keyboard focus
  draws a ring.
- Changed against the owner's 0.1.4 choice, approved for 0.7.0: `.sheen-field` no longer draws its focus line and soft
  glow. In 0.1.4 the owner chose to show a field's focus with that line and glow; under the 0.7.0 rule that text fields
  draw no focus ring, the field shows focus by its caret and its label in the accent. Forced colors still outline it.
- Tests: the new options, items and placement, with a Views control at the end edge in English and Arabic; the heading
  row, modal dim, focus and Tab cycle; the toaster at the top and at the bottom; filled glyphs; the pointer and keyboard
  focus state; every new rule in the built CSS with the values it ports, logical sides only; contrast from the tokens
  (WCAG AA in light and dark) for accent items, hints, the tinted header, ticked options, key caps, status words and
  toasts, and 3:1 for the status glyphs and a tinted control's glyph; the dense fields, the panel footer, the large
  switch, the group row, the pager, the small palette, the shortcuts sheet and the page head; a radio group and a
  hidden input in the Tab cycle, focus coming back into a modal panel, its dim when hidden or moved, an empty heading,
  the top toast by keyboard, compact menu button names, forced colors and a menu on a phone; open and applied controls
  with no ring; a footer that stays on the bottom edge of a panel longer than the window; the keyboard flag (only Tab
  sets it; a press, Esc, typing and arrows never do), on a page with sheen.js alone too, and selects ringing after Tab;
  dense fields in forced colors; the find row on one line and a sidebar shell that never scrolls the page. The dist PHP test now expects `.sheen-field` without its 0.1.4 glow.
- Docs: `docs/app-page.html` shows a list page built from these parts with neutral sample words, in English and Arabic,
  light and dark.

## 0.6.0

A list kit for long lists and tables. Additive: nothing that existed changes.

- List kit classes: a views row (tabs with counts, saved views at the end), a find row (one wide search, compact controls, a
  Filters control with a count), an applied row (removable chips, Clear all, the result count, last used), result messages
  (nothing matches, couldn't load), filter groups and options for a side panel with a sticky footer, sortable headers whose arrow
  sits in the end padding, a row-menu column pinned at the end edge, and a bulk bar with its count, actions, progress and partial
  failure. `.sheen-list-kit` is a container: below 760px of its own width the tabs scroll, compact controls keep only their glyph
  and count, and chips scroll with the count pinned. Logical sides only, so Arabic mirrors. The view tab look also serves a
  module's page tab row: links in a `<nav class="sheen-page-tabs">` with `aria-current="page"`. `.sheen-table tr[tabindex]`
  shows keyboard focus, and `.sheen-cell-button` (with `.sheen-strong`) is a value in a cell that opens or edits in place.
- `<sheen-menu-button>` items take `hint` (a second line, for why an item is off or who can use it), `shortcut` (shown at the
  end and set as `aria-keyshortcuts`) and `danger`, and the list takes `{separator: true}` and `{heading: 'Words'}` between items.
  The arrows skip separators and headings. A plain item is still its label alone. `class="sheen-small"` on the element (or on a box around
  it, such as an app's own wrapper) gives its button the small size; inside a bulk bar or at the end of a views row it is small already.
- `<sheen-menu-button>`: the menu opens in the top layer (the popover API, `popover="manual"`), so no scrolling table or card
  cuts it off, a glass (`backdrop-filter`) box around it no longer shifts it, and a sticky cell or bulk bar no longer paints over
  it. Where the popover API is missing it is placed fixed on the page instead. It sits under its button, lines up with the
  button's other edge near the screen edge (the left one in Arabic), follows its button on scroll and window resize, and closes
  once its button scrolls out of the box it sits in or off the screen. A danger item never takes the first focus when the menu opens.
- The bulk bar's spinner is `.sheen-bulk-spin`, with its own keyframes, so the progress ring's `.sheen-spin` turn is unchanged.
- Tests: the new menu items and keys, the menu in the top layer inside a glass box and in a pinned cell under a bulk bar, its
  placement in Arabic, resize and scroll-out, the first focus past a danger item, the progress ring's keyframes, every kit part in the built CSS, and the contrast of accent words on the chip, the selected
  tab count and the bulk bar (WCAG AA in light and dark, computed from the tokens).

## 0.5.1

A glyph option and contrast fixes. Nothing that existed is removed.

- `<sheen-menu-button glyph="more">`: the button shows only that sheen glyph, as a `.sheen-icon-button`, and `label` becomes its accessible name (and the menu's). Without `glyph` nothing changes.
- `.sheen-pill.sheen-success|warning|danger` and `.sheen-badge.sheen-ok|warn|bad`: the text is the tone mixed 80% with `--sheen-text`, so it reaches WCAG AA (at least 4.5:1) on its own tint in light and dark; the tone alone was 3.9:1 in light. A test computes the contrast from the tokens.
- `.sheen-sidebar-item[aria-current="page"]` marks the page you are on (accent tint and text); `.sheen-sidebar-item[aria-disabled="true"]` is an item that leads nowhere yet: tertiary text, no hover.
- `<sheen-command-palette>` follows `label`, `placeholder` and `empty` set after it is on the page, as a framework binding sets them.
- `.sheen-table-wrap` is `position: relative`, so `.sheen-visually-hidden` text inside a scrolling table stays inside it and can't widen a narrow page.
- Tests: the scope picker's same-id-in-two-groups test ticks the row in the second group, the menu's press-outside test checks it closed before focus moves, and the hover card's resize test checks the card itself is watched. Each now fails with its fix removed.

## 0.5.0

A sidebar shell and motion tokens. Additive: nothing that existed changes.

- `.sheen-sidebar-shell`, `.sheen-sidebar` and its parts, `.sheen-app-main`, `.sheen-app-bar`, `.sheen-app-search`, `.sheen-app-tool`, `.sheen-app-content`: a labelled sidebar for record-heavy apps. Below 760px the sidebar sits on top.
- `.sheen-auth-page`, `.sheen-auth-card`, `.sheen-form`, `.sheen-form-field`, `.sheen-input`, `.sheen-form-error`: a small centred sign-in page.
- `.sheen-icon`, `.sheen-grow`.
- `--sheen-motion-*`: durations, easing, springs as `linear()` and the press scale, from Flutter sheen's `tool/motion.json`, with a drift check. Under reduced motion every spring becomes a plain fade.

Fixes to the 0.4.0 record kit, from its release review:

- `<sheen-hover-card>`: Esc closes it from anywhere while it is open, giving focus back to the trigger only when focus was inside (WCAG 1.4.13). It closes when the keyboard leaves it. It is placed again when its content changes size, is never taller than the window and scrolls inside, and lands beside its trigger inside glass or transformed boxes. `attach()` leaves the old trigger clean and drops a pending open; moving the card in the page keeps its trigger. `delay="0"` means no delay. A click on the trigger closes the card and drops a pending open, so what the click opens gets the next Esc.
- `<sheen-side-panel>`: children added after it is on the page go into its body, whatever the loading order. Opened again from inside, it keeps the first opener.
- `<sheen-menu-button>`: a press outside or focus leaving closes it, leaving focus where it went. Near the bottom it opens upward, and a long menu scrolls. A menu with nothing to pick still closes on Esc.
- One Esc closes one layer: each element marks the Esc it handled, and the side panel ignores a marked one.
- `<sheen-scope-picker>`: focus comes back to the ticked row in its own group when one id sits in two groups. Select all shown leaves out a group with nothing shown. A value now carries only the list its mode reads (none for `all`); the other picks are kept inside, so switching back restores them.
- Docs: stories for the four record-kit elements, the README pins v0.5.0 and its table has every column. Tests use neutral names.

## 0.4.0

Four elements for record-heavy apps. Additive: nothing that existed changes.

- `<sheen-hover-card>`: facts and quick actions beside a link. Opens after a delay on hover, by focus and Space with no pointer, never on touch; stays while the pointer is over it; Esc closes it and returns focus.
- `<sheen-side-panel>`: a panel on the end edge with no backdrop, so the page behind keeps its scroll, filters and selection.
- `<sheen-scope-picker>`: chooses a rule, not a list: all, only these, or all except, with search, group checkboxes and an `empty-label` for a search that finds nothing. A whole group is stored as the group, so a new member joins the rule.
- `<sheen-menu-button>`: a button with a keyboard menu that stays on screen.

## 0.3.0

App elements and app UI, for apps that are not Laravel sites (first user: Video Studio). Additive: nothing that
existed changes.

- New `dist/sheen-elements.js` (and `.min.js`): framework-free custom elements. They draw in the light DOM, take every
  word from attributes, mirror for `dir="rtl"`, follow light and dark, and stop moving under reduced motion.
  - `<sheen-glyph>`: the sheen icons plus 39 media glyphs (play, scissors, captions, timeline, nodes…).
  - `<sheen-progress-ring>`: round progress, or a spinner without a value.
  - `<sheen-drop-zone>`: drop files or choose them by keyboard; fires `sheen-files`.
  - `<sheen-toaster>` and `sheenElements.toast()`: a queue of toasts with actions, paused while pointed at.
  - `<sheen-command-palette>`: ⌘K, grouped results, free-text commands, disabled rows with a reason.
  - `<sheen-video>`: a player with a scrubber slider, in/out points, markers and J/K/L, I/O keys.
  - `<sheen-waveform>`: audio peaks as a seek slider.
  - `<sheen-compare>`: before and after with a split handle (images or synced videos).
  - `<sheen-timeline>`: tracks for video, audio (with peaks), captions and overlays; zoom, trim handles, split.
  - `<sheen-transcript>`: text-based editing; select words and delete to cut, fillers and pauses highlighted.
  - `<sheen-node-graph>`: drag nodes and connect ports, with a keyboard way to do both.
  - `<sheen-tour>`: an onboarding tour with a spotlight.
- New CSS for app UIs: `.sheen-shell`, `.sheen-rail`, `.sheen-topbar`, `.sheen-search-trigger`, `.sheen-panel`,
  `.sheen-glow`, `.sheen-aurora` (animated gradient background), `.sheen-dialog`, `.sheen-switch`, `.sheen-range`,
  `.sheen-kbd` and `.sheen-shortcuts`, `.sheen-empty`, skeleton variants (`-line`, `-block`, `-circle`),
  `.sheen-stat`, `.sheen-table`, `.sheen-badge`, `.sheen-progress`, `.sheen-toolbar`, `.sheen-swatch`, `.sheen-chat`
  with `.sheen-msg`, and `.sheen-drawer`.
- The media glyphs live in `glyphs/media/`, apart from `icons/`, which stays identical to Flutter sheen.
- `sheenElements.paintRange(input)`; every `<input class="sheen-range">` on the page is painted by itself (when added
  and while it moves), so the filled part of the track follows the thumb.
- Polish found by screenshotting a whole app built on 0.3.0 in dark, light and phone widths:
  a `.sheen-range` inside a `.sheen-field` keeps its height (the field's input reset flattened it); a `select` inside a
  `.sheen-field` shows a chevron (mirrored right to left); off `.sheen-switch` tracks reach about 3:1 contrast;
  the `hidden` attribute always wins over the app classes' `display`; `<sheen-compare>` shows each video's first frame
  before it is played; the `<sheen-tour>` card goes beside a target as tall as the window instead of covering it.
  At phone width: `.sheen-panel-head` wraps its actions under the title instead of squeezing it to nothing, and
  `.sheen-tabs` scroll sideways when they do not fit. `.sheen-swatch` takes its colour from `--sheen-swatch`.
- Tests: `node --test tests/elements/` (jsdom, 21 tests) runs in CI and before every release; a dist test checks that
  every element is defined and styled. Live stories: `docs/elements.html`.

## 0.2.2

- New `<x-sheen::included>`: what a trip includes, each an icon with its name, as the app's tour icons. `compact` draws the icons only, with the name for screen readers and on pointing.
- `<x-sheen::trip-card>` takes `icons` and shows them compact under the facts.

## 0.2.1

- Picker search: the exact value comes first, then the popular values, then names that start with what was typed. "dollar" now finds the US dollar before the Australian one.

## 0.2.0

- New `<x-sheen::picker>`: one choice from a list, never the browser's own dropdown.
  - The field (or a glass pill, `variant="pill"`) opens a glass list under it. From eight options it has a search box that ignores case and accents. Popular values come first, and the chosen one is ticked.
  - `layout="sheet"` opens a sheet in the middle for long lists. On phones every picker is a sheet from the bottom.
  - The list is in the top layer (`popover`), so dialogs and clipped parents never cut it.
  - Keyboard and screen readers: a combobox and a listbox; ↑ ↓, Page Up/Down, Enter, Esc, and type-to-jump without a search box.
  - A native `<select>` stays underneath: it is the control without JavaScript, and it fires `input` and `change` when something is chosen.
- New `<x-sheen::chip-choice>`: a few choices shown at once, as chips that are native radios.
- `sheenWeb.initPickers()` and `sheenWeb.closePicker()`.

## 0.1.4

- Fields show focus as a field, never as a box around the words.
  - The base `:focus-visible` ring drew a sharp rectangle around a bare `<input>` inside a rounded `.sheen-field` or a glass bar. Inputs, selects and textareas inside `.sheen-field` or `.sheen-segment` no longer draw it.
  - `.sheen-field:focus-within` is now a 1.5px accent line with a soft 4px glow, and the label turns the accent.
  - New `.sheen-segment` for a part of a glass bar: it lights up as its own pill while being filled. `.sheen-segment-trigger` marks a button that opens the part's picker.
  - With forced colors, the field or part gets a real outline.

## 0.1.3

- Base styles: the `<button>` reset is now `:where(.sheen button)`, so it has no specificity and a `<button>`
  SheenButton keeps its size and weight (`.sheen-button`, `.sheen-large`, `.sheen-small`). In 0.1.2 the reset won.

## 0.1.2

- `hotel-card`: `save` now renders the save button. It sits beside the card's link (a button inside a link is not
  valid HTML and would open the hotel), over the photo, in a `.sheen-hotel-card-wrap`. `saved` sets `aria-pressed`, and
  `data-sheen-save` is there for the page's own script.

## 0.1.1

- `key-value`: a `style` given by the page no longer breaks the column count on Laravel 10 (the component's own
  `--sheen-cols` now ends with `;` before Blade merges the page's style).

## 0.1.0

First release: sheen for the web, from Flutter sheen 0.3.6.

- Tokens (`tokens/tokens.json`) as CSS custom properties `--sheen-*` for light and dark, following the system or
  `data-theme`; the same colours, spacing and radii as Flutter sheen, checked against it in CI.
- Glass: `.sheen-glass`, `.sheen-glass-clear`, `.sheen-glass-prominent`, with opaque fallbacks for reduced
  transparency, high contrast and browsers without `backdrop-filter`.
- Blade components (`<x-sheen::…>`): icon, glass, button, icon-button, chip, deal-badge, was-price, deal-line, score,
  stars, photo, hotel-card, trip-card, trip-tag, choices, choice, itinerary, key-value, list-row, action-bar, field,
  stepper, check, pill, steps, alert, tabs, photo-viewer.
- `dist/sheen.js`: the photo viewer (chips, arrows, swipe, Esc) and the stepper; no dependencies.
- The Flutter sheen glyphs, generated into `resources/icons.php`.
