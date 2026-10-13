{{-- A hotel's stars, filled in the rating colour. label: "5 stars" in the site's language. --}}
@props(['count', 'label', 'size' => 13])
<span {{ $attributes->class(['sheen-stars']) }} role="img" aria-label="{{ $label }}">@for ($i = 0; $i < (int) $count; $i++)<x-sheen::icon name="star" :size="$size" filled />@endfor</span>
