{{-- SheenIcon: a Flutter sheen glyph. name: the glyph; size: pixels; filled: the filled set; label: for screen readers
     (omit when the control around it has one). --}}
@props(['name', 'size' => 22, 'filled' => false, 'stroke' => 1.8, 'label' => null])
{!! app(\Marzipane\SheenWeb\Icons::class)->svg($name, $size, (bool) $filled, (float) $stroke, $label) !!}
