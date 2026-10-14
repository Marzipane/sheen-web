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
}
