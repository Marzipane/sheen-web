{{-- A checkbox with its words (the terms gate). Other attributes go on the input. --}}
@props(['id' => null])
<label {{ $attributes->only('class')->class(['sheen-check']) }}><input type="checkbox" @if ($id) id="{{ $id }}" @endif {{ $attributes->except('class') }}><span>{{ $slot }}</span></label>
