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
`variant="pill"` makes the field a glass pill with an icon, for a filter over a page. A page that a framework draws
(Angular, plain HTML) uses `<sheen-select>` from the elements instead (0.8.0): it wraps a native select the same way,
at the dense app size, with multiple choice and a clear button.

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

A text input or textarea never draws a focus ring, keyboard or not: its caret shows the focus, and the words inside a
field never get a box of their own.
- A select on its own has no caret, so it rings after Tab like a button.
- Inside a `.sheen-field` or `.sheen-control`, a select or a picker button draws no box of its own: the field rings
  around it after Tab. A `.sheen-field` also turns its label to the accent while it has focus (0.7.0: without the line
  and glow it had before).
- A picker's glass pill rings after Tab only, never on a press or while its list is open; an open picker takes the
  tonal fill, as an open control does.
- A part of a glass bar, `.sheen-segment` (a search bar's where, dates and guests), lights up as its own pill. A button that opens the part's picker takes `.sheen-segment-trigger`.

Buttons, links, tabs, selects and menu items draw their thin focus ring only while the keyboard navigates: Tab or
Shift+Tab marks `<html data-sheen-keyboard>`, and the next press clears it (0.7.0). sheen.js and the elements both set
this up and mark the page `<html data-sheen-focus>`; a page with neither keeps the browser's own `:focus-visible` rings.
With forced colors, the system outline marks focus after a press too: on a field or part, and on the dense menu item
the arrows reach (0.7.1).

## App elements (0.3.0, record kit 0.4.0)

For apps that are not Laravel sites, `dist/sheen-elements.js` adds framework-free custom elements. Load it after the
stylesheet (no build step):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Marzipane/sheen-web@v0.7.1/dist/sheen.min.css">
<script src="https://cdn.jsdelivr.net/gh/Marzipane/sheen-web@v0.7.1/dist/sheen-elements.min.js" defer></script>
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
| `<sheen-toaster>` | toast queue (aria-live) | `close-label`, `max`, `position="top"` (Flutter sheen's toast: under the app bar at the end edge, the action as a link, a close button only keyboard focus shows, a press closes it; `--sheen-toaster-top`, `--sheen-toaster-end`, `--sheen-toaster-size`); `show(opts)` with `glyph` in place of the tone's dot, `dismiss(id)` | | Esc closes a toast |
| `<sheen-command-palette>` | ⌘K command box | `label`, `placeholder`, `empty`, `submit-label` ("@q"), `hotkey`; `items`, `aside`, `open()`, `close()`, `value` | `sheen-select` {item, text}, `sheen-submit` {text}, `sheen-open`, `sheen-close` | ↑ ↓, Enter, Esc, ⌘K |
| `<sheen-video>` | player with scrubber | `src`, `poster`, `keys`, `play-label`, `pause-label`, `seek-label`, `mute-label`, `unmute-label`; `markers`, `inPoint`, `outPoint`, `seek(t)`, `play()`, `pause()` | `sheen-time` {time}, `sheen-inout` {in, out} | Space/K, J, L, I, O; on the scrubber ← → Home End |
| `<sheen-waveform>` | audio peaks as a seek slider | `duration`, `progress`, `label`; `peaks` | `sheen-seek` {time} | ← → (Shift: 1 s) |
| `<sheen-compare>` | before and after | `before`, `after`, `kind` (image, video), `position`, `label`, `before-label`, `after-label` | `sheen-change` {position} | ← → on the handle |
| `<sheen-timeline>` | simple multi-track timeline | `duration`, `playhead`, `label`, `zoom-in-label`, `zoom-out-label`, `split-label`; `tracks`, `splitAt(t)`, `setZoom(z)` | `sheen-seek`, `sheen-split`, `sheen-clipchange`, `sheen-clipdelete`, `sheen-select` | on a clip: Alt+← → trims the start, Shift+← → the end, S splits, Delete removes |
| `<sheen-transcript>` | text-based editing | `label`, `current`, `removed-label`, `follow`; `words`, `removeKind(kind)`, `toggleCut(indices)` | `sheen-seek` {time}, `sheen-edit` {removed, restored} | ← →, Shift to select, Delete, Enter |
| `<sheen-node-graph>` | node graph | `label`, `connect-label`, `connected-label`, `remove-label`; `nodes`, `edges`, `order()` | `sheen-graphchange` {nodes, edges}, `sheen-nodeopen` {node} | arrows move, C then Enter connects, Delete |
| `<sheen-tour>` | onboarding tour | `next-label`, `back-label`, `done-label`, `skip-label`, `step-label` ("@n of @all"); `steps`, `start()`, `stop()` | `sheen-tour-step` {index}, `sheen-tour-end` {completed} | Enter, Esc, Tab stays inside |
| `<sheen-hover-card>` | facts and actions beside a link | `label`, `delay` (ms, `0` for none); `attach(trigger)`, `detach()`, `open()`, `close()` | `sheen-hover-open` {trigger}, `sheen-hover-close` | on the trigger Space opens; Esc closes from anywhere while open; Tab out closes |
| `<sheen-side-panel>` | a panel on the end edge; with `modal` it dims the page behind it | `label`, `close-label`, `heading` (the title and the close button on one row; the element marks the panel `sheen-headed`), `class="sheen-small"` (400px, for filters and editors), `class="sheen-wide"` (440px from `--sheen-size-panel-wide`; with `sheen-small`, the dense content at 440px; 0.8.0), `modal` (the page dims, a press on the dim closes it), `--sheen-panel-size`; `open()`, `close()` | `sheen-panel-close` | Esc closes and returns focus to the first opener; with `modal`, Tab stays inside and focus that lands outside comes back |
| `<sheen-scope-picker>` | chooses a rule, not a list: a segmented bar of the modes, a chip per pick, groups with their counts, the result over its hint (0.10.0) | `label`, `all-label`, `chosen-label`, `except-label`, `search-label`, `empty-label`, `result`, `hint` (0.10.0), `remove-label` (a chip's name, "@label"), `loading-label`, `error-label`, `delay` (ms before a later ask, 250), `select-shown-label` (adds "Select all shown"); `groups` [{id, label, items, total}] (`total`: members in all, for a group loaded in part), `value` (only the list its mode reads) | `sheen-scope-change` {mode, include, exclude}; `sheen-scope-query` {query, signal, respond}: a handler that calls `respond(groups)` or `respond(promise)` during the event, or calls `preventDefault()` and answers after an await, takes the search over | arrows move the mode; Space ticks; focus stays on the ticked row; Enter in the search asks again after an error |
| `<sheen-menu-button>` | a button with a keyboard menu | `label`, `glyph`, `variant="control"` (the find row's 36px control; square with a glyph), `variant="text"` (a table cell's words, for a picker in a cell; 0.8.0), `variant="pill"` with `tone="success\|warning\|danger"` (a status pill, 22px in a small table; 0.8.0), `icon` (a glyph before the label), `chevron`, `compact`, `class="sheen-small"` (the dense menu; `--sheen-menu-min-size`, `--sheen-menu-max-size`), `class="sheen-xsmall"` (the 32px button of a bulk bar), `class="sheen-compact"` with a glyph (the 30px row •••); `items` [{id, label, disabled, hint, shortcut, danger, glyph, accent}, {separator: true}, {heading}], `open()`, `close()` | `sheen-menu-select` {id} | ↓ opens, ↑ ↓ move, Enter picks, Esc closes; a press outside or Tab out closes |
| `<sheen-select>` (0.8.0) | a select whose list follows the theme and Arabic | wraps your `<select>`, which stays the form control (`name`, `multiple`, `required`, `disabled` or a fieldset's, reset, FormData); `placeholder`, `label` (the name when no `<label>` names the select), `search` (a search box in the list; its placeholder and name), `empty` (the line while the search matches nothing), `clear` (a clear button; its name), `remove` (a chip mark's tooltip, "@label"), `variant="control"` (the 36px control of a Filters panel), `data-hint` on an option, `data-meta` (0.9.1: a short text at the row's end, such as a count); with no inner select, `name`, `multiple` and `required` make one and `options` [{value, label, disabled, hint, meta, group}] fills it; `select`, `value`, `values`, `open()`, `close()`, `sync()`, `clear()` | `input` then `change` on the native select, for a person's choice only; `blur` when focus leaves the field | ↓ ↑ Enter Space Alt+↓ open, Home End open on the ends, letters jump; open: ↑ ↓ Home End PageUp PageDown move, Enter or Space picks (multiple: toggles), Alt+↑ picks and closes, Esc closes, Tab moves on; closed: Delete clears (`clear`), Backspace removes the last chip (`multiple`) |
| `<sheen-lookup>` (0.9.0) | a select whose options the page brings per query, for lists too long to load (an API search) | `<sheen-select>`'s field, list, chips, clear, looks and native select, with a search box always; `name`, `multiple`, `required`, `placeholder`, `label`, `search`, `clear`, `remove`, `variant="control"` as there; `delay` (ms the typing pauses before an ask, 250), `loading`, `empty`, `error`, `retry`, `more` ("@count", "@total"); `options` (the answer to the current ask), `chosen` [{value, label}] (the choice with its labels, kept when an answer lacks it), `select`, `value`, `values`, `open()`, `close()`, `clear()` | `sheen-lookup-query` {query, signal, respond(answer)}; `input` then `change` on the native select, for a person's choice only | as `<sheen-select>`; while an ask is out, Enter and Alt+Up pick nothing (Alt+Up still closes a list with nothing to pick); Enter asks again after an error |
| `<sheen-date-field>` (0.8.0) | a date field around your `<input type="date">`, which stays the form value (ISO `yyyy-mm-dd`) | `placeholder`, `label`, `prev`, `next`, `clear`, `variant="control"`, `compact`, `first-day` (1 Monday … 7 Sunday), `weekdays` (seven names from Monday), `today`; `input`, `value`, `open()`, `close()`, `sync()` | `input` and `change` on the native input; `blur` when focus leaves the field | ↓ opens; arrows by day and week, PageUp/PageDown by month (Shift: year), Home/End, Enter or Space picks, Esc closes; Tab stays inside |
| `<sheen-date-range>` (0.8.0) | a range around two `<input type="date">` | as the date field, plus `from`, `to`, `apply`, `cancel`, `note`, `custom`; `presets` [{label, start, end}], `inputs`, `value` {start, end} | `input` and `change` on each native input that changed | as the date field; the second pick sets the end, an earlier one swaps them |
| `<sheen-avatar>` (0.8.0) | a person's initials in a circle (Flutter sheen's `SheenAvatar`) | `name` (the initials and the tint), `letters` (how many words give a letter; 2), `tint-key` (picks the tint in place of the name), `size` (`s` 30px, `xs` 18px; 40px without), `image` (covers the initials once it loads), `label` (without it: decorative); `.sheen-avatar-name` sets it beside a `<b>` name and a `<small>` second line | | |

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

### Select and date fields (0.8.0)

Put the element around the select or date input you already have, and bind that control as before (Angular's
`formControlName`, a `(change)` handler). The element draws the field and its popup from the tokens, light or dark,
mirrored in Arabic; the native control stays the form value, and setting it by property redraws the field without
events. Without the elements script the native control shows as it is.

```html
<label class="sheen-form-field sheen-small"><span>Area</span>
  <sheen-select placeholder="All areas" search="Search areas" empty="No matches" clear="Clear">
    <select name="area" required>
      <option value="">All areas</option>
      <optgroup label="North"><option value="b">Old Town</option><option value="m" data-hint="2 teams">Riverside</option></optgroup>
      <option value="d" disabled>Downtown</option>
    </select>
  </sheen-select>
</label>

<label class="sheen-form-field sheen-small"><span>From</span>
  <sheen-date-field placeholder="Pick a date" prev="Previous month" next="Next month">
    <input type="date" name="from" min="2026-01-01">
  </sheen-date-field>
</label>

<span class="sheen-avatar-name">
  <sheen-avatar name="Maria Santos" size="s" letters="1" tint-key="p-1024"></sheen-avatar>
  <span><b>Maria Santos</b><small>Downtown</small></span>
</span>
```

The date field formats with `Intl` for the nearest `lang`: month and weekday names and digits are the locale's
(`lang="ar-u-nu-latn"` keeps Western digits in Arabic), and `today` takes the day from your server. The same avatar name
or `tint-key` gives the same tint here and in a Flutter sheen app, and white initials reach 4.5:1 on every tint.

### Lookup: a select searched by the page (0.9.0)

For a list too long to load whole (customers, addresses, 10 000 rows behind an API), `<sheen-lookup>` asks the page for
the options that match what the person typed and shows the answer. It is the select of 0.8.0 in every other way: the
same field, list, keys, chips and native select, so a form binds it as it binds a select.

```html
<label class="sheen-form-field sheen-small"><span>Customer</span>
  <sheen-lookup name="customer" placeholder="Any customer" search="Search customers" loading="Searching…"
    empty="No matches" error="Couldn't load the customers" retry="Try again" more="@count of @total shown. Type to narrow"
    clear="Clear"></sheen-lookup>
</label>
<script>
  const lookup = document.querySelector('sheen-lookup');
  lookup.addEventListener('sheen-lookup-query', (e) => {
    const { query, signal, respond } = e.detail;
    respond(fetch('/api/customers?search=' + encodeURIComponent(query) + '&pageSize=20', { signal })
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((page) => ({ total: page.total, options: page.items.map((c) => ({ value: c.id, label: c.name, hint: c.phone })) })));
  });
  lookup.chosen = [{ value: 'c-1024', label: 'Maria Santos' }];   // an edit form's stored value, before any search
</script>
```

Opening asks for `""` at once; typing asks once the person pauses for `delay` ms. A newer ask aborts the older one's
`signal` and the element drops a late answer, so a slow reply never replaces a newer one. A promise that rejects shows
`error` and a `retry` button. The options you send are the rows: the element filters nothing, so match on whatever the
server likes (names, phones, codes, Arabic without its marks). The chosen options stay in the native select when an
answer lacks them, and the chips keep the order they were chosen in. Answer every ask: until an answer comes the
spinner turns and Enter picks nothing, so a page that skips a query (one too short to send) answers it with `[]`.

Glyph names are the Flutter sheen icons, the media glyphs and, from 0.7.0, the filled Flutter sheen icons as
`<name>-fill` (`check-circle-fill`), drawn filled in the text colour; `alert` is a warning triangle.

`window.sheenElements` gives `version`, `glyph(name, size, label)`, `glyphNames()`, `fmtTime(seconds)` and
`toast({title, message, tone: 'info'|'success'|'warning'|'danger', timeout, action: {label, onClick}})`.
`paintRange(input)` sets a slider's `--sheen-range-fill`; you rarely need it, because every
`<input class="sheen-range">` on the page is painted by itself when it is added and while it moves.

### List kit classes

The parts a long list or table is built from (0.6.0). Layout and look only: the app keeps the filters, the selection and the
work, and fills in its own words.

```html
<div class="sheen-list-kit">
  <div class="sheen-views-row">
    <div class="sheen-view-tabs" role="tablist">
      <button class="sheen-view-tab" role="tab" aria-selected="true">All <small>10</small></button>
      <button class="sheen-view-tab" role="tab" aria-selected="false">Active <small>9</small></button>
    </div>
    <div class="sheen-views-end"><button class="sheen-link-button">Save view</button><sheen-menu-button label="Views"></sheen-menu-button></div>
  </div>
  <div class="sheen-find-row" role="search">
    <label class="sheen-control sheen-find"><input type="search" placeholder="Search"><kbd class="sheen-kbd">/</kbd></label>
    <button class="sheen-control sheen-compact-glyph" aria-haspopup="dialog"><span>Filters</span><span class="sheen-control-count">2</span></button>
  </div>
  <div class="sheen-applied-row" aria-live="polite">
    <span class="sheen-filter-chip"><span>Hub</span><b>North</b><button class="sheen-chip-remove" aria-label="Remove this filter">…</button></span>
    <button class="sheen-link-button">Clear all</button>
    <span class="sheen-result-count">4 results</span>
  </div>
</div>
<div class="sheen-table-wrap">
  <div class="sheen-bulk-bar" role="region" aria-label="Bulk actions">
    <span class="sheen-bulk-count"><b>3</b> selected</span> <button class="sheen-link-button">Select all 10</button>
    <span class="sheen-bulk-actions">…</span> <button class="sheen-link-button sheen-bulk-clear">Clear</button>
  </div>
  <table class="sheen-table">…<th aria-sort="ascending"><button class="sheen-sort-button">Name <svg class="sheen-sort-glyph">…</svg></button></th>…
    <td class="sheen-pin-end"><sheen-menu-button glyph="more" label="Row actions"></sheen-menu-button></td></table>
</div>
```

| Class | What it is |
| --- | --- |
| `.sheen-list-kit` | the column the three rows sit in; a container, so the rows fold at 760px of its own width |
| `.sheen-views-row`, `.sheen-view-tabs`, `.sheen-view-tab` (`small` count), `.sheen-views-end` | quick filters as tabs with counts, saved views at the end (a menu button there opens 320px to 360px wide; a class rule on that button or an inline `--sheen-menu-min-size` or `--sheen-menu-max-size` wins) |
| `.sheen-find-row`, `.sheen-control`, `.sheen-find`, `.sheen-control-count`, `.sheen-compact-glyph` | one wide search and compact 36px controls; a compact control keeps only its glyph and count when narrow |
| `.sheen-applied-row`, `.sheen-filter-chip`, `.sheen-chip-remove`, `.sheen-last-used`, `.sheen-result-count` | one removable chip per filter, Clear all and the count; narrow, chips scroll and the count stays |
| `.sheen-link-button` | a text button for small steps: Save view, Clear all, Select all |
| `.sheen-page-tabs` (with `.sheen-view-tab` links, `aria-current="page"`) | a module's page tab row |
| `.sheen-cell-button` (`.sheen-strong`), `tr[tabindex]` | a cell value that opens or edits in place; a row the keyboard reaches |
| `.sheen-filter-group`, `.sheen-filter-field`, `.sheen-filter-option`, `.sheen-filter-footer` | the filters inside a `<sheen-side-panel>`, with a sticky footer (on the bottom edge of a panel with `heading`); a ticked option is tinted |
| `.sheen-control.sheen-on` | a control whose filters are on: its fill tinted and its glyph in the accent (no ring; an open control takes the tonal fill) |
| `.sheen-table-card`, `.sheen-table.sheen-small`, `.sheen-table[aria-busy="true"]` | a table on an 18px surface card (with `.sheen-table-wrap` it still scrolls sideways); the dense app table with a tinted header row and 16px checkboxes (`.sheen-wrap` for long sentences); a busy table drawn as one placeholder block |
| `.sheen-list-message`, `.sheen-list-message-actions` (`.sheen-danger` for an error) | nothing matches, or the results couldn't load |
| `.sheen-sort-button`, `.sheen-sort-glyph` on `th[aria-sort]` | a sortable header; the arrow sits in the end padding |
| `.sheen-pin-end`, `.sheen-truncate`, `tr[aria-selected="true"]` | the row-menu column pinned at the end edge, one-line cells, a ticked row |
| `.sheen-end` on a `th` or `td` (0.8.0) | the words and a sort button at the end edge, mirrored in Arabic; with `.sheen-num`, a number column |
| `.sheen-compact` on a `.sheen-icon-button` or a `<sheen-menu-button glyph>` (0.8.0) | the 30px row •••: radius 9, no fill, an 18px secondary glyph, the tonal fill when hovered or open; a small table row stays 51px |
| `.sheen-table.sheen-small.sheen-tight` (0.8.0) | 9px at a cell's sides for a table with many columns; the pinned ••• cell keeps 4px |
| `.sheen-bulk-bar`, `.sheen-bulk-count`, `.sheen-bulk-actions`, `.sheen-bulk-status` (`.sheen-danger`), `.sheen-bulk-clear`, `.sheen-bulk-spin` | the bar over the table header while rows are ticked, with progress and partial failure |

### App UI classes

| Class | Use |
| --- | --- |
| `.sheen-shell`, `.sheen-rail`, `.sheen-rail-item`, `.sheen-main`, `.sheen-topbar`, `.sheen-search-trigger` | an app shell: a navigation rail (a bottom bar on phones), a glass top bar, a ⌘K button |
| `.sheen-sidebar-shell`, `.sheen-sidebar`, `.sheen-sidebar-nav`, `.sheen-sidebar-item`, `.sheen-app-main`, `.sheen-app-bar`, `.sheen-app-content` | an app shell with a labelled sidebar, for record-heavy apps; under 760px the sidebar stacks over the page, or opens as a drawer from the start edge when the shell's bar holds a `.sheen-nav-button` |
| `.sheen-nav-button` (`aria-controls` = the sidebar's id, `aria-expanded`, `aria-label`) | in the shell's `.sheen-app-bar`, under 760px: opens the sidebar as a drawer; Esc, the dim or a link closes it and focus goes back to the button. Needs sheen.js or the elements; either one works (0.7.1) |
| `.sheen-auth-page`, `.sheen-auth-card`, `.sheen-form-field`, `.sheen-input`, `.sheen-form-error` | a small centred sign-in page |
| `.sheen-panel` (+ `.sheen-glass`), `.sheen-panel-head`, `.sheen-glow` | glass panels with a soft accent glow on hover and focus |
| `.sheen-aurora` | a fixed, slowly moving gradient behind the page (`--sheen-aurora-a/b/c` set its colours) |
| `.sheen-dialog` (+ `-head`, `-body`, `-foot`, `.sheen-wide`) | a native `<dialog>` with a blurred page behind it |
| `.sheen-switch`, `.sheen-range` | a switch around `<input type="checkbox" role="switch">`; a range slider (`--sheen-range-fill`) |
| `.sheen-kbd`, `.sheen-shortcuts`, `.sheen-shortcut` | keys and a shortcut cheat sheet |
| `sheen-command-palette.sheen-small`, `.sheen-dialog.sheen-small`, `.sheen-shortcuts.sheen-small` (+ `-head`, `-note`), `.sheen-keys` | the 560px app palette; a 720px sheet with shortcuts in three columns (one when narrow) |
| `.sheen-form-field.sheen-small`, `.sheen-fields.sheen-small`, `.sheen-wide`, `.sheen-select` | dense form fields two to a row (`.sheen-wide` across both) with a hint and an invalid state; a select drawn as a field |
| `.sheen-affix`, `.sheen-affix-unit` (0.8.0) | in a dense field: a unit after the input's value ("30 min") inside the field's box at the end edge (a prefix when written before the input); a press on the unit focuses the input; an invalid input rings the whole box |
| `.sheen-button.sheen-danger` (0.8.0) | a step that takes something away: the deal fill under white words, 4.5:1 in light and dark; the hover darkens the fill |
| `.sheen-button.sheen-xsmall` (0.8.0) | a 32px button for a bulk bar's actions, 13px words and 14px glyphs |
| `.sheen-dialog.sheen-small.sheen-confirm` (0.8.0) | a 440px sheet 14% down the window that asks before a risky step: the question, the record (a `.sheen-pill`), the words (a `<p>`) and 34px buttons at the end edge, 10px apart; put the first focus on the safe button |
| `.sheen-panel-foot` | a side panel's Cancel and main action on its bottom edge, side by side or stacked when narrow; a long body scrolls under it |
| `.sheen-switch.sheen-large`, `.sheen-switch-row` | a 51 by 31 switch; words and a switch on one row over a hairline |
| `tr.sheen-table-group`, `.sheen-table-foot`, `.sheen-pager` | a table's group row with its count; the count and a pager under a table |
| `.sheen-empty` (+ `-glyph`, `-title`, `-actions`) | empty states |
| `.sheen-status` (+ `-glyph`, `-title`, `-actions`, a `small` note; `.sheen-danger`, `.sheen-warning`, `.sheen-success`) | Flutter sheen's SheenStatusScreen: a glyph in a 72px circle of its tone, a title, short words, up to two actions stacked; a page that is empty, failed, offline or closed to you |
| `.sheen-page-title` | an app page's title (26px) |
| `.sheen-focus-only` | a part only keyboard users meet: out of sight until it has focus |
| `.sheen-page-head` (+ `-text`, `-actions`), `.sheen-page-crumbs`, `.sheen-page-subtitle` | an app page's header: crumbs, the title and a line with room for a pill, the actions at the end edge on the bottom line (under the words when narrow) |
| `.sheen-solid` | on a layer or any box around it (the body): menus, toasts, the command palette, side panels and hover cards on the opaque sheet; modal layers dim with a plain shade |
| `.sheen-skeleton-line`, `-block`, `-circle` | skeleton loaders (with `.sheen-skeleton`) |
| `.sheen-stat` (+ `-label`, `-value`, `-note`; a note takes `.sheen-success`, `.sheen-warning`, `.sheen-danger`), `.sheen-table`, `.sheen-badge` (`.sheen-ok`, `.sheen-warn`, `.sheen-bad`, `.sheen-run`), `.sheen-progress` | dashboards and job lists |
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
`rating`, `sheet`, `dealFill`, `tonal`; spacing `--sheen-space-*`, radii `--sheen-radius-*`, and the app bar's block
size `--sheen-size-app-bar` (60px; web only). From 0.8.0, web only too: `--sheen-space-min` (8px), the least room
between two boxes the kit lays out, so none sits flush against another; every kit layout gap between boxes is at least
this much, and changing the token moves them all. `--sheen-size-field` (38px) and `--sheen-size-control` (36px) are the
dense field and the find row's control, shared by the select, the date fields and the affix; the other app parts' sizes
are `--sheen-size-<part>` from tokens.json. The avatar tints are `--sheen-tint-blue`, `-red`, `-green`, `-orange`,
`-purple`, `-teal`, `-violet` and `-gray` (Flutter sheen's `SheenTint`, the same in both themes). Motion springs are `--sheen-motion-*` (duration and easing), each with
its duration alone as `--sheen-motion-*-duration` (0.7.1), for a delay that waits out a transition. A top toaster under the app bar takes
`--sheen-toaster-top: calc(var(--sheen-size-app-bar) + var(--sheen-space-m))`. Change the accent by
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
