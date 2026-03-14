# AGENTS Guide

## Repo Snapshot

- This is an Nx 22 workspace (`nx`, `@nx/js` in `package.json`) with npm workspaces (`packages/*`).
- `packages/` is currently empty (`packages/.gitkeep`), so this repo is in bootstrap state.
- Treat root config as source of truth until first package is generated.

## Big Picture Architecture

- Monorepo orchestration is defined in `nx.json`; project tasks are expected to be inferred by Nx.
- `@nx/js/typescript` plugin wires common targets: `build` and `typecheck` (see `nx.json` plugin options).
- Shared cache inputs include `.github/workflows/ci.yml` via `namedInputs.sharedGlobals`; CI changes can invalidate task cache.
- TypeScript baseline lives in `tsconfig.base.json` with strict + composite settings and NodeNext module system.

## Critical Workflows

- Install deps: `npm ci` (used in CI).
- Run lint via npm script: `npm run lint` (delegates to Nx `lint` target inference).
- Run formatting checks: `npm run format:check`; auto-fix formatting: `npm run format`.
- Run CI-equivalent checks locally: `npx nx run-many -t lint test build typecheck`.
- Apply Nx Cloud CI remediation hints: `npx nx fix-ci`.
- Explore project/task graph: `npx nx graph`.
- Keep TS project refs consistent after adding projects: `npx nx sync` (or `npx nx sync:check` in CI).

## Project-Specific Conventions

- Formatting: Prettier with single quotes (`.prettierrc`).
- Formatting indentation is 2 spaces globally (`tabWidth: 2`, `useTabs: false`); JSON/JSONC have explicit Prettier override.
- Ignore generated artifacts in formatting and VCS (`.prettierignore`, `.gitignore` include `dist`, `coverage`, `.nx/*`).
- ESLint uses flat config in `eslint.config.mjs` with Nx lint inference from `@nx/eslint/plugin` in `nx.json`.
- TypeScript lint enforces `@typescript-eslint/no-explicit-any` and `@typescript-eslint/no-floating-promises`.
- Public class methods require JSDoc description (`jsdoc/require-jsdoc` + `jsdoc/require-description`).
- TS output intent is declaration-focused (`emitDeclarationOnly: true` in `tsconfig.base.json`), so library packaging should expect `.d.ts` generation.
- `customConditions` includes `@rod-manager/source`; keep this in mind when introducing conditional exports/resolution.

## Integration Points

- CI runs on GitHub Actions (`.github/workflows/ci.yml`) with Node 20 and npm cache.
- Nx Cloud is configured (`nxCloudId` in `nx.json`); distributed agents are prepared but currently commented in CI.
- Release flow is expected via `npx nx release` (documented in `README.md`).

## When Adding the First Package

- Prefer Nx generators (example from `README.md`):
  - `npx nx g @nx/js:lib packages/<name> --publishable --importPath=@my-org/<name>`
- After generation, validate inferred targets with `npx nx show project <project-name>` and run `build` + `typecheck`.
- Keep new package configs aligned with root TS/Nx conventions instead of overriding defaults unless necessary.
