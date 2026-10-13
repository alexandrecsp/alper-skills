---
name: spec
argument-hint: "[feature]"
description: Turn a confirmed brainstorm into an approved spec and approved tickets, via the architect, with an approval stop after each.
disable-model-invocation: true
metadata:
  type: process
---

# Spec

## Overview

Moves a confirmed brainstorm to an approved spec and approved tickets. The `alper:architect` writes both from files, never from this conversation, so everything it needs goes to disk first; every decision it cannot make comes back to the user.

## When to Use

- **A brainstorm was just confirmed in this conversation** → run the Process from step 1.
- **`.specs/<feature>/brainstorm.md` already exists** → run the Process from step 2.
- **No brainstorm exists** → invoke `brainstorm` first, then run the Process.
- **The spec is approved but tickets are not** → run the Process from step 5.

## Process

### 1. Put the brainstorm on disk

Use the `[feature]` argument as the kebab-case `<feature>` slug; without one, propose a slug and confirm it with the user. Write the confirmed what and how blocks to `.specs/<feature>/brainstorm.md`, unchanged. Paths: [artifacts](../../references/artifacts.md).

Done when: `brainstorm.md` exists and matches the what and how blocks the user said yes to.

### 2. Get the spec written

Dispatch `alper:architect`: "Apply `write-spec` for `<feature>`, from `.specs/<feature>/brainstorm.md`."

- **It returns questions** → show them to the user verbatim under `**Spec · round <n>**`, keeping its numbering and `Next round` lines, then append the answers to `brainstorm.md` under `## Follow-up decisions`, and dispatch again.
- **It returns the spec path** → continue.

Done when: `spec.md` exists with `status: draft`.

### 3. Draw the marked diagrams

When `spec.md` holds draw markers ([artifacts](../../references/artifacts.md#draw-marker)), dispatch `alper:drawer`: "Apply `draw-visual` to every draw marker in `.specs/<feature>/spec.md`."

- **It returns questions** → put them to the user, then dispatch again with the answers.
- **It returns a render failure** → show the user the error and the last source, and ask whether to retry with a change or keep the marker.

Done when: no draw marker remains in `spec.md`, or the user chose to keep each one that does.

### 4. Approve the spec

Show the user the spec path and a summary: user stories count, the key implementation decisions, out of scope, success criteria. Ask for an explicit yes.

- **Changes requested** → send them to the architect and show the new version.
- **Yes** → set `status: approved` in the spec frontmatter.

Done when: `status: approved` is set after an explicit yes.

### 5. Get the tickets written

Dispatch `alper:architect`: "Apply `write-tickets` for `<feature>`." Set `tickets: draft` in the spec frontmatter when the files exist.

Done when: the ticket files exist and the architect returned the breakdown table.

### 6. Approve the tickets

Show the table, with its `Milestone` column, unchanged. Ask: does the granularity fit, are the edges right, should any ticket merge or split? Changes go back to the architect. On an explicit yes, set `tickets: approved`.

Done when: `tickets: approved` is set after an explicit yes.

### 7. Hand back

Tell the user the next step is `/alper:build`, then end the turn.

Done when: the turn ends with no build started.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The architect can read the conversation" | A dispatched agent starts with a fresh context. Everything it needs goes in `brainstorm.md`. |
| "The architect's recommendation is fine, I'll accept it" | The decisions are the user's. Put every returned question to the user. |
| "The user said 'looks good', that's approval" | Ask for an explicit yes before flipping any status. |
| "Tickets are approved, I'll start the build" | The build is the user's call. Hand back and end the turn. |

## Red Flags

- The architect dispatched before `brainstorm.md` exists (step 1)
- A returned question answered without the user (steps 2 and 3)
- The spec shown for approval with a draw marker the user did not choose to keep (step 3)
- `status` or `tickets` set to `approved` without an explicit yes (steps 4 and 6)
- A build started from this skill (step 7)

## Verification

- [ ] `brainstorm.md` matches the confirmed what and how blocks, plus any follow-up decisions.
- [ ] Every question the architect or drawer returned was answered by the user.
- [ ] No draw marker remains in `spec.md` unless the user chose to keep it.
- [ ] `status: approved` and `tickets: approved` were each set after an explicit yes.
- [ ] The turn ended with `/alper:build` offered and not started.
