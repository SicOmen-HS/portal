<!--
This file is the kit's own first-read instruction. It is not the adopting project's
governance document and never becomes one — it is discovery guidance for the install
step only.
-->

# Start Here (AI Agent Adoption Instructions)

You have been given the `tools/worksmith/` kit — one folder or zip. **Everything you
need is inside it. Do not search the source repository for missing files.**

Read `README.md` in this same folder next for the full explanation of `core/`,
`scaffold/` and `examples/`. This file gives you the exact steps.

## First Install

1. Copy `core/` verbatim into the new project's `scripts/` directory. It already
   mirrors the destination shape (`core/project-administration/` → `scripts/project-administration/`,
   `core/create-work-item.ts` → `scripts/create-work-item.ts`, and so on).
2. Copy `scaffold/` content into the new project as **active documentation** —
   every file listed below already exists inside `scaffold/`; there is no separate
   location to also check:
   - `scaffold/AGENTS_TEMPLATE.md` → the new project's root `AGENTS.md`.
   - `scaffold/docs/project/PROJECT_RULES_TEMPLATE.md` → `docs/project/PROJECT_RULES.md`.
   - `scaffold/docs/project/PROJECT_WORKFLOW_TEMPLATE.md` → `docs/project/PROJECT_WORKFLOW.md`.
   - `scaffold/docs/project/WORK_ITEM_SCHEMA_TEMPLATE.md` → `docs/project/WORK_ITEM_SCHEMA.md`.
   - `scaffold/docs/project/DOCUMENT_INDEX_TEMPLATE.md` → `docs/project/DOCUMENT_INDEX.md`.
   - `scaffold/docs/project/PROJECT_STATUS_TEMPLATE.md` → `docs/project/PROJECT_STATUS.md`.
   - `scaffold/docs/project/DECISIONS_TEMPLATE.md` → `docs/project/DECISIONS.md`.
   - `scaffold/docs/project/PROJECT_CONTEXT_TEMPLATE.md` → `docs/project/PROJECT_CONTEXT.md` (optional).
   - `scaffold/docs/development/PROJECT_ADMINISTRATION_TEMPLATE.md` → `docs/development/PROJECT_ADMINISTRATION.md`.
   - `scaffold/PACKAGE_SCRIPT_SNIPPET.md` → merge its script lines into the new
     project's own `package.json`.
3. **Active documentation belongs under the new project's own `docs/project/` and
   `docs/development/` — never permanently under `tools/worksmith/`.** This kit is a
   distribution area, not a documentation home.
4. Fill in every placeholder in the copied documents. Do not leave scaffold prose in
   an active copy.
5. Optionally copy `examples/topics.json.example` to `.worksmith/topics.json` and
   replace its placeholder ids with the new project's own vocabulary. This is
   project-owned configuration, not documentation.
6. **Once applied, `scaffold/` may be deleted or ignored.** Nothing in Worksmith reads
   it again; it is one-time installation material, not a reference you keep
   consulting.
7. Run:
   ```bash
   npm run project -- init --dry-run
   npm run project -- init
   npm run project -- validate
   ```

## Later Updates

When a newer version of this kit arrives:

1. Read `UPGRADE_NOTES.md` in the new kit for anything requiring manual migration.
2. Overwrite **only** the project's `scripts/project-administration/` and the six
   top-level command scripts with the new kit's `core/`.
3. **Never touch, ever:** `docs/project/PROJECT_RULES.md`, `PROJECT_WORKFLOW.md`,
   `WORK_ITEM_SCHEMA.md`, `DOCUMENT_INDEX.md`, `PROJECT_STATUS.md`, `DECISIONS.md`;
   `docs/development/PROJECT_ADMINISTRATION.md`; `.worksmith/topics.json`; the work
   queue; work items; or any other project-specific documentation. None of these live
   inside `tools/worksmith/`, and a core update never reaches into `docs/project/` or
   `docs/development/`.
4. Run `npm run project:test` and `npm run project -- validate` in the adopting
   project afterward.
5. If `UPGRADE_NOTES.md` flags a required manual step, perform it explicitly — never
   silently skip it.

## Missing Requested Context

If you need a document, file or piece of context that is not in this kit and not
already in the new project's repository, **stop and ask for it rather than guessing.**
Use this format:

```text
Required Before Manifest:
- <document or file path> — needed because <reason>.

I will not prepare the manifest until this is provided, or you explicitly approve
proceeding without it.
```

## Repository Is Source Of Truth

Once installed, the new project's own repository is authoritative. This kit is not
consulted again except when explicitly fetching a newer version for a future core
update.
