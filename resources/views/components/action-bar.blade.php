{{-- SheenActionBar: the floating glass bar with the price and the action, inset from the sides. phoneOnly: shown only
     under 1100 pixels, where the page's side booking card is gone. Slot "text": the price lines; slot: the button. --}}
@props(['phoneOnly' => true, 'label' => null])
<div {{ $attributes->class(['sheen-action-bar', 'sheen-glass', 'sheen-phone-only' => $phoneOnly]) }} @if ($label) role="region" aria-label="{{ $label }}" @endif>
<span class="sheen-action-bar-text">{{ $text ?? '' }}</span>{{ $slot }}
</div>
