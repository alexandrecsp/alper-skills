# Alper files live under .sdd

Every file alper writes in a repo lives under `.sdd/`: specs, the dashboard, the glossary, ADRs, the coding standards it drafts, drawings and test-runner wrappers. Only the `## Agent workflow` block in `CLAUDE.md` or `AGENTS.md`, the `.gitignore` line and the build worktree stay outside, because the harness and git look for them elsewhere. One directory keeps the framework's footprint separate from the repo's own `docs/` and `scripts/`, and makes it obvious what to move, review or delete.

## Considered options

- **Files spread across the repo** (the previous layout: `.specs/`, root `GLOSSARY.md`, `docs/adr/`, `scripts/`): each in its conventional place, but mixed with files the team owns, so setup could not tell its own files from theirs.
- **A visible `sdd/` directory**: found by ripgrep's default search, but it sits beside the repo's source as if it were product code.

## Consequences

- The glossary and ADRs are hidden from ripgrep's default search, like the specs already were; the agent-workflow block names their paths, and agents open them by path.
- `/alper:setup-repository` moves a legacy layout with `git mv`, but only once no build worktree exists, since a running build reads its specs from its own branch.
- A team's own `docs/adr/`, kept before alper, stays where the user chooses at setup.
