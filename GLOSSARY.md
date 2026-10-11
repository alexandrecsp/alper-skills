# alper

A Claude Code plugin that moves a feature from a brainstorm to a spec, tickets and a reviewed feature branch. These are the words its skills, agents and specs use.

## Language

### Building a feature

**Milestone**:
A group of tickets the architect declares in the spec, delivering specific user stories the user can demo. A spec with no declared milestones has one implicit milestone.
_Avoid_: wave, phase, stage

**Wave**:
A set of tickets that become unblocked together in a ticket breakdown; a computed view, never a milestone.
_Avoid_: batch, milestone

**Landed**:
Said of a milestone once the feature branch holds its milestone merge.
_Avoid_: finished, shipped, done (for milestones)

**Milestone branch**:
The branch one milestone's tickets and fixes merge into, cut from the feature branch after the previous milestone landed.
_Avoid_: staging branch, release branch

**Integration branch**:
The branch a ticket or review fix is cut from and merged back into: its milestone branch.
_Avoid_: target branch, parent branch

**Frontier**:
Every `todo` ticket of the current milestone whose blockers are all `done`.
_Avoid_: ready queue, backlog

**Parallel cap**:
The most tickets a build has dispatched and not yet merged at one time, a setting the user chooses.
_Avoid_: concurrency, worker count, max parallel

### Problems during a build

**Stuck**:
A developer's hand-back saying its ticket cannot get green, naming the failing check. A stuck ticket gets one retry on Opus.
_Avoid_: failed, errored

**Blocked**:
A ticket status: the ticket cannot get green after its retry, or its merge cannot get green; the build stops for the user.
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
