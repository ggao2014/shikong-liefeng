import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const clientDir = path.join(root, 'dist', 'client');
const basePath = (process.env.BASE_PATH || '/shikong-liefeng').replace(/\/$/, '');

const TEXT_EXT = new Set([
  '.html',
  '.js',
  '.css',
  '.json',
  '.txt',
  '.svg',
  '.map',
  '.rsc',
]);

const ABSOLUTE_PREFIXES = [
  '/_next/',
  '/assets/',
  '/seasons/',
  '/town-map.png',
  '/og.png',
  '/favicon.svg',
];

function rewrite(content) {
  let next = content;
  for (const prefix of ABSOLUTE_PREFIXES) {
    next = next.split(prefix).join(`${basePath}${prefix}`);
  }
  // Avoid double-prefixing if the script is run twice.
  next = next.split(`${basePath}${basePath}/`).join(`${basePath}/`);
  return next;
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

const files = await walk(clientDir);
let changed = 0;
for (const file of files) {
  if (!TEXT_EXT.has(path.extname(file).toLowerCase())) continue;
  const original = await readFile(file, 'utf8');
  const updated = rewrite(original);
  if (updated !== original) {
    await writeFile(file, updated, 'utf8');
    changed += 1;
  }
}

await writeFile(path.join(clientDir, '.nojekyll'), '', 'utf8');
await mkdir(clientDir, { recursive: true });

console.log(`Prepared GitHub Pages export with base ${basePath} (${changed} files rewritten).`);
