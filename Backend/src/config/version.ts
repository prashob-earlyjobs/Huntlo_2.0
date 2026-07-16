import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));

let cachedVersion: string | null = null;

export function getAppVersion(): string {
  if (cachedVersion) return cachedVersion;

  try {
    const packagePath = join(currentDir, '../../package.json');
    const raw = readFileSync(packagePath, 'utf8');
    const pkg = JSON.parse(raw) as { version?: string };
    cachedVersion = pkg.version ?? '0.0.0';
  } catch {
    cachedVersion = '0.0.0';
  }

  return cachedVersion;
}

export function getBuildInfo() {
  return {
    version: getAppVersion(),
    node: process.version,
    env: process.env.APP_ENV ?? 'development',
  };
}
