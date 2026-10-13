{{-- The line under a price on a deal: the struck usual price, then the end note ("Ends Sun 18 Oct", "until 31 Oct").
     was, wasLabel, ends: already formatted and translated by the site. --}}
@props(['was', 'ends' => null, 'wasLabel' => null])
<span {{ $attributes->class(['sheen-card-deal']) }}><x-sheen::was-price :label="$wasLabel">{{ $was }}</x-sheen::was-price>@if ($ends) · <span class="sheen-deal-ends">{{ $ends }}</span>@endif</span>
