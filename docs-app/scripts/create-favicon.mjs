import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const [input, output] = process.argv.slice(2);

if (!input || !output) {
  throw new Error("Usage: node scripts/create-favicon.mjs <input.svg> <output.ico>");
}

const svg = await readFile(input);
const png = await sharp(svg).resize(64, 64).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(64, 6);
header.writeUInt8(64, 7);
header.writeUInt8(0, 8);
header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(header.length, 18);

await writeFile(output, Buffer.concat([header, png]));
