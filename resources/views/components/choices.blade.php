{{-- A group of SheenChoice rows: a <fieldset> whose legend names the choice (visually hidden when the page already has
     a heading: hideLegend). --}}
@props(['legend', 'hideLegend' => false])
<fieldset {{ $attributes->class(['sheen-choices']) }}><legend @class(['sheen-visually-hidden' => $hideLegend, 'sheen-headline' => ! $hideLegend])>{{ $legend }}</legend>{{ $slot }}</fieldset>
