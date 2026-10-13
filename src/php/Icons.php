<?php

namespace Marzipane\SheenWeb;

use InvalidArgumentException;

/**
 * The Flutter sheen glyphs on a 24 × 24 grid: stroke icons drawn with currentColor, and a few filled ones.
 * Used by <x-sheen::icon>; an unknown name throws, so a typo fails a test instead of drawing nothing.
 */
final class Icons
{
    /** @param array{stroke: array<string, string>, filled: array<string, string>} $glyphs */
    public function __construct(private readonly array $glyphs) {}

    /** Whether there is a glyph called $name ($filled: in the filled set). */
    public function has(string $name, bool $filled = false): bool
    {
        return isset($this->glyphs[$filled ? 'filled' : 'stroke'][$name]);
    }

    /** The names of the stroke glyphs. @return list<string> */
    public function names(bool $filled = false): array
    {
        return array_keys($this->glyphs[$filled ? 'filled' : 'stroke']);
    }

    /**
     * The <svg> for $name, $size pixels square. With $label it is an image with that name for screen readers;
     * without, it is hidden from them (the control around it carries the label).
     */
    public function svg(string $name, int|float $size = 22, bool $filled = false, float $stroke = 1.8, ?string $label = null): string
    {
        $set = $filled ? 'filled' : 'stroke';
        if (! isset($this->glyphs[$set][$name])) {
            throw new InvalidArgumentException("sheen-web has no {$set} icon called \"{$name}\".");
        }
        $aria = $label !== null ? ' role="img" aria-label="'.e($label).'"' : ' aria-hidden="true" focusable="false"';
        $paint = $filled
            ? 'fill="currentColor"'
            : 'fill="none" stroke="currentColor" stroke-width="'.$stroke.'" stroke-linecap="round" stroke-linejoin="round"';

        return '<svg class="sheen-icon" width="'.$size.'" height="'.$size.'" viewBox="0 0 24 24" '.$paint.$aria.'>'.$this->glyphs[$set][$name].'</svg>';
    }
}
