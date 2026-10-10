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
- **`docs/.specs/<feature>/brainstorm.md` already exists** → run the Process from step 2.
- **No brainstorm exists** → invoke `brainstorm` first, then run the Process.
- **The spec is approved but tickets are not** → run the Process from step 4.

## Process

### 1. Put the brainstorm on disk

Use the `[feature]` argument as the kebab-case `<feature>` slug; without one, propose a slug and confirm it with the user. Write the confirmed what and how blocks to `docs/.specs/<feature>/brainstorm.md`, unchanged. Paths: [artifacts](../../references/artifacts.md).

Done when: `brainstorm.md` exists and matches the what and how blocks the user said yes to.

### 2. Get the spec written

Dispatch `alper:architect`: "Apply `write-spec` for `<feature>`, from `docs/.specs/<feature>/brainstorm.md`."

- **It returns questions** → show them to the user verbatim under `**Spec · round <n>**`, keeping its numbering and `Next round` lines, then append the answers to `brainstorm.md` under `## Follow-up decisions`, and dispatch again.
- **It returns the spec path** → continue.

Done when: `spec.md` exists with `status: draft`.

### 3. Approve the spec

Show the user the spec path and a summary: user stories count, the key implementation decisions, out of scope, success criteria. Ask for an explicit yes.

- **Changes requested** → send them to the architect and show the new version.
- **Yes** → set `status: approved` in the spec frontmatter.

Done when: `status: approved` is set after an explicit yes.

### 4. Get the tickets written

Dispatch `alper:architect`: "Apply `write-tickets` for `<feature>`." Set `tickets: draft` in the spec frontmatter when the files exist.

Done when: the ticket files exist and the architect returned the breakdown table and frontier waves.

### 5. Approve the tickets

Show the table and the waves. Ask: does the granularity fit, are the edges right, should any ticket merge or split? Changes go back to the architect. On an explicit yes, set `tickets: approved`.

Done when: `tickets: approved` is set after an explicit yes.

### 6. Hand back

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
- A returned question answered without the user (step 2)
- `status` or `tickets` set to `approved` without an explicit yes (steps 3 and 5)
- A build started from this skill (step 6)

## Verification

- [ ] `brainstorm.md` matches the confirmed what and how blocks, plus any follow-up decisions.
- [ ] Every question the architect returned was answered by the user.
- [ ] `status: approved` and `tickets: approved` were each set after an explicit yes.
- [ ] The turn ended with `/alper:build` offered and not started.
