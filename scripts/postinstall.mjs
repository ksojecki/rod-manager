import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

function runNodeScript(scriptPath) {
  const result = spawnSync(process.execPath, [scriptPath], {
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const workspaceRoot = process.cwd();
const huskyCli = path.join(workspaceRoot, 'node_modules', 'husky', 'bin.js');

if (existsSync(huskyCli)) {
  runNodeScript(huskyCli);
}

runNodeScript(path.join(workspaceRoot, 'scripts', 'setup-dev-certs.mjs'));
