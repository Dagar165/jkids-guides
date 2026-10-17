// Package the existing static site for hosting; do not rewrite source files.
import { access, cp, mkdir, readFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'build');
const entries = ['index.html', 'catalog.json', 'assets', 'guides', '.nojekyll'];

// Check required inputs before replacing the previous build.
for (const entry of entries) await access(path.join(root, entry));
const catalog = JSON.parse(await readFile(path.join(root, 'catalog.json'), 'utf8'));
if (catalog.version !== 2 || !Array.isArray(catalog.items)) {
  throw new Error('Invalid catalog.json; run python3 scripts/build_catalog.py');
}
for (const item of catalog.items) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || item.path !== `guides/${item.id}/`) {
    throw new Error('Invalid guide path in catalog.json');
  }
  await access(path.join(root, item.path, 'index.html'));
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of entries) {
  await cp(path.join(root, entry), path.join(output, entry), { recursive: true });
}
console.log(`Static site ready in build/: ${catalog.items.length} guides; source files unchanged.`);
