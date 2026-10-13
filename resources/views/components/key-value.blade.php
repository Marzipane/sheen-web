{{-- SheenKeyValueCard: label and value pairs, two columns on wide screens. rows: list of ['key' => 'Built',
     'value' => '2023', 'was' => null (a struck usual value under it)]. columns: 1 or 2. --}}
@props(['rows', 'columns' => 2])
<dl {{ $attributes->class(['sheen-key-value'])->merge(['style' => '--sheen-cols:'.(int) $columns.';']) }}>
@foreach ($rows as $r)<div><dt>{{ $r['key'] }}</dt><dd>{{ $r['value'] }}@if (! empty($r['was']))<x-sheen::was-price>{{ $r['was'] }}</x-sheen::was-price>@endif</dd></div>@endforeach
</dl>
