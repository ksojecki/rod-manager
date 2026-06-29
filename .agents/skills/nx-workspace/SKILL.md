---
name: nx-workspace
description: "Explore and understand Nx workspaces. USE WHEN answering questions about the workspace, projects, or tasks. ALSO USE WHEN an nx command fails or you need to check available targets/configuration before running a task. EXAMPLES: 'What projects are in this workspace?', 'How is project X configured?', 'What depends on library Y?', 'What targets can I run?', 'Cannot find configuration for task', 'debug nx task failure'."
---

# Nx Workspace Exploration

This skill is for read-only Nx workspace exploration. In this repo, prefer machine-readable Nx commands first and use the graph only when `nx show` is not enough.

This workspace uses npm, so prefer `npx nx ...` examples.

## Listing Projects

Use `npx nx show projects --json` to list projects in the workspace.

```bash
# List all projects
npx nx show projects --json

# Filter by target
npx nx show projects --withTarget build --json

# Filter by type
npx nx show projects --type lib --json

# Filter affected projects
npx nx show projects --affected --exclude="*-e2e" --json
```

## Project Configuration

Use `npx nx show project <name> --json` to get the full resolved configuration for a project.

Important: do not rely on `project.json` alone. `nx show project --json` includes plugin-inferred targets.

```bash
# Get full project configuration
npx nx show project @ksojecki/rod-manager-api --json

# Extract useful sections
npx nx show project @ksojecki/rod-manager-api --json | jq '.targets'
npx nx show project @ksojecki/rod-manager-api --json | jq '.targets | keys'
npx nx show project @ksojecki/rod-manager-api --json | jq '{name, root, sourceRoot, projectType, tags}'
```

## Target Information

```bash
# List all targets for a project
npx nx show project @ksojecki/rod-manager-web --json | jq '.targets | keys'

# Get full target configuration
npx nx show project @ksojecki/rod-manager-web --json | jq '.targets.build'

# Check executor or command
npx nx show project @ksojecki/rod-manager-web --json | jq '.targets.build.executor'
npx nx show project @ksojecki/rod-manager-web --json | jq '.targets.build.command'
```

## Workspace Configuration

Read `nx.json` directly for workspace-level configuration.

```bash
cat nx.json
cat nx.json | jq '.targetDefaults'
cat nx.json | jq '.namedInputs'
cat nx.json | jq '.plugins'
cat nx.json | jq '.generators'
```

## Affected Projects

If the user is asking about affected projects, also read `references/AFFECTED.md`.

## Common Exploration Patterns

### What's In This Workspace?

```bash
npx nx show projects --json
npx nx show projects --type app --json
npx nx show projects --type lib --json
```

### How Do I Build, Test, or Lint Project X?

```bash
npx nx show project X --json | jq '.targets | keys'
npx nx show project X --json | jq '.targets.build'
```

### What Depends On Library Y?

Use graph output only when `nx show` is insufficient:

```bash
npx nx graph --print | jq '.graph.dependencies | to_entries[] | select(.value[].target == "Y") | .key'
```

## Programmatic Answers

Always prefer `--json` output and process it with `jq` instead of manually reading formatted output.

```bash
# Count projects
npx nx show projects --json | jq 'length'

# Filter project names
npx nx show projects --json | jq '.[] | select(contains("rod-manager"))'

# Get affected projects as an array
npx nx show projects --affected --json | jq '.'
```
