/**
 * pnpm coloca @prisma/client em .pnpm/.../node_modules/@prisma/client e o
 * require('.prisma/client') resolve para OUTRO .prisma ao lado — que não é
 * o mesmo de node_modules/.prisma gerado pelo schema (output customizado).
 * Copiamos o client gerado para esses destinos para runtime bater com o schema.
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const source = path.join(projectRoot, 'node_modules', '.prisma');

function walk(dir, onDir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const full = path.join(dir, e.name);
    if (e.name === '.prisma' && path.basename(dir) === 'node_modules') {
      onDir(full);
    } else {
      walk(full, onDir);
    }
  }
}

function main() {
  if (!fs.existsSync(source)) {
    console.warn('sync-prisma-client: node_modules/.prisma missing, skip.');
    return;
  }

  const pnpmRoot = path.join(projectRoot, 'node_modules', '.pnpm');
  if (!fs.existsSync(pnpmRoot)) {
    return;
  }

  const targets = [];
  walk(pnpmRoot, (p) => {
    if (p.includes(`${path.sep}@prisma+client@`) && p.includes(`${path.sep}node_modules${path.sep}.prisma`)) {
      targets.push(p);
    }
  });

  for (const dest of targets) {
    fs.rmSync(dest, { recursive: true, force: true });
    fs.cpSync(source, dest, { recursive: true });
    console.log('sync-prisma-client: synced ->', path.relative(projectRoot, dest));
  }
}

main();
