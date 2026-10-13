{{-- SheenGlass: a glass surface for navigation and controls. variant: regular (over the page), clear (over a photo),
     prominent (the accent fill). as: the element. --}}
@props(['variant' => 'regular', 'as' => 'div'])
@php($class = ['regular' => 'sheen-glass', 'clear' => 'sheen-glass-clear', 'prominent' => 'sheen-glass-prominent'][$variant] ?? 'sheen-glass')
<{{ $as }} {{ $attributes->class([$class]) }}>{{ $slot }}</{{ $as }}>
