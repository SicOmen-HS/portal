# Worksmith Distribution/Tooling Area

> **This is a generated/hand-authored distribution area, not a published package.**
> There is no `worksmith` executable and no npm release. `tools/worksmith/` is where
> ArmBase keeps the Worksmith kit self-contained and current; it is not the adopting
> project's own permanent documentation home. See `START_HERE_FOR_AI.md` for the
> adoption instructions.

## What Worksmith Is

Worksmith is the read-through governance workflow this repository uses for its own
work-item lifecycle: strict manifests, a queue, deterministic lifecycle transitions,
read-only discovery commands (`show`, `topics`, `disposition-report`, `handoff`) and a
topic/disposition convention. This directory exists to answer, concretely:

> If a different project wants the same kind of traceability, work-item discipline and
> assistant handoffs, exactly what does it copy, what does it rewrite, what does it
> configure, what does it leave out, and what does it run first — and later, how does
> it receive Worksmith improvements without losing its own adopted documentation?

This is the output of `docs/work-items/AN-021.md` and `docs/work-items/AN-022.md`'s
analyses, implemented by `docs/work-items/AB-250.md`. It supersedes the earlier
`docs/templates/worksmith-adoption/` bundle from `docs/work-items/AB-249.md` — that
bundle's reasoning and templates are carried forward here, not discarded.

## `core/`, `scaffold/` And `examples/`

- **`core/`** is **generated**, never hand-edited. It is a deterministic mirror of
  `scripts/project-administration/` and the six top-level command scripts, produced by
  `scripts/build-worksmith-kit.ts`. It is the part of Worksmith a later update
  refreshes. `MANIFEST.json` (schema version, source path, destination path and a
  content hash for every file) is the drift signal: if `core/` and the live source
  ever disagree, the manifest — and the regression test that checks it — will say so.
- **`scaffold/`** is hand-authored, **one-time** installation material. It becomes
  project-owned the moment it is copied and filled in during first install. It is
  **not a permanent documentation location** — once an adopting project has its own
  `docs/project/PROJECT_RULES.md` and friends, `scaffold/`'s templates may be deleted
  or ignored; nothing in Worksmith ever reads them again.
- **`examples/`** is illustrative only, never active truth, never copied as real data
  (see `examples/topics.json.example`).

## Where Things End Up In An Adopting Project

| In this kit | Becomes, in the adopting project |
| --- | --- |
| `core/project-administration/`, `core/*.ts` | `scripts/project-administration/`, `scripts/*.ts` — updateable |
| `scaffold/AGENTS_TEMPLATE.md` | `AGENTS.md` (project root) |
| `scaffold/docs/project/PROJECT_RULES_TEMPLATE.md` | `docs/project/PROJECT_RULES.md` |
| `scaffold/docs/project/PROJECT_WORKFLOW_TEMPLATE.md` | `docs/project/PROJECT_WORKFLOW.md` |
| `scaffold/docs/project/WORK_ITEM_SCHEMA_TEMPLATE.md` | `docs/project/WORK_ITEM_SCHEMA.md` |
| `scaffold/docs/project/DOCUMENT_INDEX_TEMPLATE.md` | `docs/project/DOCUMENT_INDEX.md` |
| `scaffold/docs/project/PROJECT_STATUS_TEMPLATE.md` | `docs/project/PROJECT_STATUS.md` |
| `scaffold/docs/project/DECISIONS_TEMPLATE.md` | `docs/project/DECISIONS.md` |
| `scaffold/docs/project/PROJECT_CONTEXT_TEMPLATE.md` | `docs/project/PROJECT_CONTEXT.md`, optional |
| `scaffold/docs/development/PROJECT_ADMINISTRATION_TEMPLATE.md` | `docs/development/PROJECT_ADMINISTRATION.md` |
| `scaffold/PACKAGE_SCRIPT_SNIPPET.md` | lines merged into the project's own `package.json` |
| `examples/topics.json.example` | optionally `.worksmith/topics.json`, with the project's own vocabulary |

**This kit is fully self-contained.** Every template needed to reach the adopting
project's target structure lives inside `scaffold/` — there is no separate
`docs/templates/` location to also consult. (An earlier revision of this repository
kept four of these templates under its own `docs/templates/`; they have since been
moved into `scaffold/` specifically so this kit never requires a second lookup
location. That folder no longer exists in this repository.)

## When Worksmith-Style Governance Is Suitable

Adopt it when the new project has: a real need for traceability over time; long-running
development rather than a short-lived experiment; more than one human or AI agent
touching the work across sessions; domain or data decisions whose reasoning would be
missed later if undocumented; import/evidence-based data; a regulated or audit-sensitive
workflow; or recurring handoffs between assistant sessions that currently get
re-explained from scratch each time.

## When It Is Overkill

Skip it for: tiny throwaway prototypes; one-off scripts; low-risk static/content-only
sites; a project with no decision history worth preserving; or fast experiments where
governance overhead would slow learning more than it protects value.

**Simple heuristic:** if not knowing *why* a past decision was made would matter three
months from now, this pays for itself. If the project will likely be deleted or
rewritten before that matters, it will not.

## Known Limitations

- **`scripts/project-administration/configuration.ts` still mixes generic shape with
  this project's own specific values** (prefixes, statuses, timezone) in one file. A
  future core update (overwriting `core/`-derived files) will overwrite an adopting
  project's own configuration values too, since they currently live in the same file
  as the generic policy shape. Until a future, separately scoped change splits this
  file into a generic core loader and a separate project-values file, an adopting
  project must manually re-apply its own configuration values after any core refresh.
- **Two hardcoded ArmBase-specific literals exist in otherwise-generic discovery
  code.** `scripts/project-administration/disposition-report.ts` checks the literal
  string `"AN"` for its analysis-item prefix, and
  `scripts/project-administration/work-item-handoff.ts` checks the literal strings
  `"AN-"`, `"in_progress"` and `"needs_review"` for its disposition reminder. If an
  adopting project uses different prefix or status names, those two specific features
  will silently never trigger — no error, just quiet non-function.
- **Not an npm package, not a standalone repository.** Both remain deferred until a
  second real adopting project has used this kit through at least one full update
  cycle and the configuration split above has actually been implemented.

## Non-Goals

Standalone package extraction; npm publishing; a separate Worksmith repository;
splitting `configuration.ts`; fixing the two hardcoded literals above; making
prefixes/statuses/sentinels configuration-file-driven; multiple-active-item support.
All deferred pending real second-project evidence, consistent with
`docs/work-items/AN-021.md` and `docs/work-items/AN-022.md`.

## `scripts/` Is Source Of Truth — `core/` Is A Generated Mirror

`scripts/project-administration/` and the six top-level command scripts **in this
repository's own `scripts/` directory** remain the single, permanent source of truth
for ArmBase's own runtime behavior. `tools/worksmith/core/` is a **generated
distribution mirror** of those exact files — never the other way around, and never
hand-edited independently. The two directories intentionally contain
byte-identical-looking `.ts` files; that duplication is not accidental drift, it is
the deliberate distribution mechanism, and it is drift-tested (see
`docs/development/PROJECT_ADMINISTRATION.md`'s "Worksmith Distribution Kit" section
and the `worksmith kit core/ and MANIFEST.json match the live runtime source without
drift` regression test). Refresh `core/` after any change to `scripts/` with:

```bash
npm run worksmith:build-kit
```

Never edit `tools/worksmith/core/**` by hand and never delete `scripts/**` in its
favor — `scripts/` is what ArmBase itself runs; `core/` only exists to be copied
elsewhere.
