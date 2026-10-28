<?php

namespace Marzipane\SheenWeb\Tests\Feature;

use PHPUnit\Framework\TestCase;

/** The built files: tokens as custom properties for both themes, logical properties only, no physical sides. */
class DistTest extends TestCase
{
    private function css(): string
    {
        return file_get_contents(__DIR__.'/../../dist/sheen.css');
    }

    public function test_tokens_are_defined_for_light_dark_and_the_explicit_themes(): void
    {
        $css = $this->css();
        $tokens = json_decode(file_get_contents(__DIR__.'/../../tokens/tokens.json'), true);
        foreach (array_keys($tokens['color']['dark']) as $name) {
            $var = '--sheen-'.strtolower(preg_replace('/[A-Z]/', '-$0', $name));
            $this->assertSame(4, substr_count($css, $var.':'), "$var: light, dark (media), [data-theme=dark], [data-theme=light]");
        }
        $this->assertStringContainsString('@media (prefers-color-scheme: dark){:root:not([data-theme="light"])', $css);
    }

    public function test_no_physical_left_or_right_so_rtl_mirrors(): void
    {
        $css = preg_replace('#/\*.*?\*/#s', '', $this->css());
        $this->assertDoesNotMatchRegularExpression('/(margin|padding|border)-(left|right)\s*:|[{;](left|right)\s*:|text-align\s*:\s*(left|right)/', $css);
    }

    public function test_glass_respects_reduced_transparency_and_contrast(): void
    {
        $css = $this->css();
        $this->assertStringContainsString('@media (prefers-reduced-transparency: reduce)', $css);
        $this->assertStringContainsString('@media (prefers-contrast: more)', $css);
        $this->assertStringContainsString('@media (prefers-reduced-motion: reduce)', $css);
    }

    public function test_the_base_button_rule_never_outranks_a_sheen_button(): void
    {
        // 0.1.2 had ".sheen button{font:inherit}" (0,1,1), which beat ".sheen-button" (0,1,0) and its sizes
        $css = preg_replace('#/\*.*?\*/#s', '', $this->css());
        $this->assertDoesNotMatchRegularExpression('/(^|[},])\s*\.sheen button\s*\{/', $css);
        $this->assertStringContainsString(':where(.sheen button){font:inherit;color:inherit}', $css);
    }

    public function test_a_field_shows_focus_never_a_box_around_its_words(): void
    {
        // 0.1.4 (owner, 16 Oct): the base focus ring drew a sharp box around a bare input inside a rounded field or a
        // search bar's part; Airbnb, Booking, Expedia and Agoda all show focus on the field or part instead
        $css = $this->css();
        $this->assertStringContainsString('.sheen :is(.sheen-field,.sheen-segment,.sheen-picker-pill) :is(input,select,textarea,.sheen-segment-trigger,.sheen-picker-trigger):focus-visible{outline:none}', $css);
        $this->assertMatchesRegularExpression('/\.sheen-field:focus-within\{[^}]*0 0 0 4px/', $css);
        $this->assertMatchesRegularExpression('/\.sheen-segment:focus-within\{[^}]*background/', $css);
        // the field still shows where the keyboard is when the system draws no shadows
        $this->assertMatchesRegularExpression('/@media \(forced-colors: active\)\{[^@]*\.sheen-field:focus-within/', $css);
    }

    public function test_a_picker_hides_its_select_only_once_the_script_has_run(): void
    {
        // without JavaScript the native select is the control; the script marks the picker ready and shows its trigger
        $css = $this->css();
        $this->assertStringContainsString('.sheen-picker:not(.sheen-picker-ready) .sheen-picker-trigger{display:none}', $css);
        $this->assertStringContainsString('.sheen-picker-ready select{display:none!important}', $css);
        // a [popover] is display:none until shown; the list sets its display only while not hidden
        $this->assertStringContainsString('.sheen-picker-pop:not([hidden]){display:flex}', $css);
        $this->assertDoesNotMatchRegularExpression('/\.sheen-picker-pop\{[^}]*display:/', $css);
        $js = file_get_contents(__DIR__.'/../../dist/sheen.js');
        foreach (['showPopover', "dispatchEvent(new Event('change'", 'aria-activedescendant', 'initPickers'] as $s) {
            $this->assertStringContainsString($s, $js);
        }
    }
    public function test_the_elements_bundle_defines_every_element_with_its_styles(): void
    {
        // 0.3.0: the app elements ship as dist/sheen-elements.js; each one has its rules in dist/sheen.css
        $js = file_get_contents(__DIR__.'/../../dist/sheen-elements.js');
        $css = $this->css();
        foreach (['sheen-glyph', 'sheen-progress-ring', 'sheen-drop-zone', 'sheen-toaster', 'sheen-command-palette',
            'sheen-video', 'sheen-waveform', 'sheen-compare', 'sheen-timeline', 'sheen-transcript', 'sheen-node-graph',
            'sheen-tour'] as $tag) {
            $this->assertStringContainsString("define('$tag'", $js, $tag);
            $selector = $tag === 'sheen-command-palette' ? '.sheen-cmd' : $tag;   // the palette styles its <dialog>
            $this->assertStringContainsString($selector, $css, "$tag has styles");
        }
        // motion stops for people who ask for less of it
        $this->assertMatchesRegularExpression('/@media \(prefers-reduced-motion: reduce\)\{\.sheen-aurora::before,\.sheen-aurora::after\{animation:none\}\}/', $css);
        $this->assertStringContainsString('reducedMotion()', $js);
    }
}

