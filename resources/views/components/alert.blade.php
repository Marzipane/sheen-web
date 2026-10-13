{{-- A message in the page (never a pop-up): tone plain | success | warning | danger, an optional glyph. --}}
@props(['tone' => 'plain', 'icon' => null])
<div {{ $attributes->class(['sheen-alert', 'sheen-'.$tone => $tone !== 'plain']) }} @if ($tone === 'danger') role="alert" @else role="status" @endif>
@if ($icon)<x-sheen::icon :name="$icon" :size="20" />@endif<div style="min-width:0">{{ $slot }}</div></div>
