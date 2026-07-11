# Data- och analysportalen Project Administration Mini Application

## Administration Version

This is an internal, copied-and-configured instance of the Worksmith-style Project
Administration CLI bootstrapped from the `tools/worksmith/` distribution kit. **It is
not a published npm package.** Standalone extraction and packaging remain deferred
until real experience across more than one adopting project justifies that
investment.

## Purpose

The Project Administration CLI provides deterministic tooling for Data- och
analysportalen's work-item identifiers, files, metadata, lifecycle state and work
queue. The repository remains the source of truth. The tool does not commit, push,
deploy or upload files to external contexts.

## Commands

Run from the repository root:

```bash
npm run project -- init [target-directory] [--dry-run]
npm run project -- validate [--detail summary|full]
npm run project -- config [--output terminal|json]
npm run project -- queue [--output terminal|json|handoff] [--shell powershell|bash]
npm run project -- allocate-id AB
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

Optional direct-invocation aliases (equivalent to the unified dispatcher above):

```bash
npm run project:allocate-id -- AB
npm run project:complete -- <id> --approved
npm run project:create-work-item -- manifest.json
npm run project:transition -- <id> <expected-status> <target-status>
npm run project:validate
```

### Read-Only Vs. Mutating Commands

Read-only, never write, never acquire the mutation lock: `validate`, `config`,
`queue`, `draft compile`, `show`, `topics`, `disposition-report`, `handoff`.

Mutating, require preview/apply discipline: `init`, `create`, `transition`,
`complete`. These acquire an exclusive repository mutation lock during their write
transaction.

## Safety Rules

- Run commands from the repository root (`c:\dev\Portal`).
- Use dry-run before transition, completion, initialization and other mutating
  commands unless the command has its own internal preflight (normal `create` does).
- Treat validation errors as blocking; warnings require review but do not fail.
- Never edit metadata and its queue entry as separate manual operations.
- Never retrofit metadata into immutable legacy work items.
- Never use initialization to repair or replace an existing queue.

## Initialization

```bash
npm run project -- init --dry-run
npm run project -- init
```

Initialization creates `docs/work-items/` and `docs/WORK_QUEUE.md` containing every
configured lifecycle section. It never overwrites an existing queue. It does **not**
create documentation, does not configure `configuration.ts`, and does not create a
first work item — those were performed as separate, explicit steps during this
project's adoption (see `docs/project/DECISIONS.md`, DEC-001).

## Assistant Handoff Rendering

`npm run project -- handoff <id>` renders a deterministic Markdown task-prompt block
for one existing work item: read-first boilerplate, the item's own
Goal/Scope/Out-of-Scope/Verification sections, parsed topic/disposition context when
present, the exact valid lifecycle transition commands for the item's current status,
and a fixed reminder that permanent documentation and current repository state
outrank historical work-item prose. It never mutates anything and never performs
broad historical search — only exact-id lookups.

## Creation Manifest Role

The strict JSON manifest is temporary machine input to `npm run project -- create`.
Its schema remains owned by `docs/project/WORK_ITEM_SCHEMA.md`; this CLI reference
does not duplicate that contract.
It is normally generated internally by an authorized planning or implementation
agent within one complete task prompt. It is not the implementation prompt, a
parallel user workflow or permanent project documentation, and the project owner
should not normally need to write or paste it manually. The manifest uses `id: auto`;
Worksmith allocates the identifier. Remove a temporary manifest after a successful
create unless approved scope explicitly adopts it as a permanent file.

Worksmith manages work-item files, metadata and queue synchronization only. It does
not perform or authorize commit, push, pull request, review, merge or deployment.

## Project-Owned Configuration

- `.worksmith/topics.json` — the registered topic vocabulary for this project
  (`portal`, `frontend`, `backend`, `configuration`, `documentation`, `design-system`,
  `mockdata`, `services`, `systems`, `orders`, `data-catalog`, `drift-status`, `ai`,
  `integration`, `security`, `testing`, `deployment`, `worksmith`).
- `.worksmith.json` — presentation configuration: project name "Data- och
  analysportalen", Swedish (`sv`) CLI output language, PowerShell shell (this project
  develops on Windows), terminal output target by default.

## Known Bootstrap Limitations

- `scripts/project-administration/configuration.ts` is kept **byte-identical** to the
  distributed `tools/worksmith/core/project-administration/configuration.ts` — its
  `applicationName` ("ArmBase Project Administration CLI"), work-item paths
  (`docs/work-items`, `docs/WORK_QUEUE.md`) and prefixes (`AB`/`AN`/`IM`) were
  deliberately **not** renamed for this project, because the copied regression test
  suite (`scripts/project-administration/tests/project-administration.test.ts`)
  asserts against those exact literal values. See `docs/project/DECISIONS.md`
  (DEC-001) for the full reasoning. `.worksmith.json`'s `project.name` already makes
  most interactive output (`queue`, `config`, `handoff`) show "Data- och
  analysportalen" instead — only the top-level `--help`/usage banner and a few
  internal error messages still say "ArmBase".
- `disposition-report` and `handoff`'s disposition reminder check the literal analysis
  prefix `"AN"` and the literal statuses `"in_progress"`/`"needs_review"` rather than
  reading them from configuration. This project keeps the `AN` prefix (as "Analysis")
  specifically so these two features keep working out of the box.
- Prefixes, statuses, transitions, metadata sentinels and standard work-item sections
  are configured directly in `scripts/project-administration/configuration.ts` (a
  TypeScript file), not via a separate JSON configuration file.
- The six top-level command scripts (`create-work-item.ts`, `transition-work-item.ts`,
  `complete-work-item.ts`, `validate-project-administration.ts`, `draft-compile.ts`,
  `allocate-work-item-id.ts`) are copied alongside `scripts/project-administration/`
  — they are not consolidated into one folder.
- `scripts/build-worksmith-kit.ts` — the tool the *kit's own origin repository* uses
  to regenerate `tools/worksmith/core/` and `MANIFEST.json` from its live source — is
  intentionally **not** part of the distributed kit and does not exist in this
  repository. One test in the copied regression suite
  ("worksmith kit core/ and MANIFEST.json match the live runtime source without
  drift") imports it and will fail here for that reason; this is expected in an
  adopting project and is not a defect in this installation. See
  `docs/project/PROJECT_STATUS.md`'s Active Risks section.
- `scripts/project.ts` — a legacy unified-CLI alias path referenced by one test
  ("unified allocator and compatibility alias produce equivalent output") also does
  not exist in the distributed kit (only `scripts/project-administration/cli.ts` is
  distributed as the unified entrypoint). This is the same category of issue as
  above: `npm run project:test` has exactly these **two** expected failures in a
  freshly adopted project, both caused by files that belong to the kit's own origin
  repository rather than to the distributed `tools/worksmith/core/`. All other 84
  tests pass.

## Future Capabilities

Multiple metadata-enabled active items, fully configuration-driven prefixes/statuses,
and standalone/npm packaging are not current capabilities. They require separate
approved design, implementation, migration and regression-test work.
