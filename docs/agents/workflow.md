# Agent Workflow

## 1) Discovery

- Check `README.md`, `AGENTS.md`, and `docs/README.md`.
- Confirm the current Nx workspace state (`nx.json`, `package.json`).
- For new features, identify MVP scope vs non-goals.

## 2) Plan

- Define implementation steps and validation points.
- If a durable architecture decision is made, create or update an ADR.
- Follow root-level defaults (TS, Oxlint, Prettier).

## 3) Delivery Loop

- Use a plan -> implementer -> tester -> review loop for scoped changes.
- The reusable skill for this loop lives at `.agents/skills/agent-delivery-loop/SKILL.md`.
- Model split for that skill:
  - Plan and Review use `GPT-5.4`.
  - Implementer and Tester use `GPT-5 mini`.
- If review finds a gap, spawn the implementer again with the review evidence and continue through tester and review.
- Keep the reviewer agent in the background when possible so review context is not lost between sessions.
- Keep each pass narrow and evidence-driven.
- Revisit the plan after any failed validation before widening the change.

## 4) Implementation

- Make small changes, ideally one goal per change.
- Do not override local package conventions unless necessary.
- For API changes, keep alignment with `docs/architecture/`.
- Keep generated code and comments in English.
- For new plugins, use a folder-based structure with `index.ts` as a thin entrypoint and focused modules (types + implementation files), matching the `database` plugin style.
- For larger modules in general, split by responsibility once complexity grows (avoid monolithic files).

## 5) Validation

- Run lint/format and a quick smoke-check after major changes.
- Before a PR, verify whether documentation updates are required.

## 6) Handover

- In the change description, include what changed, where, why, and how to verify.
- Add links to updated docs and ADRs when relevant.
