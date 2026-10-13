{{-- A state in words: "Confirmed", "Price ready". tone: plain | success | warning | danger. --}}
@props(['tone' => 'plain'])
<span {{ $attributes->class(['sheen-pill', 'sheen-'.$tone => $tone !== 'plain']) }}>{{ $slot }}</span>
