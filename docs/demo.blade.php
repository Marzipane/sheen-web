<!doctype html>
<html lang="en" dir="{{ $dir }}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>sheen-web</title>
<meta name="description" content="The glass design system of Flutter sheen for the web: tokens, glass and Blade components.">
<link rel="stylesheet" href="sheen.min.css"><script src="sheen.min.js" defer></script>
<style>
.demo-hero{position:relative;border-radius:32px;overflow:hidden;padding:clamp(24px,5vw,56px);background:radial-gradient(120% 140% at 10% 0%,#2a5bd7 0,#0c1a3a 45%,#05070b 100%);color:#fff}
.demo-hero::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(115deg,rgba(255,255,255,.05) 0 2px,transparent 2px 22px)}
.demo-hero>*{position:relative}
.demo-sec{margin-top:64px}
.demo-sec h2{margin-bottom:16px}
.demo-photo{background:linear-gradient(135deg,#3a7bd5,#00d2ff 60%,#9be15d)}
.demo-photo.b{background:linear-gradient(135deg,#f7971e,#ffd200)}
.demo-photo.c{background:linear-gradient(135deg,#654ea3,#eaafc8)}
</style></head>
<body class="sheen">
<header class="sheen-container" style="padding-block:16px"><div class="sheen-glass" style="height:64px;border-radius:32px;display:flex;align-items:center;gap:8px;padding-inline:22px 10px">
<b style="font-size:19px">sheen-web</b><span class="sheen-secondary sheen-footnote" style="margin-inline-start:10px">0.1.1</span>
<span style="margin-inline-start:auto;display:flex;gap:8px"><x-sheen::button href="?dir={{ $dir === 'rtl' ? 'ltr' : 'rtl' }}" size="small" onclick="document.documentElement.dir=document.documentElement.dir==='rtl'?'ltr':'rtl';return false">RTL / LTR</x-sheen::button>
<x-sheen::button href="https://github.com/Marzipane/sheen-web" prominent size="small">GitHub</x-sheen::button></span></div></header>
<main class="sheen-container" style="padding-block:24px 96px">
<section class="demo-hero"><p class="sheen-subhead" style="opacity:.85">The glass design system of Flutter sheen, for the web</p>
<h1 class="sheen-display" style="margin-top:8px">Frosted glass, same tokens</h1>
<div class="sheen-row sheen-wrap" style="margin-top:28px;--sheen-gap:10px">
<x-sheen::chip tone="clear" on>All dates</x-sheen::chip><x-sheen::chip tone="clear">Jun 2027</x-sheen::chip><x-sheen::chip tone="deal" on icon="tag">Deals · 3</x-sheen::chip>
<x-sheen::button prominent icon="search">Search</x-sheen::button><x-sheen::icon-button icon="heart" label="Save" variant="clear" /></div></section>

<section class="demo-sec"><h2 class="sheen-title">Cards with deals</h2>
<div class="sheen-grid sheen-scroll-s" style="--sheen-cols:3">
<x-sheen::hotel-card href="#" name="Palace Hotel" score="4.7" score-label="4.7 out of 5" line="Near the old town" price="AED 2,493.72" per="total · 2 nights" :deal="['badge' => '−10%', 'was' => 'AED 2,770.80', 'ends' => 'Ends Wed 21 Oct']" class="demo-a" />
<x-sheen::trip-card href="#" title="Six days of old cities and coastlines" eyebrow="A tour operator" facts="6 days · Turkey" price="from AED 3,001" per="a person" :deal="['badge' => '−5%', 'was' => 'AED 3,159', 'ends' => 'until 31 Oct']" />
<x-sheen::trip-card href="#" title="Nine nights from Istanbul to Rome: islands, temples and harbours" eyebrow="A ship" facts="9 nights · from Istanbul" price="Price on request" tag="Cruise line" cruise />
</div></section>

<section class="demo-sec"><h2 class="sheen-title">Choices with a round mark</h2>
<x-sheen::choices legend="Cabins" hide-legend>
<x-sheen::choice name="cabin" value="inside" checked :media="true" placeholder="bed"><b>Inside</b><span class="sheen-footnote sheen-secondary" style="display:block">160–254 sq ft · 2–4 guests</span><x-slot:end><b class="sheen-num">AED 17,036.98</b><x-sheen::was-price>AED 18,929.98</x-sheen::was-price></x-slot:end></x-sheen::choice>
<x-sheen::choice name="cabin" value="balcony" :media="true" placeholder="bed"><b>Balcony</b><span class="sheen-footnote sheen-secondary" style="display:block">231–358 sq ft · 2–4 guests</span><x-slot:end><b class="sheen-num">AED 23,157.03</b></x-slot:end></x-sheen::choice>
<x-sheen::choice name="cabin" value="suite" disabled :media="true" placeholder="bed"><b>Suite</b><span class="sheen-footnote sheen-secondary" style="display:block">Not sold on this sailing</span></x-sheen::choice>
</x-sheen::choices></section>

<section class="demo-sec" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:40px">
<div><h2 class="sheen-title">Itinerary</h2>
<x-sheen::itinerary :stops="[['marker' => '1', 'title' => 'Istanbul', 'sub' => 'Turkey', 'time' => '— → 5:00 PM'], ['marker' => '2', 'title' => 'Kusadasi', 'sub' => 'Turkey', 'time' => '1:00 PM → 9:00 PM'], ['marker' => '3', 'title' => 'At sea', 'quiet' => true], ['marker' => '4', 'title' => 'Valletta', 'sub' => 'Malta', 'time' => '11:00 AM → 9:00 PM']]" /></div>
<div><h2 class="sheen-title">Facts and forms</h2>
<x-sheen::key-value :columns="1" :rows="[['key' => 'Built', 'value' => '2023'], ['key' => 'Guests', 'value' => '3,099'], ['key' => 'Double room', 'value' => 'AED 3,053.51', 'was' => 'AED 3,214.22']]" />
<div class="sheen-stack" style="margin-top:20px">
<div class="sheen-row" style="justify-content:space-between"><span>Adults</span><x-sheen::stepper name="adults" :value="2" :min="1" :max="9" label="Adults" fewer="Fewer adults" more="More adults" /></div>
<x-sheen::field label="E-mail" name="email" type="email" placeholder="you@example.com" />
<x-sheen::check name="terms" checked>I have read the cancellation terms</x-sheen::check>
<x-sheen::steps :steps="['Price asked', 'Price ready', 'Confirming', 'Confirmed']" :current="1" label="Booking state" />
<div class="sheen-row sheen-wrap"><x-sheen::pill tone="warning">Price ready</x-sheen::pill><x-sheen::pill tone="success">Confirmed</x-sheen::pill><x-sheen::score>4.7</x-sheen::score><x-sheen::stars :count="5" label="5 stars" /></div>
</div></div></section>
</main>
<x-sheen::action-bar :phone-only="false" label="Price" style="max-width:520px;margin-inline:auto">
<x-slot:text><b class="sheen-num" style="font-size:18px">AED 17,037 <x-sheen::was-price class="sheen-caption">AED 18,930</x-sheen::was-price></b><span class="sheen-caption sheen-secondary">from · a person</span></x-slot:text>
<x-sheen::button prominent>Ask for a price</x-sheen::button></x-sheen::action-bar>
</body></html>
