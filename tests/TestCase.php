<?php

namespace Marzipane\SheenWeb\Tests;

use Illuminate\Support\Facades\Blade;
use Marzipane\SheenWeb\SheenServiceProvider;
use Orchestra\Testbench\TestCase as Base;

abstract class TestCase extends Base
{
    protected function getPackageProviders($app): array
    {
        return [SheenServiceProvider::class];
    }

    /** Renders a Blade string with $data. */
    protected function render(string $template, array $data = []): string
    {
        return Blade::render($template, $data);
    }

    /** The visible words of $html: tags, scripts and attributes removed, whitespace collapsed. */
    protected function words(string $html): string
    {
        $html = preg_replace('#<(script|style)\b[^>]*>.*?</\1>#s', '', $html);

        return trim(preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags($html))));
    }
}
