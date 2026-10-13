# alper

A Claude Code plugin that moves a feature from a brainstorm to a spec, tickets and a reviewed feature branch. These are the words its skills, agents and specs use.

## Language

### Deciding

**Decision record**:
The file a feature's spec is written from: its confirmed brainstorm, or for a bug fix its diagnosis. Follow-up decisions are appended to it.
_Avoid_: input doc, source doc

**Diagnosis**:
A bug's confirmed record: its symptom, reproducer, root cause, blast radius and the fix the user chose. It is the decision record of a bug fix.
_Avoid_: bug report, triage, investigation

**Reproducer**:
A test that goes red on a bug's symptom and was seen red before any fix.
_Avoid_: repro script, failing case

**Root cause**:
The place in the code and the mechanism that produce a bug's symptom, proven when a change there turns the reproducer green.
_Avoid_: culprit (for the code), source of the bug

### Building a feature

**Milestone**:
A group of tickets the architect declares in the spec, delivering specific user stories the user can demo. A spec with no declared milestones has one implicit milestone.
_Avoid_: wave, phase, stage

**Landed**:
Said of a milestone once the feature branch holds its milestone merge.
_Avoid_: finished, shipped, done (for milestones)

**Milestone branch**:
The branch one milestone's tickets and fixes are committed on, one commit each, cut from the feature branch after the previous milestone landed.
_Avoid_: staging branch, release branch, integration branch

**Build worktree**:
The git worktree at `.claude/worktrees/<feature>` where a build runs from start to end, leaving the main checkout to the user.
_Avoid_: sandbox, workspace

**Gotcha**:
A one-line trap of the target repo every agent must know, kept in its `## Agent workflow` block and added by the build when a hand-back reports one.
_Avoid_: lesson, tip, note

### Problems during a build

**Stuck**:
A developer's hand-back saying its ticket cannot get green, naming the failing check. A stuck ticket gets one retry on Opus.
_Avoid_: failed, errored

**Blocked**:
A ticket status: the ticket cannot get green after its retry; the build stops for the user.
_Avoid_: stuck (for the status), failed

**Follow-up decision**:
A decision the user makes after the brainstorm was confirmed, recorded in the brainstorm under `## Follow-up decisions`.
_Avoid_: amendment, spec change

### Review

**Fix cycle**:
One developer pass fixing a review's gaps and hard violations, followed by a new review. A milestone gets at most two.
_Avoid_: fix round, iteration

**Final Spec-only check**:
The Spec-axis review of the whole feature after its last milestone lands; it reports findings and starts no fix cycle.
_Avoid_: final review, feature review
