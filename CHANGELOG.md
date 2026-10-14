# Changelog

## 0.2.0 (unreleased)

- Music, from the Flutter sheen music widgets (0.4): `.sheen-dock` (the floating tab capsule with its lens and a
  search circle), `.sheen-mini-player`, `.sheen-track-row` with `.sheen-track-action`, `.sheen-artwork`,
  `.sheen-artwork-glow`, `.sheen-seek` (`data-sheen-seek`), `.sheen-transport`, `.sheen-playing-bars`,
  `.sheen-shelf`. Built to stay smooth on a phone: glass only on the dock, the mini player and the play button,
  and every moving part animates only `transform`.
- `.sheen-sheet`: a bottom sheet on `<dialog autofocus>`; a tap outside, Esc and `[data-sheen-sheet-close]` slide it
  down (`sheenWeb.closeSheet`).
- `dist/sheen-icons.svg`: every glyph as an SVG sprite for pages without Laravel (`#sheen-play-fill`), and the music
  glyphs of Flutter sheen 0.4 (waveform, library, queue, shuffle, repeat, lyrics, on-device, …).
- Demo: `docs/music.html` (`#fps` shows frames per second).

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
