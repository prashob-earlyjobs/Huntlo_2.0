import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src/modules/voice/roshni-prompt.md');
const destDir = join(root, 'dist/modules/voice');
mkdirSync(destDir, { recursive: true });
copyFileSync(src, join(destDir, 'roshni-prompt.md'));
console.log('Copied roshni-prompt.md → dist/modules/voice/');
