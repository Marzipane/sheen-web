{{-- SheenDealBadge: the deal's red capsule, such as "−15%". The words come from the site (translated); in a
     .sheen-photo it sits top start. small: the 22-pixel size. --}}
@props(['small' => false])
<span {{ $attributes->class(['sheen-deal-badge', 'sheen-small' => $small]) }}>{{ $slot }}</span>
