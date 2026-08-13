import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

const repoRoot = resolve(process.cwd());
const assetRoot = join(repoRoot, 'assets', 'Project Companions');
const manifestPath = join(assetRoot, 'source-manifest.json');
const renderableExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);
const failures = [];

function fail(path, message) {
  failures.push(`${relative(repoRoot, path)}: ${message}`);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function pngDimensions(buffer) {
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function gifDimensions(buffer) {
  const sig = buffer.subarray(0, 6).toString('ascii');
  if (buffer.length < 10 || (sig !== 'GIF87a' && sig !== 'GIF89a')) return null;
  return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
}

function jpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (offset + 2 > buffer.length) break;
    const length = buffer.readUInt16BE(offset);
    if (length < 2 || offset + length > buffer.length) break;
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 3), width: buffer.readUInt16BE(offset + 5) };
    }
    offset += length;
  }
  return null;
}

function webpDimensions(buffer) {
  if (buffer.length < 30 || buffer.subarray(0, 4).toString('ascii') !== 'RIFF' || buffer.subarray(8, 12).toString('ascii') !== 'WEBP') return null;
  const chunk = buffer.subarray(12, 16).toString('ascii');
  if (chunk === 'VP8X') {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    };
  }
  if (chunk === 'VP8L' && buffer[20] === 0x2f) {
    const b1 = buffer[21], b2 = buffer[22], b3 = buffer[23], b4 = buffer[24];
    return {
      width: 1 + (((b2 & 0x3f) << 8) | b1),
      height: 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6)),
    };
  }
  if (chunk === 'VP8 ' && buffer.length >= 30 && buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a) {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }
  return null;
}

function dimensionsFor(ext, buffer) {
  if (ext === '.png') return pngDimensions(buffer);
  if (ext === '.gif') return gifDimensions(buffer);
  if (ext === '.jpg' || ext === '.jpeg') return jpegDimensions(buffer);
  if (ext === '.webp') return webpDimensions(buffer);
  return null;
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

const allFiles = await walk(assetRoot);
const renderableFiles = allFiles.filter((path) => renderableExtensions.has(extname(path).toLowerCase()));

for (const path of renderableFiles) {
  const ext = extname(path).toLowerCase();
  const buffer = await readFile(path);
  const dimensions = dimensionsFor(ext, buffer);
  if (!dimensions) {
    fail(path, `payload does not decode as declared ${ext} format`);
    continue;
  }
  if (dimensions.width <= 0 || dimensions.height <= 0) {
    fail(path, `invalid dimensions ${dimensions.width}x${dimensions.height}`);
  }
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
for (const asset of manifest.assets ?? []) {
  const path = join(assetRoot, asset.path);
  let buffer;
  try {
    buffer = await readFile(path);
  } catch {
    fail(path, `manifest asset ${asset.id} is missing`);
    continue;
  }

  const ext = extname(path).toLowerCase();
  const dimensions = dimensionsFor(ext, buffer);
  if (!dimensions) {
    fail(path, `manifest asset ${asset.id} is not a valid ${ext} binary`);
    continue;
  }
  if (dimensions.width !== asset.width || dimensions.height !== asset.height) {
    fail(path, `manifest dimensions ${asset.width}x${asset.height} != binary ${dimensions.width}x${dimensions.height}`);
  }
  const digest = sha256(buffer);
  if (digest !== asset.sha256) {
    fail(path, `manifest sha256 ${asset.sha256} != binary ${digest}`);
  }
}

if (failures.length) {
  console.error('Companion asset integrity gate FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Companion asset integrity gate passed: ${renderableFiles.length} renderable assets checked; ${(manifest.assets ?? []).length} manifest receipts verified.`);
