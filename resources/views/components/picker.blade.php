{{-- SheenPicker: one choice from a list (a currency, a country). It opens a glass list under the field, with a search
     box when the list is long, and a sheet from the bottom on phones. A real <select> stays underneath: without
     JavaScript it is the control; with it, the form still sends the value and the select still fires "change".
     label: what is chosen; name; value: the chosen value; options: [value => text] or [value => ['label' => …,
     'badge' => 'AED', 'hint' => '$', 'keywords' => 'other names to find it by']]; placeholder: an empty first option,
     shown until something is chosen; popular: values listed first under popularLabel, the rest under allLabel;
     search: the search box's label, shown from searchFrom options; empty: the words when nothing matches (@q is what
     was typed); close: the close button's label on the sheet; variant: field | pill (a glass pill with an icon, for a
     filter over a page); layout: menu (under the field) | sheet (in the middle, for long lists). select: attributes
     for the <select> (wire:model, data-*, required). Inside a Livewire component, wrap it in wire:ignore. --}}
@props(['label', 'name', 'options' => [], 'value' => null, 'placeholder' => null, 'popular' => [], 'popularLabel' => null, 'allLabel' => null, 'search' => null, 'empty' => null, 'close' => null, 'searchFrom' => 8, 'variant' => 'field', 'layout' => 'menu', 'icon' => null, 'id' => null, 'select' => []])
@php
    $pid = $id ?? 'p-'.substr(md5($label.$name), 0, 8);
    $rows = [];
    foreach ($options as $v => $o) {
        $o = is_array($o) ? $o : ['label' => $o];
        $o['label'] = (string) ($o['label'] ?? $v);
        $o['text'] = isset($o['badge']) && $o['badge'] !== '' ? $o['badge'].' · '.$o['label'] : $o['label'];
        $rows[(string) $v] = $o;
    }
    $chosen = $value !== null && isset($rows[(string) $value]) ? $rows[(string) $value] : null;
    $searchable = $search && count($rows) >= $searchFrom;
@endphp
<div {{ $attributes->class(['sheen-picker']) }} data-sheen-picker data-layout="{{ $layout }}" @if ($popular) data-popular="{{ implode(',', $popular) }}" @endif @if ($popularLabel) data-label-popular="{{ $popularLabel }}" @endif @if ($allLabel) data-label-all="{{ $allLabel }}" @endif>
<label for="{{ $pid }}" @class(['sheen-picker-field sheen-field' => $variant === 'field', 'sheen-picker-pill sheen-glass' => $variant === 'pill'])>
@if ($variant === 'pill')@if ($icon)<x-sheen::icon :name="$icon" :size="19" :stroke="1.9" />@endif<span id="{{ $pid }}-l" class="sheen-visually-hidden">{{ $label }}</span>
@else<span id="{{ $pid }}-l">{{ $label }}</span>@endif
<select id="{{ $pid }}" name="{{ $name }}" @foreach ($select as $k => $v) {{ $k }}@if ($v !== true)="{{ $v }}"@endif @endforeach>
@if ($placeholder !== null)<option value="" disabled @selected(! $chosen)>{{ $placeholder }}</option>@endif
@foreach ($rows as $v => $o)<option value="{{ $v }}" @selected($chosen && (string) $value === (string) $v) @isset($o['badge']) data-badge="{{ $o['badge'] }}" data-label="{{ $o['label'] }}" @endisset @isset($o['hint']) data-hint="{{ $o['hint'] }}" @endisset @isset($o['keywords']) data-keywords="{{ $o['keywords'] }}" @endisset>{{ $o['text'] }}</option>@endforeach
</select>
<button type="button" class="sheen-picker-trigger" id="{{ $pid }}-t" aria-haspopup="listbox" aria-expanded="false" aria-controls="{{ $pid }}-pop" aria-labelledby="{{ $pid }}-l {{ $pid }}-v"><span id="{{ $pid }}-v" @unless ($chosen) class="sheen-picker-placeholder" @endunless>{{ $chosen ? $chosen['text'] : $placeholder }}</span><x-sheen::icon name="chevron-down" :size="16" :stroke="2.4" /></button>
</label>
<template class="sheen-picker-template"><div class="sheen-picker-pop" id="{{ $pid }}-pop" role="dialog" aria-labelledby="{{ $pid }}-l" popover="manual" hidden>
<div class="sheen-picker-title"><b>{{ $label }}</b>@if ($close)<button type="button" class="sheen-icon-button sheen-picker-close" aria-label="{{ $close }}"><x-sheen::icon name="close" :size="18" :stroke="2.2" /></button>@endif</div>
@if ($searchable)<label class="sheen-picker-search"><x-sheen::icon name="search" :size="18" :stroke="2.2" /><input type="text" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="{{ $pid }}-list" aria-label="{{ $search }}" placeholder="{{ $search }}" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done"></label>@endif
<ul class="sheen-picker-list" id="{{ $pid }}-list" role="listbox" aria-labelledby="{{ $pid }}-l" tabindex="{{ $searchable ? '-1' : '0' }}"></ul>
<p class="sheen-picker-empty" role="status" @if ($empty) data-label="{{ $empty }}" @endif hidden></p>
</div></template>
</div>
