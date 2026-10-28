# sheen-web

Frosted glass for the web: the design language of [Flutter sheen](https://pub.dev/packages/sheen) as CSS custom
properties, a small script and Blade components for Laravel. Same tokens, same glass, same component names, so an app
built with sheen and its website look like one product.

**[Live demo](https://marzipane.github.io/sheen-web/)** · **[Changelog](CHANGELOG.md)** · **[Flutter sheen](https://github.com/Marzipane/sheen)**

## Why sheen-web

- **One set of tokens.** `tokens/tokens.json` holds the colours, spacing and radii of Flutter sheen. CI compares them
  with the Flutter source on every push, so the two cannot drift.
- **Glass where it helps.** Headers, search bars, floating bars and map controls get glass; cards and long lists stay
  solid. Reduced transparency, high contrast and browsers without `backdrop-filter` get an opaque surface.
- **Right to left by construction.** Only logical properties (`margin-inline-start`, `inset-inline-end`); set
  `dir="rtl"` and everything mirrors. Names and times in mixed scripts are isolated.
- **Light and dark.** Follows the system, or `data-theme="light|dark"` on `<html>`.
- **No words inside components.** Every label is passed in, already translated. A test fails if a component renders text
  of its own.
- **The travel library.** Deal badges, struck prices, hotel and trip cards, cabin and room choices with a round mark,
  itineraries, a photo viewer with chips, the floating action bar.

## Install

From GitHub (Composer):

```json
"repositories": [{"type": "vcs", "url": "https://github.com/Marzipane/sheen-web"}],
"require": {"marzipane/sheen-web": "^0.1"}
```

```bash
composer update marzipane/sheen-web
php artisan vendor:publish --tag=sheen-assets
```

Then load the files in your layout and put `class="sheen"` on `<body>`:

```blade
<link rel="stylesheet" href="{{ asset('vendor/sheen/sheen.min.css') }}">
<script src="{{ asset('vendor/sheen/sheen.min.js') }}" defer></script>
```

Without Laravel, use the CSS and script from a tag through jsDelivr:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Marzipane/sheen-web@v0.1.2/dist/sheen.min.css">
<script src="https://cdn.jsdelivr.net/gh/Marzipane/sheen-web@v0.1.2/dist/sheen.min.js" defer></script>
```

## Quick start

```blade
<x-sheen::trip-card
    :href="route('tour', $tour)"
    :title="$tour->title"
    :eyebrow="$tour->operator"
    :facts="__('site.trip_n_days', ['n' => $tour->days])"
    :price="__('site.trip_from_price', ['price' => $money($tour->from_price)])"
    :per="__('site.trip_a_person')"
    :photo="$tour->photo"
    :deal="$tour->deal ? ['badge' => '−5%', 'was' => $money($tour->from_was), 'ends' => __('site.until', ['date' => '31 Oct'])] : null"
/>

<x-sheen::choices :legend="__('site.trip_cabins')">
    @foreach ($fares as $fare)
        <x-sheen::choice name="fare" :value="$fare->code" :checked="$loop->first" :media="$fare->photo" viewer="photos" :viewer-group="$loop->index + 1">
            <b>{{ $fare->group }}</b>
            <span class="sheen-footnote sheen-secondary">{{ $fare->category }}</span>
            <x-slot:end><b class="sheen-num">{{ $money($fare->price) }}</b></x-slot:end>
        </x-sheen::choice>
    @endforeach
</x-sheen::choices>
```

## Components

| Flutter sheen | Blade | Use |
| --- | --- | --- |
| `SheenIcon` | `<x-sheen::icon>` | the Flutter sheen glyphs |
| `SheenGlass` | `<x-sheen::glass>` | regular, clear (over a photo), prominent |
| `SheenButton`, `SheenPrimaryButton` | `<x-sheen::button>` | tonal or prominent; small, regular, large |
| `SheenIconButton` | `<x-sheen::icon-button>` | 44 px, a label is required |
| `SheenChip` | `<x-sheen::chip>` | filters, months, dates; the deal tone |
| `SheenDealBadge` | `<x-sheen::deal-badge>` | "−15%", top start on a photo |
| `SheenWasPrice` | `<x-sheen::was-price>`, `<x-sheen::deal-line>` | the usual price, struck; the end date |
| `SheenScoreBadge` | `<x-sheen::score>`, `<x-sheen::stars>` | guest score, hotel stars |
| `SheenPremiumCard` | `<x-sheen::hotel-card>` | a hotel in a row |
| `SheenTripCard`, `SheenTripTag` | `<x-sheen::trip-card>`, `<x-sheen::trip-tag>` | tours and cruises; `icons` shows what is included |
| what a trip includes | `<x-sheen::included>` | an icon and a name each, as the app's tour icons |
| `SheenChoice` | `<x-sheen::choices>`, `<x-sheen::choice>` | rooms, cabins, how to pay: native radios |
| `SheenItinerary` | `<x-sheen::itinerary>` | days of a tour, ports of a cruise |
| `SheenKeyValueCard` | `<x-sheen::key-value>` | facts and policies |
| `SheenListRow` | `<x-sheen::list-row>` | rows in a `.sheen-list` |
| `SheenActionBar` | `<x-sheen::action-bar>` | the floating price and action bar on phones |
| `SheenPhotoViewer` | `<x-sheen::photo-viewer>` | photos full screen with chips |
| text fields, steppers | `<x-sheen::field>`, `<x-sheen::stepper>`, `<x-sheen::check>` | forms |
| a choice from a list | `<x-sheen::picker>` | a currency, a country: a glass list with search, never the browser's own dropdown |
| a few choices at once | `<x-sheen::chip-choice>` | a document's kind, a child's age: chips that are native radios |
| `SheenBadge`, steps, alerts | `<x-sheen::pill>`, `<x-sheen::steps>`, `<x-sheen::alert>`, `<x-sheen::tabs>` | states |

Each component's file starts with a comment that documents its attributes.

### Pickers

`<x-sheen::picker>` replaces the browser's own dropdown. The field opens a glass list under it, with a search box
from eight options (`searchFrom`), popular values first (`popular`) and the chosen one ticked. `layout="sheet"` opens
a sheet in the middle for long lists; on phones every picker is a sheet from the bottom that rises with the keyboard.
`variant="pill"` makes the field a glass pill with an icon, for a filter over a page.

```blade
<x-sheen::picker label="Currency" name="code" :value="$code" :options="$currencies" :popular="['AED', 'USD', 'EUR']"
  popular-label="Popular" all-label="All currencies" search="Search currency or code" empty="No currency matches “@q”" />
```

A real `<select>` stays underneath. Without JavaScript it is the control; with it, the form sends the value and the
select fires `input` and `change`. The list is a `role="listbox"` driven from a `role="combobox"` search box:
↑ ↓, Page Up/Down, Enter and Esc work, and without a search box typing jumps to a name. The list opens in the top
layer (`popover`), so a dialog or a clipped parent never cuts it. Search ignores case and accents and also matches the
value and `keywords`. Pickers added after the page loaded are set up by `sheenWeb.initPickers()`; inside a Livewire
component, wrap one in `wire:ignore`.

When every choice fits on the screen, show them all instead: `<x-sheen::chip-choice>` draws chips that are native
radios.

### Focus on fields

The field shows focus, and the words inside it never get a box of their own.
- A `.sheen-field` gets a calm accent line, a soft glow and an accent label.
- A part of a glass bar, `.sheen-segment` (a search bar's where, dates and guests), lights up as its own pill. A button that opens the part's picker takes `.sheen-segment-trigger`.

Buttons and links keep their focus ring. With forced colors, the field or part gets a real outline.

## App elements (0.3.0)

For apps that are not Laravel sites, `dist/sheen-elements.js` adds framework-free custom elements. Load it after the
stylesheet (no build step):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Marzipane/sheen-web@v0.3.0/dist/sheen.min.css">
<script src="https://cdn.jsdelivr.net/gh/Marzipane/sheen-web@v0.3.0/dist/sheen-elements.min.js" defer></script>
```

The rules every element follows:
- It draws in the light DOM, so `sheen.css` styles it and your page can restyle it.
- It takes every word from its attributes, already translated; it never shows text of its own.
- It mirrors for `dir="rtl"`: positions use logical properties, and the arrow keys follow the reading direction.
- It follows light and dark through the tokens, and stops moving under `prefers-reduced-motion`.

Live stories for every element: `docs/elements.html` (open it from a local server or the demo site).

| Element | Use | Attributes · properties | Events | Keys |
| --- | --- | --- | --- | --- |
| `<sheen-glyph>` | a sheen icon or media glyph | `name`, `size`, `label` (without it: decorative) | | |
| `<sheen-progress-ring>` | round progress | `value` 0..1, `size`, `label`, `show-value`, `indeterminate` | | |
| `<sheen-drop-zone>` | drop or choose files | `label`, `hint`, `accept`, `multiple`, `glyph`, `disabled` | `sheen-files` {files} | Enter, Space |
| `<sheen-toaster>` | toast queue (aria-live) | `close-label`, `max`; `show(opts)`, `dismiss(id)` | | |
| `<sheen-command-palette>` | ⌘K command box | `label`, `placeholder`, `empty`, `submit-label` ("@q"), `hotkey`; `items`, `aside`, `open()`, `close()`, `value` | `sheen-select` {item, text}, `sheen-submit` {text}, `sheen-open`, `sheen-close` | ↑ ↓, Enter, Esc, ⌘K |
| `<sheen-video>` | player with scrubber | `src`, `poster`, `keys`, `play-label`, `pause-label`, `seek-label`, `mute-label`, `unmute-label`; `markers`, `inPoint`, `outPoint`, `seek(t)`, `play()`, `pause()` | `sheen-time` {time}, `sheen-inout` {in, out} | Space/K, J, L, I, O; on the scrubber ← → Home End |
| `<sheen-waveform>` | audio peaks as a seek slider | `duration`, `progress`, `label`; `peaks` | `sheen-seek` {time} | ← → (Shift: 1 s) |
| `<sheen-compare>` | before and after | `before`, `after`, `kind` (image, video), `position`, `label`, `before-label`, `after-label` | `sheen-change` {position} | ← → on the handle |
| `<sheen-timeline>` | simple multi-track timeline | `duration`, `playhead`, `label`, `zoom-in-label`, `zoom-out-label`, `split-label`; `tracks`, `splitAt(t)`, `setZoom(z)` | `sheen-seek`, `sheen-split`, `sheen-clipchange`, `sheen-clipdelete`, `sheen-select` | on a clip: Alt+← → trims the start, Shift+← → the end, S splits, Delete removes |
| `<sheen-transcript>` | text-based editing | `label`, `current`, `removed-label`, `follow`; `words`, `removeKind(kind)`, `toggleCut(indices)` | `sheen-seek` {time}, `sheen-edit` {removed, restored} | ← →, Shift to select, Delete, Enter |
| `<sheen-node-graph>` | node graph | `label`, `connect-label`, `connected-label`, `remove-label`; `nodes`, `edges`, `order()` | `sheen-graphchange` {nodes, edges}, `sheen-nodeopen` {node} | arrows move, C then Enter connects, Delete |
| `<sheen-tour>` | onboarding tour | `next-label`, `back-label`, `done-label`, `skip-label`, `step-label` ("@n of @all"); `steps`, `start()`, `stop()` | `sheen-tour-step` {index}, `sheen-tour-end` {completed} | Enter, Esc, Tab stays inside |

```html
<sheen-command-palette id="cmd" hotkey label="Command bar" placeholder="Type a command or search…"
                       empty="Nothing found" submit-label="Run “@q”"></sheen-command-palette>
<script>
  cmd.items = [{ group: 'Presets', label: 'Make shorts', hint: 'vertical clips', glyph: 'phone' },
               { group: 'AI', label: 'Write titles', glyph: 'sparkle', disabled: true, reason: 'Needs an AI provider' }];
  cmd.addEventListener('sheen-submit', (e) => plan(e.detail.text));
</script>

<sheen-transcript id="words" label="Transcript" removed-label="cut" follow></sheen-transcript>
<script>
  words.words = [{ text: 'So', start: 0, end: .4 }, { text: 'um', start: .4, end: .8, kind: 'filler' }];
  words.addEventListener('sheen-edit', (e) => save(e.detail.removed, e.detail.restored));
  removeFillers.onclick = () => words.removeKind('filler');
</script>

<sheen-timeline id="tl" duration="90" label="Timeline" zoom-in-label="Zoom in" zoom-out-label="Zoom out"
                split-label="Split at the playhead"></sheen-timeline>
<script>
  tl.tracks = [{ id: 'v', label: 'Video', kind: 'video', clips: [{ id: 'c1', start: 0, end: 90, label: 'Talk' }] },
               { id: 'a', label: 'Audio', kind: 'audio', peaks: [/* 0..1 */], clips: [] }];
</script>
```

`window.sheenElements` gives `version`, `glyph(name, size, label)`, `glyphNames()`, `fmtTime(seconds)` and
`toast({title, message, tone: 'info'|'success'|'warning'|'danger', timeout, action: {label, onClick}})`.
`paintRange(input)` sets a slider's `--sheen-range-fill`; you rarely need it, because every
`<input class="sheen-range">` on the page is painted by itself when it is added and while it moves.

### App UI classes

| Class | Use |
| --- | --- |
| `.sheen-shell`, `.sheen-rail`, `.sheen-rail-item`, `.sheen-main`, `.sheen-topbar`, `.sheen-search-trigger` | an app shell: a navigation rail (a bottom bar on phones), a glass top bar, a ⌘K button |
| `.sheen-panel` (+ `.sheen-glass`), `.sheen-panel-head`, `.sheen-glow` | glass panels with a soft accent glow on hover and focus |
| `.sheen-aurora` | a fixed, slowly moving gradient behind the page (`--sheen-aurora-a/b/c` set its colours) |
| `.sheen-dialog` (+ `-head`, `-body`, `-foot`, `.sheen-wide`) | a native `<dialog>` with a blurred page behind it |
| `.sheen-switch`, `.sheen-range` | a switch around `<input type="checkbox" role="switch">`; a range slider (`--sheen-range-fill`) |
| `.sheen-kbd`, `.sheen-shortcuts`, `.sheen-shortcut` | keys and a shortcut cheat sheet |
| `.sheen-empty` (+ `-glyph`, `-title`, `-actions`) | empty states |
| `.sheen-skeleton-line`, `-block`, `-circle` | skeleton loaders (with `.sheen-skeleton`) |
| `.sheen-stat` (+ `-label`, `-value`, `-note`), `.sheen-table`, `.sheen-badge` (`.sheen-ok`, `.sheen-warn`, `.sheen-bad`, `.sheen-run`), `.sheen-progress` | dashboards and job lists |
| `.sheen-toolbar`, `.sheen-swatch`, `.sheen-small-icon` | rows of controls, colour swatches (`style="--sheen-swatch:#F97316"`), 36 px icon buttons |
| `.sheen-chat`, `.sheen-msg-user`, `.sheen-msg-ai`, `.sheen-msg-note`, `.sheen-drawer` | a chat side panel |

## Tokens

| Flutter | CSS | Dark | Light |
| --- | --- | --- | --- |
| `background` | `--sheen-background` | `#05070B` | `#FAFAF8` |
| `surface` | `--sheen-surface` | `#0E1219` | `#FFFFFF` |
| `text` | `--sheen-text` | `#F5F6F8` | `#101318` |
| `accent` | `--sheen-accent` | `#1F6FEB` | `#0A5FE0` |
| `accentText` | `--sheen-accent-text` | `#6AA8FF` | `#0A5FE0` |

…and `surfaceMuted`, `track`, `separator`, `textSecondary`, `textTertiary`, `onAccent`, `success`, `warning`, `danger`,
`rating`, `sheet`, `dealFill`, `tonal`; spacing `--sheen-space-*`, radii `--sheen-radius-*`. Change the accent by
setting `--sheen-accent` and `--sheen-accent-text`.

## Develop

```bash
composer install
node build.mjs                         # tokens + src/ → dist/ and resources/icons.php
vendor/bin/phpunit                     # components and built files
npm ci && node --test tests/elements/  # the app elements, in jsdom
node scripts/check-flutter.mjs ../sheen  # tokens and icons against a Flutter sheen checkout
```

Release: bump `package.json` and `CHANGELOG.md`, then push a tag `vX.Y.Z`. GitHub Actions runs the tests, checks
`dist/`, creates the GitHub Release and updates the demo.

## License

MIT
