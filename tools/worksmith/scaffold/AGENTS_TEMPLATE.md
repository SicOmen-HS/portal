<!--
Non-authoritative template. Copy this file to your new project's repository root as
AGENTS.md, replace every <PLACEHOLDER>, and delete this comment block. This file is a
discovery entrypoint for AI assistants working in the repository — it is not a second
governance document and never overrides <PROJECT_NAME>'s own PROJECT_RULES.md.
-->

# <PROJECT_NAME> — Assistant First-Read Entrypoint

This file is a **discovery entrypoint**, not governance. If anything here conflicts
with `<GOVERNANCE_DOCUMENT_PATH>` (e.g. `docs/project/PROJECT_RULES.md`) or the
repository's current state, the repository wins. Update this file if it goes stale;
do not treat it as authoritative over the documents it points to.

## Read First

1. `<GOVERNANCE_DOCUMENT_PATH>` — durable governance, authority and policy.
2. The active work item, when one exists (ask if none is specified).

Do not preload the rest of the documentation tree. Use
`<DOCUMENT_INDEX_PATH>` (e.g. `docs/project/DOCUMENT_INDEX.md`) to find only the
additional document a specific task actually needs, then stop.

## Missing Requested Context Gate

If a planning assistant requested required documents, files or context before
preparing a work-item manifest, **it must not prepare the manifest until that context
is provided, or the project owner explicitly approves proceeding without it.**
Guessing the content of an unavailable document is not an acceptable substitute.

Use this exact format when context is missing:

```text
Required Before Manifest:
- <document or file path> — needed because <reason>.
- <document or file path> — needed because <reason>.

I will not prepare the manifest until these are provided, or you explicitly approve
proceeding without them.
```

## Bootstrapping The First Work Item

```bash
npm run project -- init --dry-run
npm run project -- init
npm run project -- validate
```

After `init`, follow `<WORKFLOW_DOCUMENT_PATH>` (e.g. `docs/project/PROJECT_WORKFLOW.md`)
to create the first work item.

## Repository Is Source Of Truth

Any copy of this project's documentation supplied to an external assistant context
(ChatGPT Projects, Claude Projects or similar) is a discovery aid and may be stale.
The repository's own files are always authoritative. When freshness matters, say which
repository version was used.
