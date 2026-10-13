{{-- SheenItinerary: a tour's days or a cruise's ports on a line that joins numbered marks.
     stops: list of ['marker' => '1', 'title' => 'Istanbul', 'sub' => 'Turkey', 'time' => '1:00 PM → 9:00 PM',
     'body' => 'A day's description', 'quiet' => false (a day at sea)]. --}}
@props(['stops'])
<ol {{ $attributes->class(['sheen-itinerary']) }}>
@foreach ($stops as $s)
<li @class(['sheen-quiet' => $s['quiet'] ?? false])><span class="sheen-itinerary-marker">{{ $s['marker'] }}</span>
<span style="display:flex;flex-direction:column;min-width:0"><span class="sheen-itinerary-title"><bdi>{{ $s['title'] }}</bdi></span>@if (! empty($s['sub']))<span class="sheen-itinerary-sub">{{ $s['sub'] }}</span>@endif @if (! empty($s['body']))<span class="sheen-itinerary-body">{{ $s['body'] }}</span>@endif</span>
<span class="sheen-itinerary-time">{{ $s['time'] ?? '' }}</span></li>
@endforeach
</ol>
