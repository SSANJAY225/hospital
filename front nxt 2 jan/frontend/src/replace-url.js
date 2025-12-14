const fs = require('fs');
const path = require('path');
let file = 0
const [, , srcDir] = process.argv;
const targetUrl = 'http://localhost:5000';
const newUrl = 'http://localhost:5000';

if (!srcDir) {
  console.error("Usage: node replace-url.js <src-folder>");
  process.exit(1);//.88y7878777
}

const validExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css'];

function replaceInFile(filePath) {
  const ext = path.extname(filePath);
  if (!validExtensions.includes(ext)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes(targetUrl)) return;

  const updatedContent = content.split(targetUrl).join(newUrl);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`✅ Updated: ${filePath}`);
  file++;
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else {
      replaceInFile(fullPath);
    }
  }
}

walkDir(srcDir);
console.log("🔁 Replacement complete.", file);