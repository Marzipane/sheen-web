{{-- A steps line: where a booking is. steps: list of words; current: the index of the current step (earlier ones are
     done). --}}
@props(['steps', 'current' => 0, 'label' => null])
<ol {{ $attributes->class(['sheen-steps']) }} @if ($label) aria-label="{{ $label }}" @endif>
@foreach ($steps as $i => $s)<li @class(['sheen-done' => $i < $current]) @if ($i === $current) aria-current="step" @endif>{{ $s }}</li> @endforeach
</ol>
