<?php
// Renders docs/demo.blade.php with the real components into docs/index.html and copies dist/ next to it.
// php scripts/demo.php  (CI runs it before publishing the demo to GitHub Pages)
require __DIR__.'/../vendor/autoload.php';

$app = Orchestra\Testbench\Foundation\Application::create(basePath: null, resolvingCallback: function ($app) {
    $app->register(Marzipane\SheenWeb\SheenServiceProvider::class);
});
$html = $app['blade.compiler']->render(file_get_contents(__DIR__.'/../docs/demo.blade.php'), ['dir' => 'ltr']);
file_put_contents(__DIR__.'/../docs/index.html', $html);
foreach (['sheen.min.css', 'sheen.min.js', 'sheen-elements.min.js'] as $f) {
    copy(__DIR__.'/../dist/'.$f, __DIR__.'/../docs/'.$f);
}
echo "docs/index.html written\n";
