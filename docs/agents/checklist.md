# Agent Checklist

Use this list before closing a task.

## Scope and architecture

- [ ] Is the change within MVP scope?
- [ ] Is the change aligned with `docs/architecture/mvp-plan-react-fastify-sqlite.md`?
- [ ] Is a new ADR required, or does an existing ADR need an update?

## Quality

- [ ] Does the code respect ESLint rules (including no `any` and no floating promises)?
- [ ] Do public methods include JSDoc descriptions (where applicable)?
- [ ] Is formatting aligned with Prettier (2-space indentation)?
- [ ] Are documentation updates written in English?
- [ ] Is generated code written in English (identifiers, comments, user-facing text)?

## Operations

- [ ] Does the change keep Nx inferred targets intact?
- [ ] Do pre-commit scripts/hooks still work?
- [ ] Was documentation updated when workflow or architecture changed?
