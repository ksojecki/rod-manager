# Operations Notes

## Standard commands

```sh
npm ci
npm run format:check
npm run lint
```

## After adding the first Nx packages

```sh
node ./node_modules/nx/bin/nx.js run-many -t lint test build typecheck
node ./node_modules/nx/bin/nx.js sync
```

## Documentation update rules

- If you change workflow, update `docs/agents/workflow.md`.
- If you change architecture, update `docs/architecture/*` and ADRs.
- If you change repo conventions, update `AGENTS.md`.
