{{-- SheenScoreBadge: a guest score on the accent ("4.7"). label: what a screen reader says ("4.7 out of 5"). --}}
@props(['label' => null, 'large' => false])
<span {{ $attributes->class(['sheen-score', 'sheen-large' => $large]) }} @if ($label) role="img" aria-label="{{ $label }}" @endif>{{ $slot }}</span>
