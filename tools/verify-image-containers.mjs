import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve(process.cwd());
const assetRoot = join(root, 'assets', 'Project Companions');
const imageExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);
const failures = [];

function pngComplete(b) {
  const sig = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
  if (b.length < 33 || !b.subarray(0, 8).equals(sig)) return false;
  let o = 8;
  let first = true;
  let idat = false;
  while (o + 12 <= b.length) {
    const n = b.readUInt32BE(o);
    const type = b.subarray(o + 4, o + 8).toString('ascii');
    const end = o + 12 + n;
    if (end > b.length) return false;
    if (first && (type !== 'IHDR' || n !== 13)) return false;
    if (!first && type === 'IHDR') return false;
    first = false;
    if (type === 'IDAT') idat = true;
    if (type === 'IEND') return n === 0 && idat && end === b.length;
    o = end;
  }
  return false;
}

function jpegComplete(b) {
  return b.length >= 4 && b[0] === 0xff && b[1] === 0xd8 &&
    b[b.length - 2] === 0xff && b[b.length - 1] === 0xd9;
}

function gifComplete(b) {
  const sig = b.subarray(0, 6).toString('ascii');
  return b.length >= 14 && (sig === 'GIF87a' || sig === 'GIF89a') && b[b.length - 1] === 0x3b;
}

function webpComplete(b) {
  if (b.length < 20 || b.subarray(0, 4).toString('ascii') !== 'RIFF' ||
      b.subarray(8, 12).toString('ascii') !== 'WEBP' || b.readUInt32LE(4) + 8 !== b.length) return false;
  let o = 12;
  let image = false;
  while (o + 8 <= b.length) {
    const type = b.subarray(o, o + 4).toString('ascii');
    const n = b.readUInt32LE(o + 4);
    const end = o + 8 + n;
    const paddedEnd = end + (n & 1);
    if (end > b.length || paddedEnd > b.length) return false;
    if (type === 'VP8 ' || type === 'VP8L') image = true;
    o = paddedEnd;
  }
  return image && o === b.length;
}

function complete(ext, b) {
  if (ext === '.png') return pngComplete(b);
  if (ext === '.jpg' || ext === '.jpeg') return jpegComplete(b);
  if (ext === '.gif') return gifComplete(b);
  if (ext === '.webp') return webpComplete(b);
  return false;
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(path));
    else out.push(path);
  }
  return out;
}

const files = (await walk(assetRoot)).filter((p) => imageExts.has(extname(p).toLowerCase()));
for (const path of files) {
  const ext = extname(path).toLowerCase();
  if (!complete(ext, await readFile(path))) failures.push(`${relative(root, path)}: incomplete or malformed ${ext} container`);
}

if (failures.length) {
  console.error('Image container integrity gate FAILED');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Image container integrity gate passed: ${files.length} complete image containers checked.`);
