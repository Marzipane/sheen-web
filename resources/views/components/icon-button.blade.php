{{-- SheenIconButton: a 44-pixel round button with a glyph. label is required (screen readers, tooltip). href makes it
     a link; variant: tonal | clear (glass over a photo). --}}
@props(['icon', 'label', 'href' => null, 'variant' => 'tonal', 'filled' => false, 'pressed' => null])
@php($classes = ['sheen-icon-button', 'sheen-glass-clear' => $variant === 'clear'])
@if ($href)
<a href="{{ $href }}" aria-label="{{ $label }}" title="{{ $label }}" {{ $attributes->class($classes) }}><x-sheen::icon :name="$icon" :size="20" :filled="$filled" :stroke="2" /></a>
@else
<button type="button" aria-label="{{ $label }}" title="{{ $label }}" @if (! is_null($pressed)) aria-pressed="{{ $pressed ? 'true' : 'false' }}" @endif {{ $attributes->class($classes) }}><x-sheen::icon :name="$icon" :size="20" :filled="$filled" :stroke="2" /></button>
@endif
