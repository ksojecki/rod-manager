import baseConfig from '../../eslint.config.mjs';

export default [
  {
    ignores: ['vite.config.mts', 'eslint.config.mjs', 'dist/**', '**/*.d.ts'],
  },
  ...baseConfig,
];
