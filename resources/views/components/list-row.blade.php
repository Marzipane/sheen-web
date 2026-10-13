{{-- SheenListRow: a row in a .sheen-list: an optional glyph, a title and a subtitle, a value at the end; a link when
     href is set (a chevron then shows the way, mirrored in right to left). --}}
@props(['href' => null, 'icon' => null, 'title', 'subtitle' => null, 'value' => null])
@php($tag = $href ? 'a' : 'div')
<{{ $tag }} @if ($href) href="{{ $href }}" @endif {{ $attributes->class(['sheen-list-row']) }}>
@if ($icon)<x-sheen::icon :name="$icon" :size="22" />@endif 
<span class="sheen-list-row-text"><span>{{ $title }}</span> @if ($subtitle)<span class="sheen-footnote sheen-secondary">{{ $subtitle }}</span>@endif</span>
@if ($value)<span class="sheen-list-row-value">{{ $value }}</span>@endif{{ $slot }}
@if ($href)<span class="sheen-tertiary sheen-flip-rtl" style="display:inline-flex" aria-hidden="true"><x-sheen::icon name="chevron" :size="18" :stroke="2.2" /></span>@endif 
</{{ $tag }}>
