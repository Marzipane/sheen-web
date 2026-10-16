# Changelog

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
