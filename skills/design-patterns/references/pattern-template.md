# Pattern file template

Every file in this catalog follows this shape. Write it in your own words: Refactoring Guru and similar sites are background reading, never text to copy.

````markdown
# <Pattern name>

## Problem

<the force that earns the pattern, in one or two sentences>

## Use when

- <a concrete situation the feature can be checked against>

## Skip when

- <a situation that looks similar> → <what to write instead>

## Shape

```ts
<the smallest TypeScript sketch that shows every role>
```

## Rules

- <a rule the build follows and the review checks>

## Misuse signs

- <something a reviewer can see in the diff>
````

- **Skip when** routes to the alternative, usually plain code or another pattern by name.
- **Shape** stays under about 30 lines.
- **Rules** and **Misuse signs** are what the code reviewer checks, so each one is observable in a diff.
- Add the pattern's line to the index in [SKILL.md](../SKILL.md), phrased as the problem, not the pattern name.
