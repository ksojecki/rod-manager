---
name: nx-run-tasks
description: Helps with running tasks in an Nx workspace. USE WHEN the user wants to execute build, test, lint, serve, or run any other tasks defined in the workspace.
---

# Nx Task Execution

This workspace uses npm and Nx. Prefer the repo's documented npm scripts when they exist, and use direct `npx nx` commands for narrower or project-specific execution.

When running Nx commands as an agent, prefer `--no-tui` whenever the command supports it.

## Repo Defaults

- Install deps: `npm ci`
- Lint the workspace: `npm run lint`
- Format check: `npm run format:check`
- Typecheck the workspace: `npm run typecheck`
- Run the CI-equivalent task set: `npx nx run-many -t lint test build typecheck --no-tui`

## Understand Which Tasks Can Be Run

Use `npx nx show project <project-name> --json` and inspect `.targets`. This returns resolved targets, including plugin-inferred ones.

## Run a Single Task

```bash
npx nx run <project>:<task> --no-tui
```

## Run Multiple Tasks

```bash
npx nx run-many -t build test lint typecheck --no-tui
```

Use `-p` or `--projects` to narrow scope.

Examples:

- `npx nx run-many -t test -p @ksojecki/rod-manager-api @ksojecki/rod-manager-web --no-tui`
- `npx nx run-many -t lint --projects=@ksojecki/recepturomat-web --no-tui`

## Run Tasks for Affected Projects

Use affected runs when the user wants narrower validation than the full workspace.

```bash
npx nx affected -t build test lint --base=main --head=HEAD --no-tui
```

You can also pass `--files=...` for file-driven affected runs.

## Useful Flags

These flags work with `run`, `run-many`, and `affected`:

- `--no-tui` — disable interactive output for agent runs
- `--skipNxCache` — rerun tasks even when results are cached
- `--verbose` — print additional information such as stack traces
- `--nxBail` — stop execution after the first failed task
- `--configuration=<name>` — use a specific configuration (e.g. `production`)
