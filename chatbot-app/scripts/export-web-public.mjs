import { spawnSync } from 'node:child_process';

const env = {
  ...process.env,
  EXPO_NO_DOTENV: '1',
};

delete env.EXPO_PUBLIC_API_URL;

const result = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['expo', 'export', '-p', 'web'],
  {
    env,
    shell: process.platform === 'win32',
    stdio: 'inherit',
  }
);

if (result.error) {
  console.error(result.error);
}

process.exit(result.status ?? 1);
