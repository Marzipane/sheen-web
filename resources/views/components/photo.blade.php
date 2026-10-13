{{-- A rounded photo box (4:3 unless the page sizes it) that holds a deal badge, a save button and a tag.
     src null shows the placeholder glyph (placeholder: compass, ship, bed…). Slot: overlays. --}}
@props(['src' => null, 'alt' => '', 'placeholder' => 'image', 'eager' => false, 'as' => 'span'])
<{{ $as }} {{ $attributes->class(['sheen-photo']) }}>@if ($src)<img src="{{ $src }}" alt="{{ $alt }}" @if ($eager) fetchpriority="high" @else loading="lazy" decoding="async" @endif>@else<span class="sheen-photo-placeholder"><x-sheen::icon :name="$placeholder" :size="40" :stroke="1.6" /></span>@endif{{ $slot }}</{{ $as }}>
