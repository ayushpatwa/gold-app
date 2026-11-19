// scripts/build.js - Prepare static output for Vercel
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const indexSrc = path.join(rootDir, 'index.html');
const indexDest = path.join(publicDir, 'index.html');

if (fs.existsSync(indexSrc)) {
  fs.copyFileSync(indexSrc, indexDest);
  console.log('Copied index.html -> public/index.html');
}

console.log('Build complete! Output directory "public" ready.');
