const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src');

function walk(directory) {
  let results = [];
  const list = fs.readdirSync(directory);
  list.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(dir);
let changedFiles = 0;

files.forEach(file => {
  if (file.includes(path.normalize('src/api/')) || file.includes(path.normalize('src\\api\\'))) return;

  const content = fs.readFileSync(file, 'utf8');
  
  // This handles imports like: import { x } from '../../api/authApi';
  let newContent = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]([./]+)api\/[a-zA-Z]+Api['"];?/g, "import { $1 } from '$2api';");
  
  // Also handle multiple identical api imports and merge them? 
  // No, just point them all to 'api' and Vite will dedup.
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
    console.log('Updated:', file);
  }
});

console.log('Total files updated:', changedFiles);
