# Milestone branches gate the feature branch

`/alper:build` merges tickets one at a time into a milestone branch and merges that branch into `feat/<feature>` only after the milestone's two-axis review is Clean, so the feature branch receives only reviewed milestones. This replaces the original single review per feature: one review over a large feature was too big to read well and left unreviewed work on `feat/<feature>` for most of the build, while review per ticket costs a review per ticket.

## Considered options

- **One review per feature** (the original design): cheapest, but `feat/<feature>` holds unreviewed work and the review grows with the feature.
- **Review per ticket**: smallest reviews, but the cost scales with the ticket count; rejected.
- **Merge tickets only at the end of a milestone**: keeps tickets apart longer, but defers integration and its conflicts to one large merge; rejected.

## Consequences

- Resume reads progress from git: a milestone has landed exactly when `feat/<feature>` holds a merge with its `Milestone: <feature>/<NN>` trailer, and fix cycles are counted from `Review-fix:` trailers. Changing the branch model later means migrating features built under it.
- Developers and the merger take the integration branch as a parameter instead of assuming `feat/<feature>`.
