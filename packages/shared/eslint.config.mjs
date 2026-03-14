import baseConfig from '../../eslint.config.mjs';

export default [
  {
    ignores: ['eslint.config.mjs', 'dist/**'],
  },
  ...baseConfig,
  {
    ignores: ['**/out-tsc'],
  },
];
