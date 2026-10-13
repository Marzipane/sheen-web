{{-- A hotel in a row (SheenPremiumCard on the web): the photo with an optional deal badge and save button, the name,
     the score, a line under the name and the total. Every word arrives translated and formatted.
     deal: ['badge' => '−15%', 'was' => 'AED 1,422.17', 'ends' => 'Ends Sun 18 Oct'] or null.
     save: the save button's label, or null for none; the button sits beside the link (never inside it), over the
     photo, with data-sheen-save for the page's own script; saved: whether it is pressed. --}}
@props(['href', 'name', 'photo' => null, 'score' => null, 'scoreLabel' => null, 'line' => null, 'price', 'per' => null, 'deal' => null, 'save' => null, 'saved' => false])
@if ($save)<div class="sheen-hotel-card-wrap">@endif
<a href="{{ $href }}" {{ $attributes->class(['sheen-hotel-card']) }}>
<x-sheen::photo :src="$photo" :alt="$name" placeholder="bed">@if ($deal)<x-sheen::deal-badge>{{ $deal['badge'] }}</x-sheen::deal-badge>@endif</x-sheen::photo>
<span class="sheen-card-text">
<span class="sheen-row" style="justify-content:space-between;--sheen-gap:10px"><b class="sheen-card-title sheen-ellipsis" dir="auto">{{ $name }}</b> @if ($score)<x-sheen::score :label="$scoreLabel">{{ $score }}</x-sheen::score>@endif</span>
@if ($line)<span class="sheen-card-meta sheen-ellipsis" dir="auto">{{ $line }}</span>@endif 
<span class="sheen-price">{{ $price }} @if ($per)<small>{{ $per }}</small>@endif</span>
@if ($deal)<x-sheen::deal-line :was="$deal['was']" :ends="$deal['ends'] ?? null" :was-label="$deal['was_label'] ?? null" />@endif 
</span></a>
@if ($save)<button type="button" class="sheen-save sheen-glass-clear" data-sheen-save aria-pressed="{{ $saved ? 'true' : 'false' }}" aria-label="{{ $save }}"><x-sheen::icon name="heart" :size="19" :stroke="2" /></button></div>@endif
