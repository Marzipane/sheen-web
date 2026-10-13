{{-- A number with − and + buttons (travellers, rooms). The input carries name, min, max and any wire:model; the
     buttons disable at the bounds (sheen.js). fewer/more: the buttons' labels; label: what is counted. --}}
@props(['name', 'value' => 0, 'min' => 0, 'max' => 9, 'label', 'fewer', 'more', 'input' => []])
<div {{ $attributes->class(['sheen-stepper']) }} data-sheen-stepper role="group" aria-label="{{ $label }}">
<button type="button" data-sheen-step="-1" aria-label="{{ $fewer }}" @disabled($value <= $min)><x-sheen::icon name="minus" :size="18" :stroke="2.2" /></button>
<input type="number" inputmode="numeric" name="{{ $name }}" value="{{ $value }}" min="{{ $min }}" max="{{ $max }}" aria-label="{{ $label }}" @foreach ($input as $k => $v) {{ $k }}="{{ $v }}" @endforeach>
<button type="button" data-sheen-step="1" aria-label="{{ $more }}" @disabled($value >= $max)><x-sheen::icon name="plus" :size="18" :stroke="2.2" /></button>
</div>
