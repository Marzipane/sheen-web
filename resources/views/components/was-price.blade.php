{{-- SheenWasPrice: the price before a deal, struck through. Only next to the price with the deal, and only when it is
     the same stay without the deal. label: how a screen reader says it ("was AED 3,159"). --}}
@props(['label' => null])
<s {{ $attributes->class(['sheen-was-price']) }} @if ($label) aria-label="{{ $label }}" @endif>{{ $slot }}</s>
