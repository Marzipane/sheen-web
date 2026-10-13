{{-- SheenPhotoViewer: photos full screen with chips. id: what openers name in data-sheen-viewer; groups: list of
     ['label' => 'Ship', 'photos' => [['src' => …, 'alt' => …, 'caption' => …]]]. close/previous/next: the buttons'
     labels; of: "Photo @n of @all" in the site's language. --}}
@props(['id', 'groups', 'close', 'previous', 'next', 'of' => '@n / @all', 'label' => null])
<dialog id="{{ $id }}" {{ $attributes->class(['sheen-viewer']) }} data-label-of="{{ $of }}" @if ($label) aria-label="{{ $label }}" @endif>
<script type="application/json" class="sheen-viewer-data">@json(array_values($groups), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG)</script>
<div class="sheen-viewer-top"><button type="button" class="sheen-icon-button sheen-viewer-close" aria-label="{{ $close }}" style="background:rgba(255,255,255,.14);color:#fff"><x-sheen::icon name="close" :size="20" :stroke="2.2" /></button>
<div class="sheen-viewer-chips"></div><span class="sheen-viewer-of sheen-footnote" aria-live="polite" style="opacity:.8"></span></div>
<div class="sheen-viewer-stage"><img alt=""><button type="button" class="sheen-viewer-prev" aria-label="{{ $previous }}"><x-sheen::icon name="back" :size="22" :stroke="2.2" /></button><button type="button" class="sheen-viewer-next" aria-label="{{ $next }}"><x-sheen::icon name="chevron" :size="22" :stroke="2.2" /></button></div>
<p class="sheen-viewer-caption"></p><div class="sheen-viewer-strip"></div>
</dialog>
