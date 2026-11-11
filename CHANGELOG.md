# Changelog

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
