{{-- A state in words: "Confirmed", "Price ready". tone: plain | success | warning | danger | info (0.11.0). --}}
@props(['tone' => 'plain'])
<span {{ $attributes->class(['sheen-pill', 'sheen-'.$tone => $tone !== 'plain']) }}>{{ $slot }}</span>
