{{-- SheenIncluded: what a trip includes, each an icon with its name (the app's tour icons). items: [['icon' => 'bed',
     'label' => 'Hotels'], …]; compact: icons only, the name for screen readers and on pointing (a card). --}}
@props(['items' => [], 'compact' => false])
<span {{ $attributes->class(['sheen-included', 'sheen-included-compact' => $compact]) }} role="list">@foreach ($items as $it)<span class="sheen-included-item" role="listitem" @if ($compact) title="{{ $it['label'] }}" @endif><x-sheen::icon :name="$it['icon']" :size="$compact ? 15 : 16" :stroke="2" :label="$compact ? $it['label'] : null" />@unless ($compact)<span>{{ $it['label'] }}</span>@endunless</span>@endforeach</span>
