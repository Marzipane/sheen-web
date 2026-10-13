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
<x-sheen::trip-card href="/t" title="Qa" eyebrow="Qb" facts="Qc" price="Qd" per="Qe" photo="/p.webp" tag="Qf" :deal="['badge' => 'Qg', 'was' => 'Qh', 'ends' => 'Qi']" />
<x-sheen::hotel-card href="/h" name="Qj" score="Qk" line="Ql" price="Qm" per="Qn" :deal="['badge' => 'Qo', 'was' => 'Qp', 'ends' => 'Qq']" />
<x-sheen::stepper name="adults" :value="2" label="Qr" fewer="Qs" more="Qt" />
<x-sheen::photo-viewer id="v" :groups="[]" close="Qu" previous="Qv" next="Qw" />
<x-sheen::icon-button icon="heart" label="Qx" />
<x-sheen::list-row href="/x" title="Qy" subtitle="Qz" value="Qaa" />
<x-sheen::steps :steps="['Qab', 'Qac']" :current="1" />
B);
        $words = $this->words($html);
        $this->assertSame('', trim(preg_replace('/Q[a-z]+|·/', '', $words)), 'only the words given: '.$words);
        // neighbouring texts are separated, so screen readers do not run them together
        $this->assertDoesNotMatchRegularExpression('/Q[a-z]+Q/', $words);
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
}
