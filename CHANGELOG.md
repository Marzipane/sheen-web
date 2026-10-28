# Changelog

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
- Tests: `node --test tests/elements/` (jsdom, 19 tests) runs in CI and before every release; a dist test checks that
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
