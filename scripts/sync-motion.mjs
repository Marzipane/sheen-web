// Copies Flutter sheen's tool/motion.json into tokens.json: node scripts/sync-motion.mjs ../sheen, then node build.mjs.
import { readFileSync, writeFileSync } from 'node:fs';

const tokens = JSON.parse(readFileSync('tokens/tokens.json', 'utf8'));
tokens.motion = JSON.parse(readFileSync(`${process.argv[2]}/tool/motion.json`, 'utf8'));
writeFileSync('tokens/tokens.json', JSON.stringify(tokens, null, 2) + '\n');
