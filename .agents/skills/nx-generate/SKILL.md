---
name: nx-generate
description: Generate code using nx generators. INVOKE IMMEDIATELY when user mentions scaffolding, setup, structure, creating apps/libs, or setting up project structure. Trigger words - scaffold, setup, create a new app, create a new lib, project structure, generate, add a new project. ALWAYS use this BEFORE calling nx_docs or exploring - this skill handles discovery internally.
---

# Run Nx Generator

Nx generators scaffold projects and automate repetitive monorepo work. This repo already exposes a supported product generator, so prefer the repo's own command surface before falling back to generic plugin generators.

## Key Principles

1. Always use `--no-interactive` with direct Nx generator commands.
2. Prefer the repo-local product generator when it fits the request.
3. Read generator source before using a non-local generator.
4. Match existing repo patterns and verify the result with the repo's command surface.

## Step 1: Prefer the Repo-Local Generator

For a new product in this workspace, start with:

```bash
npm run generate:project -- <name>
```

That is the supported wrapper around the local `project-template` generator.

Typical mapping:

- New product under `projects/<name>/apps/*` -> `npm run generate:project -- <name>`
- Library or framework-specific scaffold with no repo-local wrapper -> `npx nx g ... --no-interactive`

## Step 2: Discover Other Generators Only If Needed

```bash
npx nx list
npx nx list @nx/react
npx nx g @nx/react:library --help
```

When both a local generator and a plugin generator could work, prefer the local generator.

## Step 3: Read the Generator Source

For plugin generators:

```bash
node -e "console.log(require.resolve('@nx/<plugin>/generators.json'))"
```

For local generators, inspect `tools/` or the local plugin directory before running anything.

## Step 4: Dry Run First

```bash
npx nx g @nx/react:library --name=my-lib --dry-run --no-interactive
```

Review file placement before running the real generator.

## Step 5: Run the Generator

```bash
npx nx generate <generator-name> <options> --no-interactive
```

New packages often need workspace dependencies wired up afterward. Use the `link-workspace-packages` skill if imports are added across packages.

## Step 6: Format and Verify

Use the repo defaults after generation:

```bash
npm run format
npm run typecheck
npm run lint
npx nx run-many -t build test typecheck --no-tui
```

For generated products in this repo, also verify the project ids resolve through Nx:

```bash
npx nx show project @ksojecki/<name>-api --json
npx nx show project @ksojecki/<name>-web --json
```

If generated tests are removed or replaced, keep the project's test target valid.
