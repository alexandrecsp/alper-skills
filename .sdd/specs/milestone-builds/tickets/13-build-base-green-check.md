---
id: "13"
title: The first run refuses a red base
status: done
blocked-by: ["07"]
branch: ticket/milestone-builds/13-build-base-green-check
milestone: "02"
touches: ["build"]
---

## What it delivers

On the first run (no `feat/<feature>` yet), in any mode, the build runs the full suite on the current branch before recording `base`. Red stops the build with the failures and writes nothing; green continues as today.

## Acceptance criteria

- [ ] The first-run section runs the full suite on the current branch before anything is written.
- [ ] Red → the build stops and reports the failures; no `base` commit is made and `feat/<feature>` is not created.
- [ ] Green → `base` is recorded in the spec frontmatter and committed on the base branch, then `feat/<feature>` is created.
- [ ] The check runs only when `feat/<feature>` does not exist, whatever the mode.
- [ ] Stop conditions add a red base.
- [ ] `node skills/writing-for-agents/scripts/lint-skill.js .` and `claude plugin validate .` pass.

## Test seams

Behaviour seam, scenario 6 (red base: the build stops naming the failures, `git status --porcelain` empty, `feat/<feature>` absent). Checked at release. Structure seam: `lint-skill.js`.

## Notes

- Blocked by 07: edits its first-run section.
- Spec sections: User Story 26; Implementation Decisions › `build` › First run.
- Other tickets edit this skill in parallel; stay inside the first-run section and append one stop condition.
- Checks: no typecheck or test suite; ticket tests and full suite are the two commands above.
