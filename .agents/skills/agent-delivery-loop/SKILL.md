---
name: agent-delivery-loop
description: Run a reusable plan -> implementer -> tester -> review loop for scoped code changes in this workspace.
---

# Agent Delivery Loop

Use this skill when a task needs a controlled implementation cycle instead of a single pass.

## Loop

1. Plan.
   - Restate the goal, constraints, and exact files likely to change.
   - Identify the smallest safe implementation path and the checks that prove it.
2. Implementer.
   - Spawn an implementer that makes the smallest change satisfying the current plan step.
   - Keep edits scoped to the accepted objective.
   - Continue the same implementer run into tester and review instead of handing off to a separate targeted rework phase.
3. Tester.
   - Run the narrowest relevant validation commands first.
   - Capture failures as concrete evidence, not guesses.
4. Review.
   - Compare the result against the original acceptance criteria and repo conventions.
   - Check for regressions, missing config updates, and unintended scope creep.
   - Keep a reviewer agent in the background when possible so review context is preserved between sessions.
5. Repeat.
   - If review finds a gap, spawn the implementer again with the review evidence and continue through tester and review.
   - Repeat until validation is clean or the remaining risk is explicit.

## Operating Rules

- Do not skip validation before handoff on non-trivial work.
- Prefer one behavioral change per cycle.
- If validation fails, address the root cause before broadening the change set.
- Avoid touching unrelated files unless they are strictly necessary for correctness.
- Record the commands run and the files changed so the handoff is auditable.

## Handoff

Summarize:

- The final outcome.
- Exact files changed.
- Assumptions made.
- Validation commands and results.
- Any remaining risk or follow-up work.
