<?php

namespace Marzipane\SheenWeb\Tests\Feature;

use InvalidArgumentException;
use Marzipane\SheenWeb\Icons;
use Marzipane\SheenWeb\Tests\TestCase;

class ComponentsTest extends TestCase
{
    public function test_every_component_has_a_doc_comment_first(): void
    {
        $dir = __DIR__.'/../../resources/views/components';
        $files = glob($dir.'/*.blade.php');
        $this->assertGreaterThanOrEqual(25, count($files));
        foreach ($files as $f) {
            $this->assertStringStartsWith('{{--', file_get_contents($f), basename($f).' needs a {{-- … --}} doc comment first');
        }
    }

    public function test_components_carry_no_words_of_their_own(): void
    {
        // every word on screen comes from the site (translated); a component that renders text itself fails here
        $html = $this->render(<<<'B'
<x-sheen::trip-card href="/t" title="Qa" eyebrow="Qb" facts="Qc" price="Qd" per="Qe" photo="/p.webp" tag="Qf" :deal="['badge' => 'Qg', 'was' => 'Qh', 'ends' => 'Qi']" :icons="[['icon' => 'bed', 'label' => 'Qal']]" />
<x-sheen::included :items="[['icon' => 'car', 'label' => 'Qam']]" />
<x-sheen::hotel-card href="/h" name="Qj" score="Qk" line="Ql" price="Qm" per="Qn" :deal="['badge' => 'Qo', 'was' => 'Qp', 'ends' => 'Qq']" />
<x-sheen::stepper name="adults" :value="2" label="Qr" fewer="Qs" more="Qt" />
<x-sheen::photo-viewer id="v" :groups="[]" close="Qu" previous="Qv" next="Qw" />
<x-sheen::icon-button icon="heart" label="Qx" />
<x-sheen::list-row href="/x" title="Qy" subtitle="Qz" value="Qaa" />
<x-sheen::steps :steps="['Qab', 'Qac']" :current="1" />
<x-sheen::picker label="Qad" name="c" :options="['a' => 'Qae']" value="a" search="Qaf" empty="Qag" close="Qah" :search-from="1" />
<x-sheen::chip-choice legend="Qai" name="k" :options="['p' => 'Qaj', 'v' => 'Qak']" />
B);
        $words = $this->words($html);
        $this->assertSame('', trim(preg_replace('/Q[a-z]+|·/', '', $words)), 'only the words given: '.$words);
        // neighbouring texts are separated, so screen readers do not run them together
        $this->assertDoesNotMatchRegularExpression('/Q[a-z]+Q/', $words);
    }

    public function test_hotel_card_save_is_a_button_beside_the_link_not_inside_it(): void
    {
        $html = $this->render('<x-sheen::hotel-card href="/h" name="Raffles" price="AED 1" save="Save Raffles" :saved="true" />');

        $this->assertStringContainsString('<div class="sheen-hotel-card-wrap">', $html);
        $this->assertMatchesRegularExpression('#</a>\s*<button type="button" class="sheen-save sheen-glass-clear" data-sheen-save aria-pressed="true" aria-label="Save Raffles">#', $html);
        $this->assertDoesNotMatchRegularExpression('#<a [^>]*>(?:(?!</a>).)*<button#s', $html);

        $plain = $this->render('<x-sheen::hotel-card href="/h" name="Raffles" price="AED 1" />');
        $this->assertStringNotContainsString('sheen-save', $plain);
        $this->assertStringNotContainsString('sheen-hotel-card-wrap', $plain);
    }

    public function test_trip_card_shows_the_deal_like_hotels(): void
    {
        $html = $this->render('<x-sheen::trip-card href="/en/tours/1" title="Istanbul and Ephesus" price="from AED 3,001" per="a person" photo="/t.webp" :deal="$d" />',
            ['d' => ['badge' => '−5%', 'was' => 'AED 3,159', 'ends' => 'until 31 Oct', 'was_label' => 'was AED 3,159']]);
        $this->assertStringContainsString('<span class="sheen-deal-badge">−5%</span>', $html);
        $this->assertMatchesRegularExpression('#<s class="sheen-was-price"\s+aria-label="was AED 3,159"\s*>AED 3,159</s>#', $html);
        $this->assertStringContainsString('<span class="sheen-deal-ends">until 31 Oct</span>', $html);
        // the badge sits in the photo box (top start), not in the text
        $this->assertMatchesRegularExpression('#class="sheen-photo">.*sheen-deal-badge#s', $html);
    }

    public function test_trip_card_shows_what_is_included_as_icons_named_for_screen_readers(): void
    {
        $html = $this->render('<x-sheen::trip-card href="/t" title="Tour" price="from AED 1" :icons="$i" />',
            ['i' => [['icon' => 'bed', 'label' => 'Hotels'], ['icon' => 'car', 'label' => 'Transport']]]);
        $this->assertStringContainsString('class="sheen-included sheen-included-compact"', $html);
        $this->assertSame(2, substr_count($html, 'class="sheen-included-item"'));
        $this->assertStringContainsString('title="Hotels"', $html);
        $this->assertStringContainsString('aria-label="Transport"', $html);
        // the full list names each one in words
        $full = $this->render('<x-sheen::included :items="$i" />', ['i' => [['icon' => 'bed', 'label' => 'Hotels']]]);
        $this->assertStringContainsString('<span>Hotels</span>', $full);
        $this->assertStringNotContainsString('title=', $full);
        // no icons, nothing drawn
        $this->assertStringNotContainsString('sheen-included', $this->render('<x-sheen::trip-card href="/t" title="Tour" price="x" />'));
    }

    public function test_trip_card_without_a_photo_draws_the_placeholder_glyph(): void
    {
        $html = $this->render('<x-sheen::trip-card href="/c" title="Cruise" price="Price on request" cruise />');
        $this->assertStringContainsString('sheen-photo-placeholder', $html);
        $this->assertStringNotContainsString('<img', $html);
        $this->assertStringNotContainsString('sheen-deal-badge', $html);
    }

    public function test_choice_is_a_native_radio_with_the_page_wiring(): void
    {
        $html = $this->render('<x-sheen::choice name="fare" value="IX" checked media="/c.webp" :media-count="2" viewer="photos" :viewer-group="1" media-label="Photos of Inside" :input="[\'wire:model.live\' => \'fare\']">Inside<x-slot:end>AED 17,036.98</x-slot:end></x-sheen::choice>');
        $this->assertMatchesRegularExpression('#<input type="radio" name="fare" value="IX"\s+checked\s+wire:model.live="fare"#', $html);
        $this->assertStringContainsString('data-sheen-viewer="photos" data-sheen-group="1" aria-label="Photos of Inside"', $html);
        $this->assertStringContainsString('<span class="sheen-choice-end">AED 17,036.98</span>', $html);
        $this->assertStringNotContainsString('chevron', $html);
    }

    public function test_stepper_disables_at_its_bounds(): void
    {
        $low = $this->render('<x-sheen::stepper name="c" :value="0" :min="0" :max="4" label="Children" fewer="Fewer" more="More" />');
        $this->assertMatchesRegularExpression('#data-sheen-step="-1" aria-label="Fewer"\s+disabled#', $low);
        $this->assertDoesNotMatchRegularExpression('#data-sheen-step="1" aria-label="More"\s+disabled#', $low);
        $high = $this->render('<x-sheen::stepper name="c" :value="4" :min="0" :max="4" label="Children" fewer="Fewer" more="More" />');
        $this->assertMatchesRegularExpression('#data-sheen-step="1" aria-label="More"\s+disabled#', $high);
    }

    public function test_key_value_keeps_a_style_given_by_the_page(): void
    {
        $html = $this->render('<x-sheen::key-value :rows="[[\'key\' => \'Built\', \'value\' => \'2023\']]" :columns="1" style="margin-top:8px" />');
        $this->assertMatchesRegularExpression('#style="--sheen-cols:1;\s*margin-top:8px;?"#', $html);
    }

    public function test_itinerary_isolates_names_and_times_for_right_to_left(): void
    {
        $html = $this->render('<x-sheen::itinerary :stops="$s" />', ['s' => [
            ['marker' => '1', 'title' => 'Istanbul', 'sub' => 'تركيا', 'time' => '— → 5:00 PM'],
            ['marker' => '2', 'title' => 'At sea', 'quiet' => true],
        ]]);
        $this->assertStringContainsString('<bdi>Istanbul</bdi>', $html);
        $this->assertStringContainsString('<span class="sheen-itinerary-time">— → 5:00 PM</span>', $html);
        $this->assertStringContainsString('class="sheen-quiet"', $html);
    }

    public function test_photo_viewer_embeds_its_photos_safely(): void
    {
        $html = $this->render('<x-sheen::photo-viewer id="ph" :groups="$g" close="Close" previous="Back" next="Next" of="Photo @n of @all" />',
            ['g' => [['label' => 'Ship </script><b>', 'photos' => [['src' => '/a.webp', 'alt' => 'Ship']]]]]);
        $this->assertStringContainsString('data-label-of="Photo @n of @all"', $html);
        $this->assertStringNotContainsString('</script><b>', $html);
        $this->assertStringContainsString('</script>', $html);
    }

    public function test_icons_are_flutter_sheen_glyphs_and_a_typo_throws(): void
    {
        $icons = app(Icons::class);
        foreach (['ship', 'compass', 'heart', 'tag', 'calendar', 'people', 'search'] as $n) {
            $this->assertTrue($icons->has($n), $n);
        }
        $this->assertStringContainsString('aria-hidden="true"', $icons->svg('ship'));
        $this->assertStringContainsString('role="img" aria-label="Ship"', $icons->svg('ship', label: 'Ship'));
        $this->expectException(InvalidArgumentException::class);
        $icons->svg('shipp');
    }

    public function test_icon_buttons_need_a_label(): void
    {
        $html = $this->render('<x-sheen::icon-button icon="share" label="Share" />');
        $this->assertStringContainsString('aria-label="Share"', $html);
        $this->expectException(\Throwable::class);
        $this->render('<x-sheen::icon-button icon="share" />');
    }

    public function test_field_wires_its_error_for_screen_readers(): void
    {
        $html = $this->render('<x-sheen::field label="E-mail" name="email" type="email" id="em" error="Write a valid e-mail." />');
        $this->assertStringContainsString('<label for="em"', $html);
        $this->assertMatchesRegularExpression('#<input id="em"\s+aria-invalid="true" aria-describedby="em-e"#', $html);
        $this->assertStringContainsString('<p class="sheen-field-error" id="em-e">Write a valid e-mail.</p>', $html);
    }

    public function test_picker_keeps_a_native_select_and_draws_its_list_from_it(): void
    {
        $html = $this->render('<x-sheen::picker id="cur" label="Currency" name="code" :options="$o" value="USD" :popular="[\'AED\', \'USD\']" popular-label="Popular" all-label="All currencies" search="Search currency" empty="No currency like @q" :select="[\'data-pick\' => true, \'required\' => true]" />',
            ['o' => ['AED' => ['label' => 'UAE Dirham', 'badge' => 'AED', 'hint' => 'د.إ'], 'USD' => ['label' => 'US Dollar', 'badge' => 'USD', 'keywords' => 'dollar america'], 'EUR' => 'Euro']]);

        // the select carries the name, the page's attributes and every option; the chosen one is selected
        $this->assertMatchesRegularExpression('#<select id="cur" name="code"\s+data-pick\s+required\s*>#', $html);
        $this->assertMatchesRegularExpression('#<option value="USD" selected\s+data-badge="USD" data-label="US Dollar"\s+data-keywords="dollar america"\s*>USD · US Dollar</option>#', $html);
        $this->assertStringContainsString('<option value="EUR"  >Euro</option>', preg_replace('/\s+>/', '  >', $html));
        // the trigger names the field and says what is chosen
        $this->assertMatchesRegularExpression('#aria-labelledby="cur-l cur-v"><span id="cur-v"\s*>USD · US Dollar</span>#', $html);
        $this->assertStringContainsString('data-popular="AED,USD"', $html);
        $this->assertMatchesRegularExpression('#data-label-popular="Popular"\s+data-label-all="All currencies"#', $html);
        // three options are fewer than eight: no search box; the list itself takes the keys
        $this->assertStringNotContainsString('role="combobox"', $html);
        $this->assertStringContainsString('role="listbox" aria-labelledby="cur-l" tabindex="0"', $html);
        $this->assertStringContainsString('data-label="No currency like @q"', $html);
    }

    public function test_a_long_picker_gets_a_search_box_and_a_placeholder_until_chosen(): void
    {
        $o = [];
        foreach (range(1, 9) as $i) {
            $o['C'.$i] = 'Country '.$i;
        }
        $html = $this->render('<x-sheen::picker id="pp" label="Your passport" name="passport" :options="$o" placeholder="Choose" search="Search country" variant="pill" icon="passport" layout="sheet" close="Close" />', ['o' => $o]);
        $this->assertStringContainsString('<option value="" disabled selected>Choose</option>', $html);
        $this->assertMatchesRegularExpression('#<span id="pp-v"\s+class="sheen-picker-placeholder"\s*>Choose</span>#', $html);
        $this->assertMatchesRegularExpression('#<input type="text" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="pp-list" aria-label="Search country"#', $html);
        $this->assertStringContainsString('class="sheen-picker-pill sheen-glass"', $html);
        $this->assertStringContainsString('<span id="pp-l" class="sheen-visually-hidden">Your passport</span>', $html);
        $this->assertStringContainsString('data-layout="sheet"', $html);
        $this->assertStringContainsString('aria-label="Close"', $html);
    }

    public function test_chip_choice_is_native_radios_in_a_fieldset(): void
    {
        $html = $this->render('<x-sheen::chip-choice legend="Document" name="kind" :options="[\'passport\' => \'Passport\', \'visa\' => \'Visa\']" value="visa" size="small" :input="[\'form\' => \'f1\']" />');
        $this->assertStringContainsString('<fieldset class="sheen-chip-choice"><legend >Document</legend>', preg_replace('/<legend\s+class="">/', '<legend >', $html));
        $this->assertMatchesRegularExpression('#<label class="sheen-chip sheen-small"><input type="radio" name="kind" value="visa" checked\s+form="f1"\s*>Visa</label>#', $html);
        $this->assertMatchesRegularExpression('#<input type="radio" name="kind" value="passport"\s+form="f1"\s*>Passport#', $html);
    }
}
