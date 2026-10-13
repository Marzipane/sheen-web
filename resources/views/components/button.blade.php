{{-- SheenButton / SheenPrimaryButton. href makes it a link. prominent: the accent glass (one per view);
     size: small | regular | large; expand: full width; icon: a glyph before the label. --}}
@props(['href' => null, 'prominent' => false, 'size' => 'regular', 'expand' => false, 'icon' => null, 'type' => 'button'])
@php($classes = ['sheen-button', 'sheen-glass-prominent' => $prominent, 'sheen-small' => $size === 'small', 'sheen-large' => $size === 'large', 'sheen-expand' => $expand])
@if ($href)
<a href="{{ $href }}" {{ $attributes->class($classes) }}>@if ($icon)<x-sheen::icon :name="$icon" :size="18" :stroke="2.2" />@endif{{ $slot }}</a>
@else
<button type="{{ $type }}" {{ $attributes->class($classes) }}>@if ($icon)<x-sheen::icon :name="$icon" :size="18" :stroke="2.2" />@endif{{ $slot }}</button>
@endif
