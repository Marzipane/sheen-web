{{-- SheenChoice: one row of a choice (rooms, cabins, how to pay): a native radio with a round mark, never a chevron.
     name/value/checked/disabled: the radio's. media: a photo URL (or true for the placeholder) with mediaCount photos;
     viewer/viewerGroup: open that SheenPhotoViewer on this row's photos; mediaLabel: the photo button's label.
     Slot: the words; slot "end": the price column. Any wire:model or x-model goes on the radio via "input". --}}
@props(['name', 'value', 'checked' => false, 'disabled' => false, 'media' => null, 'mediaCount' => null, 'mediaLabel' => null, 'viewer' => null, 'viewerGroup' => 0, 'placeholder' => 'bed', 'input' => []])
<label {{ $attributes->class(['sheen-choice', 'sheen-has-media' => ! is_null($media)]) }}>
<input type="radio" name="{{ $name }}" value="{{ $value }}" @checked($checked) @disabled($disabled) @foreach ($input as $k => $v) {{ $k }}="{{ $v }}" @endforeach>
@if (! is_null($media))
@if ($viewer && is_string($media))
<button type="button" class="sheen-choice-media" data-sheen-viewer="{{ $viewer }}" data-sheen-group="{{ $viewerGroup }}" aria-label="{{ $mediaLabel }}"><img src="{{ $media }}" alt="" loading="lazy">@if ($mediaCount)<b>{{ $mediaCount }}</b>@endif</button>
@else
<span class="sheen-choice-media" aria-hidden="true">@if (is_string($media))<img src="{{ $media }}" alt="" loading="lazy">@else<x-sheen::icon :name="$placeholder" :size="24" :stroke="1.7" />@endif</span>
@endif
@endif
<span style="min-width:0">{{ $slot }}</span>
@isset($end)<span class="sheen-choice-end">{{ $end }}</span>@endisset
</label>
