{{-- SheenTripCard: a tour or a cruise in a row. eyebrow: the operator or the ship; title (two lines at most); facts:
     "6 days · Turkey"; price: "from AED 3,001" or "Price on request" (then per is null); tag: the cruise line at the
     photo's foot; cruise: the ship placeholder. deal: ['badge' => '−5%', 'was' => 'AED 3,159', 'ends' => 'until 31 Oct'].
     icons: what is included, as the app's tour card shows it: [['icon' => 'bed', 'label' => 'Hotels'], …]. --}}
@props(['href', 'title', 'eyebrow' => null, 'facts' => null, 'price', 'per' => null, 'photo' => null, 'tag' => null, 'deal' => null, 'cruise' => false, 'icons' => []])
<a href="{{ $href }}" {{ $attributes->class(['sheen-trip-card']) }}>
<x-sheen::photo :src="$photo" alt="" :placeholder="$cruise ? 'ship' : 'compass'">@if ($deal)<x-sheen::deal-badge>{{ $deal['badge'] }}</x-sheen::deal-badge>@endif @if ($tag)<x-sheen::trip-tag>{{ $tag }}</x-sheen::trip-tag>@endif</x-sheen::photo>
<span class="sheen-card-text">
@if ($eyebrow)<span class="sheen-card-eyebrow sheen-ellipsis" dir="auto">{{ $eyebrow }}</span>@endif 
<span class="sheen-card-title sheen-lines-2" dir="auto">{{ $title }}</span>
@if ($facts)<span class="sheen-card-meta">{{ $facts }}</span>@endif 
@if ($icons)<x-sheen::included :items="$icons" compact />@endif 
<span class="sheen-price">{{ $price }} @if ($per)<small>{{ $per }}</small>@endif</span>
@if ($deal)<x-sheen::deal-line :was="$deal['was']" :ends="$deal['ends'] ?? null" :was-label="$deal['was_label'] ?? null" />@endif 
</span></a>
