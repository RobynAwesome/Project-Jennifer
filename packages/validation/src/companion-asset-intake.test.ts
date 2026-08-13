import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { inflateSync } from "node:zlib";

interface IntakeAsset {
  path: string;
  gitBlobSha: string;
  bytes: number;
  status: string;
  sha256?: string;
  width?: number;
  height?: number;
}

interface IntakeManifest {
  assets: IntakeAsset[];
}

const repoRoot = path.resolve(process.cwd(), "../..");
const companionRoot = path.join(repoRoot, "assets", "Project Companions");
const manifestPath = path.join(companionRoot, "unclassified-intake.json");
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function inspectPng(buffer: Buffer): { width: number; height: number; sha256: string } {
  assert.ok(buffer.subarray(0, 8).equals(PNG_SIGNATURE), "PNG signature must be valid");

  let offset = 8;
  let width = 0;
  let height = 0;
  let sawIhdr = false;
  let sawIend = false;
  const idat: Buffer[] = [];

  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const chunkEnd = dataEnd + 4;
    assert.ok(chunkEnd <= buffer.length, `PNG chunk ${type} must fit inside payload`);

    if (type === "IHDR") {
      assert.equal(length, 13, "IHDR must have the PNG-standard 13-byte payload");
      width = buffer.readUInt32BE(dataStart);
      height = buffer.readUInt32BE(dataStart + 4);
      sawIhdr = true;
    } else if (type === "IDAT") {
      idat.push(buffer.subarray(dataStart, dataEnd));
    } else if (type === "IEND") {
      sawIend = true;
      break;
    }

    offset = chunkEnd;
  }

  assert.equal(sawIhdr, true, "PNG must contain IHDR");
  assert.equal(sawIend, true, "PNG must contain IEND");
  assert.ok(width > 0 && height > 0, "PNG dimensions must be positive");
  assert.ok(idat.length > 0, "PNG must contain image data");
  assert.doesNotThrow(() => inflateSync(Buffer.concat(idat)), "PNG IDAT stream must inflate successfully");

  return {
    width,
    height,
    sha256: createHash("sha256").update(buffer).digest("hex"),
  };
}

test("founder HD companion intake is real PNG data with receiptable dimensions and hashes", () => {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as IntakeManifest;
  assert.equal(manifest.assets.length, 14, "Issue #25 currently tracks exactly 14 opaque founder HD PNG assets");

  const receipts = manifest.assets.map((asset) => {
    const absolutePath = path.join(companionRoot, asset.path);
    const buffer = readFileSync(absolutePath);
    assert.equal(buffer.length, asset.bytes, `${asset.path} byte count must match the intake manifest`);

    const inspected = inspectPng(buffer);

    if (asset.sha256) assert.equal(inspected.sha256, asset.sha256, `${asset.path} SHA-256 must match its receipt`);
    if (asset.width) assert.equal(inspected.width, asset.width, `${asset.path} width must match its receipt`);
    if (asset.height) assert.equal(inspected.height, asset.height, `${asset.path} height must match its receipt`);

    return {
      path: asset.path,
      gitBlobSha: asset.gitBlobSha,
      bytes: asset.bytes,
      width: inspected.width,
      height: inspected.height,
      sha256: inspected.sha256,
    };
  });

  console.log(`COMPANION_ASSET_RECEIPTS=${JSON.stringify(receipts)}`);
});
