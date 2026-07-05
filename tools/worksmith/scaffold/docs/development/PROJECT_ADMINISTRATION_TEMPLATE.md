<!--
Non-authoritative template. Copy into your project as
docs/development/PROJECT_ADMINISTRATION.md (or an equivalent path), replace every
<PLACEHOLDER>, and delete this comment block.
-->

# <PROJECT_NAME> Project Administration Mini Application

## Administration Version

This is an internal, copied-and-configured instance of the Worksmith-style Project
Administration CLI bootstrapped from the `tools/worksmith/` distribution kit in the
source repository. **It is not a published npm package.** Standalone extraction and
packaging remain deferred until real experience across more than one adopting project
justifies that investment.

## Purpose

The Project Administration CLI provides deterministic tooling for
<PROJECT_NAME>'s work-item identifiers, files, metadata, lifecycle state and work
queue. The repository remains the source of truth. The tool does not commit, push,
deploy or upload files to external contexts.

## Commands

Run from the repository root:

```bash
npm run project -- init [target-directory] [--dry-run]
npm run project -- validate [--detail summary|full]
npm run project -- config [--output terminal|json]
npm run project -- queue [--output terminal|json|handoff] [--shell powershell|bash]
npm run project -- allocate-id <PREFIX>
npm run project -- create manifest.json [--dry-run] [--detail full]
npm run project -- transition <id> <expected-status> <target-status> [--dry-run]
npm run project -- complete <id> --approved [--dry-run]
npm run project -- draft compile draft.md
npm run project -- show <id> [--output terminal|json]
npm run project -- topics [--output terminal|json]
npm run project -- disposition-report [--output terminal|json]
npm run project -- handoff <id> [--output terminal|json]
npm run project:test
```

### Read-Only Vs. Mutating Commands

Read-only, never write, never acquire the mutation lock: `validate`, `config`,
`queue`, `draft compile`, `show`, `topics`, `disposition-report`, `handoff`.

Mutating, require preview/apply discipline: `init`, `create`, `transition`,
`complete`. These acquire an exclusive repository mutation lock during their write
transaction.

## Safety Rules

- Run commands from the intended project root.
- Use dry-run before transition, completion, initialization and other mutating
  commands unless the command has its own internal preflight (normal `create` does).
- Treat validation errors as blocking; warnings require review but do not fail.
- Never edit metadata and its queue entry as separate manual operations.
- Never retrofit metadata into immutable legacy work items.
- Never use initialization to repair or replace an existing queue.

## Initialization

```bash
npm run project -- init [target-directory] --dry-run
npm run project -- init [target-directory]
```

Initialization creates the configured work-item directory and a queue containing
every configured lifecycle section. It never overwrites an existing queue. It does
**not** create documentation, does not configure `configuration.ts`, and does not
create a first work item — those remain manual steps (see the `tools/worksmith/`
kit's `START_HERE_FOR_AI.md` adoption flow in the source repository).

## Assistant Handoff Rendering

`npm run project -- handoff <id>` renders a deterministic Markdown task-prompt block
for one existing work item: read-first boilerplate, the item's own
Goal/Scope/Out-of-Scope/Verification sections, parsed topic/disposition context when
present, the exact valid lifecycle transition commands for the item's current status,
and a fixed reminder that permanent documentation and current repository state
outrank historical work-item prose. It never mutates anything and never performs
broad historical search — only exact-id lookups.

## Known Bootstrap Limitations

- `disposition-report` and `handoff`'s disposition reminder check the literal analysis
  prefix `"AN"` and the literal statuses `"in_progress"`/`"needs_review"` rather than
  reading them from configuration. If your project uses different names for these,
  those two specific features will not trigger — no error, just silent non-function.
  Keep those exact names if you want the features to work out of the box.
- Prefixes, statuses, transitions, metadata sentinels and standard work-item sections
  are configured directly in `scripts/project-administration/configuration.ts` (a
  TypeScript file), not via a separate JSON configuration file.
- The six top-level command scripts (`create-work-item.ts`, `transition-work-item.ts`,
  `complete-work-item.ts`, `validate-project-administration.ts`, `draft-compile.ts`,
  `allocate-work-item-id.ts`) must be copied alongside `scripts/project-administration/`
  — they are not yet consolidated into one folder.

## Future Capabilities

Multiple metadata-enabled active items, fully configuration-driven prefixes/statuses,
and standalone/npm packaging are not current capabilities. They require separate
approved design, implementation, migration and regression-test work.
