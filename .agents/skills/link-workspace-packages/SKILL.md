---
name: link-workspace-packages
description: 'Link workspace packages in monorepos (npm, yarn, pnpm, bun). USE WHEN: (1) you just created or generated new packages and need to wire up their dependencies, (2) user imports from a sibling package and needs to add it as a dependency, (3) you get resolution errors for workspace packages (@org/*) like "cannot find module", "failed to resolve import", "TS2307", or "cannot resolve". DO NOT patch around with tsconfig paths or manual package.json edits - use the package manager''s workspace commands to fix actual linking.'
---

# Link Workspace Packages

Add dependencies between packages in a monorepo. This workspace uses npm workspaces, so prefer the npm flow first.

## Detect Package Manager

Check the root lockfile:

- `package-lock.json` -> npm
- `pnpm-lock.yaml` -> pnpm
- `yarn.lock` -> yarn
- `bun.lock` / `bun.lockb` -> bun

## Workflow

1. Identify the consumer package.
2. Identify the provider package.
3. Add the dependency with the package manager's workspace command.
4. Verify the dependency appears in the consumer's `package.json`.

## npm

npm auto-links workspace packages.

```bash
npm install @org/ui --workspace @org/app
```

Result:

```json
{ "dependencies": { "@org/ui": "*" } }
```

For this repo, confirm the exact workspace package id first, then install it into the consumer workspace by name.

## pnpm

```bash
pnpm add @org/ui --filter @org/app --workspace
```

## yarn

```bash
yarn workspace @org/app add @org/ui
```

## bun

```bash
cd packages/app && bun add @org/ui
```

## Examples

```bash
# npm: link a single workspace dependency
npm install @org/ui --workspace @org/app

# npm: link multiple workspace dependencies
npm install @org/data-access @org/ui --workspace @org/dashboard
```

If a package import fails with `TS2307` or "Cannot find module", first check whether the dependency is declared in the consumer package.
