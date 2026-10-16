{{-- A few choices shown at once as chips (a document's kind, a child's age): native radios, so arrows move between
     them and the form sends the value. legend: what is chosen (hideLegend when the page already says it); name;
     options: [value => text]; value: the chosen one; size: regular | small; input: attributes for every radio
     (wire:model, form). --}}
@props(['legend', 'name', 'options' => [], 'value' => null, 'hideLegend' => false, 'size' => 'regular', 'input' => []])
<fieldset {{ $attributes->class(['sheen-chip-choice']) }}><legend @class(['sheen-visually-hidden' => $hideLegend])>{{ $legend }}</legend>
<div class="sheen-chip-row">@foreach ($options as $v => $text)<label @class(['sheen-chip', 'sheen-small' => $size === 'small'])><input type="radio" name="{{ $name }}" value="{{ $v }}" @checked($value !== null && (string) $value === (string) $v) @foreach ($input as $k => $a) {{ $k }}="{{ $a }}" @endforeach>{{ $text }}</label>
@endforeach</div>
</fieldset>
