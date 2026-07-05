# Worksmith Core Upgrade Notes

Read this file before applying a newer `tools/worksmith/core/` over an already-adopted
project. Each entry below documents one released core change and any manual step it
requires. Entries are added when a real change to `core/` needs one — this file starts
empty of real entries because no versioned release has happened yet.

## Convention

Each entry uses this shape:

```text
## <version or date> — <one-line summary>

Core update steps:
- <what changed in core/>

Scaffold changes, if any:
- <what changed in scaffold/, and whether it affects already-adopted projects>

Manual migration steps:
- <any step an adopting project must perform by hand; write "None." if there is none>

Validation commands:
- npm run project:test
- npm run project -- validate

Never-overwrite reminder:
- docs/project/*, docs/development/PROJECT_ADMINISTRATION.md, .worksmith/topics.json,
  the work queue and work items are never touched by this or any core update.
```

## Entries

None yet. This file is a seed for the convention above, added by
`docs/work-items/AB-250.md`. The first real entry should be added the next time
`tools/worksmith/core/` changes in a way that matters to an already-adopted project —
in particular, note here if `scripts/project-administration/configuration.ts` is ever
split into a generic core loader and a separate project-values file (see this kit's
`README.md` "Known Limitations"), since that would be exactly the kind of change an
adopting project needs explicit migration guidance for.
