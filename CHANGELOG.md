# Changelog

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
- `<sheen-menu-button>`: the menu is placed on the page itself (fixed) under its button, so a scrolling table or card no longer
  cuts it off (a row menu in the last column). Near the screen edge it lines up with the button's other edge, and it follows
  its button when the page scrolls.
- Tests: the new menu items and keys, every kit part in the built CSS, and the contrast of accent words on the chip, the selected
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
