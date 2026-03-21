export default {
  '*.{ts,tsx,js,jsx,mjs,cjs,mts,cts}': [
    'npx eslint --fix --max-warnings=0 --no-warn-ignored --ignore-pattern eslint.config.mjs',
    'npx prettier --write',
  ],
  '*.{json,jsonc,md,yml,yaml,css,scss,html}': ['npx prettier --write'],
  // Run once per commit; using a function prevents passing staged filenames.
  // Uses nx affected to typecheck only projects impacted by changes.
  '*': () => 'npx nx affected -t typecheck --base=HEAD~1 --head=HEAD --no-tui',
};
