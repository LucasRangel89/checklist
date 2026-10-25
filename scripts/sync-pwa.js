import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'client', 'dist');
const docsDir = path.join(rootDir, 'docs');

if (!fs.existsSync(distDir)) {
  console.error('Erro: client/dist não encontrado. Execute o build do cliente primeiro.');
  process.exit(1);
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Clean old assets in root and docs
const rootAssets = path.join(rootDir, 'assets');
if (fs.existsSync(rootAssets)) {
  fs.rmSync(rootAssets, { recursive: true, force: true });
}
if (fs.existsSync(docsDir)) {
  fs.rmSync(docsDir, { recursive: true, force: true });
}
fs.mkdirSync(docsDir, { recursive: true });

// Copy all files from client/dist to root and docs/
for (const item of fs.readdirSync(distDir)) {
  const srcPath = path.join(distDir, item);
  copyRecursive(srcPath, path.join(rootDir, item));
  copyRecursive(srcPath, path.join(docsDir, item));
}

// Create 404.html (SPA fallback) and .nojekyll (disables README rendering on GitHub Pages)
const indexHtml = path.join(distDir, 'index.html');
fs.copyFileSync(indexHtml, path.join(rootDir, '404.html'));
fs.copyFileSync(indexHtml, path.join(docsDir, '404.html'));
fs.writeFileSync(path.join(rootDir, '.nojekyll'), '');
fs.writeFileSync(path.join(docsDir, '.nojekyll'), '');

console.log('✅ Pacote PWA sincronizado na raiz (/) e em (/docs) com .nojekyll e 404.html!');
