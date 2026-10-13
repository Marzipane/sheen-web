{{-- Segmented tabs as links: items is a list of ['href' => …, 'label' => …, 'current' => bool]. --}}
@props(['items', 'label'])
<nav {{ $attributes->class(['sheen-tabs']) }} aria-label="{{ $label }}">@foreach ($items as $it)<a href="{{ $it['href'] }}" @if ($it['current'] ?? false) aria-current="page" @endif>{{ $it['label'] }}</a> @endforeach</nav>
