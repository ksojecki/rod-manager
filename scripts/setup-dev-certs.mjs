import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const keyPath = process.env.HTTPS_KEY_PATH ?? '.cert/localhost-key.pem';
const certPath = process.env.HTTPS_CERT_PATH ?? '.cert/localhost-cert.pem';

function isProductionInstall() {
  if (process.env.NODE_ENV === 'production') {
    return true;
  }

  if (process.env.npm_config_production === 'true') {
    return true;
  }

  const omit = process.env.npm_config_omit ?? '';
  return omit
    .split(',')
    .map((value) => value.trim())
    .includes('dev');
}

function getMkcertCliPath() {
  try {
    return require.resolve('mkcert-cli/cli.js');
  } catch {
    throw new Error(
      'Missing npm package "mkcert-cli". Run npm install to install dependencies.',
    );
  }
}

function runMkcertCli(args) {
  const cliPath = getMkcertCliPath();
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(`mkcert-cli command failed: mkcert-cli ${args.join(' ')}`);
  }
}

function setupDevCerts() {
  if (isProductionInstall()) {
    return;
  }

  const hasKey = existsSync(keyPath);
  const hasCert = existsSync(certPath);

  if (hasKey && hasCert) {
    return;
  }

  mkdirSync(dirname(keyPath), { recursive: true });
  mkdirSync(dirname(certPath), { recursive: true });

  runMkcertCli([
    '-o',
    dirname(certPath),
    '-k',
    basename(keyPath),
    '-c',
    basename(certPath),
    '--host',
    'localhost',
    '--host',
    '127.0.0.1',
    '--host',
    '::1',
  ]);

  if (!existsSync(keyPath) || !existsSync(certPath)) {
    throw new Error('mkcert did not generate expected certificate files.');
  }
}

try {
  setupDevCerts();
} catch (error) {
  console.error('[cert] Failed to setup local development certificates.');
  console.error(error);
  process.exit(1);
}
