---
id: "03"
title: The architect declares milestones in every new spec
status: done
blocked-by: ["01"]
branch: ticket/milestone-builds/03-write-spec-milestones
milestone: "01"
touches: ["write-spec"]
---

## What it delivers

`write-spec` produces specs with a `## Milestones` section: the architect groups the user stories into milestones that each deliver something demoable, every new spec declares at least one.

## Acceptance criteria

- [ ] The spec template in `write-spec` step 4 has a `## Milestones` section between `## User Stories` and `## Implementation Decisions`, in the contract the Artifacts reference defines, linked rather than restated beyond the template lines.
- [ ] Step 4 states that every new spec declares at least one milestone, that each milestone delivers specific user stories the user can demo, that every user story belongs to exactly one milestone, and that computed waves are not milestones.
- [ ] Step 4's Done when and the Verification checklist include the milestone rules (at least one milestone; every story in exactly one).
- [ ] A Red Flag names a spec with no `## Milestones` section, or a milestone that is a computed wave.
- [ ] `node skills/writing-for-agents/scripts/lint-skill.js .` and `claude plugin validate .` pass.

## Test seams

Structure seam (`lint-skill.js`, including the link into the Artifacts reference). Behaviour: the next spec written with `/alper:spec` carries a `## Milestones` section, checked at release.

## Notes

- Blocked by 01: links the `## Milestones` contract that 01 adds to the Artifacts reference.
- Spec sections: User Stories 1, 2; Implementation Decisions › `write-spec`.
- Glossary: Milestone (avoid wave, phase, stage); Wave is a computed view, never a milestone.
- Checks: no typecheck or test suite; ticket tests and full suite are the two commands above.
