# Workflow

How a feature moves through alper, from `/alper:setup-repository` to a reviewed `feat/<feature>` branch: an overview, then `/alper:spec`, `/alper:build` and one milestone in detail.

## Overview

```mermaid
stateDiagram-v2
    direction LR
    state "/alper:setup-repository" as Setup
    state "/alper:brainstorm" as Brainstorm
    state "/alper:spec" as Spec
    state "/alper:build" as Build
    [*] --> Setup : once per repo
    Setup --> Brainstorm : build settings, GLOSSARY.md
    Brainstorm --> Spec : confirmed brainstorm
    Spec --> Build : approved spec and tickets
    Build --> Setup : missing build setting
    Build --> Build : pause, /clear, rerun
    Build --> [*] : reviewed feat/#lt;feature#gt;
```

## /alper:spec

```mermaid
stateDiagram-v2
    direction LR
    [*] --> Spec : confirmed brainstorm
    state "/alper:spec" as Spec {
        state "brainstorm.md on disk" as OnDisk
        state "architect writes spec" as WriteSpec
        state "user answers gap questions" as GapQuestions
        state markers <<choice>>
        state "drawer draws markers" as Draw
        state "user answers drawer" as DrawerQuestions
        state "user approves spec" as ApproveSpec
        state "architect writes tickets" as WriteTickets
        state "user approves tickets" as ApproveTickets
        [*] --> OnDisk
        OnDisk --> WriteSpec : brainstorm.md
        WriteSpec --> GapQuestions : questions
        GapQuestions --> WriteSpec : Follow-up decisions
        WriteSpec --> markers : spec.md, status draft
        markers --> Draw : draw markers
        markers --> ApproveSpec : no markers
        Draw --> DrawerQuestions : questions or render failure
        DrawerQuestions --> Draw : answers or change
        DrawerQuestions --> ApproveSpec : keep the marker
        Draw --> ApproveSpec : drawings in place
        ApproveSpec --> WriteSpec : changes requested
        ApproveSpec --> WriteTickets : status approved
        WriteTickets --> ApproveTickets : tickets draft, build order
        ApproveTickets --> WriteTickets : changes requested
        ApproveTickets --> [*] : tickets approved
    }
    Spec --> [*] : next /alper:build
```

## /alper:build

```mermaid
stateDiagram-v2
    direction LR
    [*] --> Build : approved spec and tickets
    state "/alper:build" as Build {
        state "check the preconditions" as Pre
        state "pick the target" as Target
        state "enter the build worktree" as FeatBranch
        state "milestone m#lt;NN#gt;" as Milestone {
            state "build the tickets" as Tickets
            state "two-axis review" as Review
            state "land the milestone" as Land
            [*] --> Tickets : milestone branch
            Tickets --> Review : every ticket done
            Review --> Review : fix cycle, at most 2
            Review --> Land : Clean
            Land --> [*] : milestone merge on feat
        }
        state landed <<choice>>
        state "final Spec-only check" as Final
        state "report" as Report
        state "stopped for the user" as Stopped
        [*] --> Pre
        Pre --> Target : every check holds
        Pre --> Stopped : failed check
        Target --> FeatBranch : milestones not landed
        Target --> Report : already landed
        FeatBranch --> Milestone : feat/#lt;feature#gt;, base recorded
        FeatBranch --> Stopped : full suite red
        Milestone --> landed : landed
        Milestone --> Stopped : blocked or findings remain
        landed --> Milestone : next milestone
        landed --> Final : last milestone
        landed --> Report : mNN target or pause on
        Final --> Report : Spec findings
        Stopped --> [*] : report and stop
        Report --> [*] : PR or /clear, rerun
    }
    Build --> [*]
```

## One milestone

```mermaid
stateDiagram-v2
    direction LR
    [*] --> Milestone : inside the build worktree
    state "milestone m#lt;NN#gt;" as Milestone {
        state "cut or resume milestone branch" as Cut
        state "next ticket" as Next
        state "developer builds it" as Dev
        state handback <<choice>>
        state "user answers questions" as Questions
        state "reset, developer retries on Opus" as Retry
        state "two-axis review" as Review
        state "developer fixes findings" as Fix
        state "land on feat/#lt;feature#gt;" as Land
        state "stopped for the user" as Stopped
        [*] --> Cut
        Cut --> Next : milestone branch, clean tree
        Next --> Dev : lowest-numbered ticket, blockers done
        Dev --> handback : hand-back
        Retry --> handback : hand-back
        handback --> Next : green, one commit
        handback --> Questions : questions
        handback --> Retry : stuck, first time
        handback --> Stopped : stuck after Opus retry, ticket blocked
        Questions --> Dev : answers, Follow-up decisions
        Next --> Review : every ticket done
        Next --> Stopped : tickets blocked
        Review --> Land : Clean
        Review --> Fix : Fix, under 2 cycles
        Fix --> Review : fix committed
        Review --> Stopped : Fix, 2 cycles used
        Land --> [*] : Milestone trailer on feat
        Stopped --> [*] : report and stop
    }
    Milestone --> [*] : next milestone or done
```
