/**
 * Script de build estatico puro HTML5 + CSS + JS (sin dependencias ni servicios externos).
 * Empaqueta la PWA lista para desplegar en cualquier servidor web estatico en `dist/`.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');

const INCLUDE_FILES = ['index.html', 'manifest.webmanifest', 'sw.js'];
const INCLUDE_DIRS = ['src', 'assets'];
const EXCLUDED_FILES = new Set(['env.local.js', 'runtime-env.js']);

function copyRecursive(source, destination) {
  const stats = fs.statSync(source);
  if (stats.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      if (EXCLUDED_FILES.has(entry)) continue;
      copyRecursive(path.join(source, entry), path.join(destination, entry));
    }
    return;
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function main() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  for (const file of INCLUDE_FILES) {
    const srcPath = path.join(ROOT, file);
    if (fs.existsSync(srcPath)) {
      copyRecursive(srcPath, path.join(DIST, file));
    }
  }

  for (const dir of INCLUDE_DIRS) {
    const srcDir = path.join(ROOT, dir);
    if (fs.existsSync(srcDir)) {
      copyRecursive(srcDir, path.join(DIST, dir));
    }
  }

  console.log('[build-static] Build 100% HTML5/CSS/JS completado en dist/');
}

main();
