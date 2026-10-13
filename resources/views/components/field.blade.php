{{-- A labelled text field (name, e-mail, phone, a note). The label sits inside the box, as in the app. error: the
     message under it (sets aria-invalid). multiline: a textarea. Other attributes go on the input. --}}
@props(['label', 'id' => null, 'error' => null, 'multiline' => false, 'hint' => null])
@php($fid = $id ?? 'f-'.substr(md5($label.($attributes->get('name') ?? '')), 0, 8))
<div>
<label for="{{ $fid }}" @class(['sheen-field', 'sheen-invalid' => $error])><span>{{ $label }}</span>
@if ($multiline)<textarea id="{{ $fid }}" @if ($error) aria-invalid="true" aria-describedby="{{ $fid }}-e" @endif {{ $attributes }}>{{ $slot }}</textarea>
@else<input id="{{ $fid }}" @if ($error) aria-invalid="true" aria-describedby="{{ $fid }}-e" @endif {{ $attributes->merge(['type' => 'text']) }}>@endif
</label>
@if ($error)<p class="sheen-field-error" id="{{ $fid }}-e">{{ $error }}</p>@elseif ($hint)<p class="sheen-footnote sheen-secondary" style="margin-top:4px">{{ $hint }}</p>@endif
</div>
