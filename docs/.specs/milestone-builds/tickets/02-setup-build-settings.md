---
id: "02"
title: Setup asks for the build settings and writes them into the workflow block
status: done
blocked-by: []
branch: ticket/milestone-builds/02-setup-build-settings
milestone: "01"
touches: ["setup-repository"]
---

## What it delivers

`/alper:setup-repository` asks for the four build settings in its one round of questions and writes them as bullets in the `## Agent workflow` block; a re-run asks only for the settings missing from the block and keeps the existing values.

## Acceptance criteria

- [ ] On a first run, the one round of questions asks all four settings in the brainstorm question format: Parallel test suites (✅ yes), Parallel cap (✅ 3, or 1 when test suites cannot run at the same time, or another number), Pause between milestones (✅ off), Install command (the user states or confirms it, or `none`).
- [ ] The block template gains the four bullets exactly as the spec shows them (`- Parallel cap: 3`, `- Parallel test suites: yes`, `- Pause between milestones: off`, `- Install command: npm ci`), with the allowed values stated: `yes`/`no`, `on`/`off`, a command or `none`.
- [ ] Explore records which of the four settings the existing block already holds.
- [ ] On a re-run, only the settings missing from the block are asked; existing values are written back unchanged, and a re-run with every setting present and no new answers still changes no file.
- [ ] The Verification checklist covers the four settings and the re-run rule.
- [ ] `node skills/writing-for-agents/scripts/lint-skill.js .` and `claude plugin validate .` pass.

## Test seams

Behaviour seam, scenario 11 (setup on the sample repo, then a re-run with one setting deleted: only that setting is asked), checked at release. Structure seam: `lint-skill.js`.

## Notes

- Spec sections: User Stories 19, 20, 22; Implementation Decisions › `setup-repository`; Success Criterion for scenario 11 (settings half).
- Deriving the install command from the lockfile or manifest is ticket 12 (milestone 02); here the question simply asks for the command.
- `/alper:build` reads these four bullet names verbatim (tickets 08, 09, 12, 17); keep the names exactly as the spec writes them.
- Checks: no typecheck or test suite; ticket tests and full suite are the two commands above.
