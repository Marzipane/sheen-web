<?php

namespace Marzipane\SheenWeb;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

/**
 * Registers the Blade components under the "sheen" prefix (<x-sheen::trip-card>) and lets the app publish the
 * built CSS and script: php artisan vendor:publish --tag=sheen-assets (to public/vendor/sheen).
 */
class SheenServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $views = __DIR__.'/../../resources/views';
        $this->loadViewsFrom($views, 'sheen');
        Blade::anonymousComponentPath($views.'/components', 'sheen');

        $this->publishes([__DIR__.'/../../dist' => public_path('vendor/sheen')], 'sheen-assets');
    }

    public function register(): void
    {
        $this->app->singleton(Icons::class, fn () => new Icons(require __DIR__.'/../../resources/icons.php'));
    }
}
