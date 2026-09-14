import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src/modules/voice/roshni-prompt.md');
const destDir = join(root, 'dist/modules/voice');
mkdirSync(destDir, { recursive: true });
copyFileSync(src, join(destDir, 'roshni-prompt.md'));
console.log('Copied roshni-prompt.md → dist/modules/voice/');

const promptSrc = join(root, 'src/modules/outreach/prompt');
const promptDest = join(root, 'dist/modules/outreach/prompt');
mkdirSync(promptDest, { recursive: true });
for (const file of readdirSync(promptSrc)) {
  if (file.endsWith('.md')) {
    copyFileSync(join(promptSrc, file), join(promptDest, file));
  }
}
console.log('Copied outreach prompts → dist/modules/outreach/prompt/');
