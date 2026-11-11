// 0.7.1 the Views menu width yields to the app: the kit sets 320px to 360px at no specificity, like the 400px panel, so
// an app's class rule on the menu button or an inline value wins; a value set on an ancestor of the button does not.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const min = readFileSync(new URL('../../dist/sheen.min.css', import.meta.url), 'utf8');

test("the Views menu width sits under :where(), so an app's own class rule on the menu button wins over it", () => {
  assert.ok(min.includes(':where(.sheen-views-end sheen-menu-button){--sheen-menu-min-size:320px;--sheen-menu-max-size:360px}'));
  assert.doesNotMatch(min, /(^|\})\.sheen-views-end sheen-menu-button\{--sheen-menu/, 'no rule with specificity sets the width');
});
