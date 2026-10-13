{{-- SheenChip: a filter, a month or a date. href makes it a link (aria-current when on); otherwise a toggle button
     (aria-pressed). on: chosen; tone: plain | deal | clear (over a photo); size: regular | small. --}}
@props(['href' => null, 'on' => false, 'tone' => 'plain', 'size' => 'regular', 'icon' => null])
@php($classes = ['sheen-chip', 'sheen-on' => $on && $href, 'sheen-deal' => $tone === 'deal', 'sheen-glass-clear' => $tone === 'clear', 'sheen-small' => $size === 'small'])
@if ($href)
<a href="{{ $href }}" @if ($on) aria-current="true" @endif {{ $attributes->class($classes) }}>@if ($icon)<x-sheen::icon :name="$icon" :size="15" :stroke="2.2" />@endif{{ $slot }}</a>
@else
<button type="button" aria-pressed="{{ $on ? 'true' : 'false' }}" {{ $attributes->class($classes) }}>@if ($icon)<x-sheen::icon :name="$icon" :size="15" :stroke="2.2" />@endif{{ $slot }}</button>
@endif
