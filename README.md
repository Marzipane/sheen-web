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
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Marzipane/sheen-web@v0.1.1/dist/sheen.min.css">
<script src="https://cdn.jsdelivr.net/gh/Marzipane/sheen-web@v0.1.1/dist/sheen.min.js" defer></script>
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
| `SheenTripCard`, `SheenTripTag` | `<x-sheen::trip-card>`, `<x-sheen::trip-tag>` | tours and cruises |
| `SheenChoice` | `<x-sheen::choices>`, `<x-sheen::choice>` | rooms, cabins, how to pay: native radios |
| `SheenItinerary` | `<x-sheen::itinerary>` | days of a tour, ports of a cruise |
| `SheenKeyValueCard` | `<x-sheen::key-value>` | facts and policies |
| `SheenListRow` | `<x-sheen::list-row>` | rows in a `.sheen-list` |
| `SheenActionBar` | `<x-sheen::action-bar>` | the floating price and action bar on phones |
| `SheenPhotoViewer` | `<x-sheen::photo-viewer>` | photos full screen with chips |
| text fields, steppers | `<x-sheen::field>`, `<x-sheen::stepper>`, `<x-sheen::check>` | forms |
| `SheenBadge`, steps, alerts | `<x-sheen::pill>`, `<x-sheen::steps>`, `<x-sheen::alert>`, `<x-sheen::tabs>` | states |

Each component's file starts with a comment that documents its attributes.

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
node scripts/check-flutter.mjs ../sheen  # tokens and icons against a Flutter sheen checkout
```

Release: bump `package.json` and `CHANGELOG.md`, then push a tag `vX.Y.Z`. GitHub Actions runs the tests, checks
`dist/`, creates the GitHub Release and updates the demo.

## License

MIT
