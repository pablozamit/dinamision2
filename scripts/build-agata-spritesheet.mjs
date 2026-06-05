/**
 * Genera el sprite sheet de Ágata desde agata.jpeg (5 frames horizontales + atlas JSON).
 * Ejecutar: npm run build:agata
 */
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const srcPath = join(root, 'agata.jpeg');
const outDir = join(root, 'public', 'assets', 'characters');
const sheetPath = join(outDir, 'agata-sheet.png');
const atlasPath = join(outDir, 'agata-atlas.json');

mkdirSync(outDir, { recursive: true });

const CROP = { left: 120, top: 80, width: 520, height: 720 };

const base = await sharp(srcPath).extract(CROP).png().toBuffer();
const meta = await sharp(base).metadata();
const fw = meta.width;
const fh = meta.height;

const frameVariants = [
  { key: 'idle_0', scale: 1 },
  { key: 'idle_1', scale: 1.02 },
  { key: 'talk', scale: 1.01 },
  { key: 'point', scale: 1 },
  { key: 'wink', scale: 0.99 },
];

async function toFrame(scale) {
  if (scale === 1) return base;
  const w = Math.round(fw * scale);
  const h = Math.round(fh * scale);
  return sharp(base)
    .resize(w, h)
    .resize(fw, fh, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

const frames = await Promise.all(frameVariants.map((v) => toFrame(v.scale)));
const sheetWidth = fw * frames.length;
const composites = frames.map((buf, i) => ({ input: buf, left: i * fw, top: 0 }));

await sharp({
  create: {
    width: sheetWidth,
    height: fh,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(composites)
  .png()
  .toFile(sheetPath);

const atlas = {
  frames: Object.fromEntries(
    frameVariants.map((v, i) => [
      v.key,
      {
        frame: { x: i * fw, y: 0, w: fw, h: fh },
        sourceSize: { w: fw, h: fh },
        spriteSourceSize: { x: 0, y: 0, w: fw, h: fh },
      },
    ]),
  ),
  meta: {
    image: 'agata-sheet.png',
    size: { w: sheetWidth, h: fh },
    scale: '1',
  },
  animations: {
    'agata-idle': ['idle_0', 'idle_1'],
    'agata-talk': ['talk', 'idle_0', 'talk', 'idle_1'],
    'agata-point': ['point'],
    'agata-wink': ['wink'],
  },
};

writeFileSync(atlasPath, JSON.stringify(atlas, null, 2));
console.log(`OK: ${sheetPath} (${sheetWidth}x${fh})`);