# Data- och analysportalen Project Workflow

## Purpose And Authority

This document owns the operational checklist for planning, work-item administration,
execution, review and delivery. `docs/project/PROJECT_RULES.md` owns durable
governance. `docs/project/WORK_ITEM_SCHEMA.md` owns metadata and manifest contracts.
`docs/development/PROJECT_ADMINISTRATION.md` owns detailed CLI behavior.

## Roles

- **Project owner:** approves priorities, scope, completion, Git, deployment and
  external-context changes.
- **Planning assistant:** prepares scoped work, prompts and reviews; never invents an
  allocated identifier or claims unconfirmed approval.
- **Implementation agent:** performs only approved repository work, verifies it and
  reports evidence and documentation impact.
- **Reviewer:** compares the result with approved scope and checks verification,
  durable knowledge and delivery impact.
- **Automation/CLI:** applies deterministic allocation, metadata, queue, transition,
  validation and completion operations.

## 1. Route Analysis Before Creating Work

Use a planning or reasoning conversation first for a single supplied document, one
isolated idea, bounded reasoning or a solution discussion that does not require
repository evidence. Do not create a work item merely to formalize a small standalone
conversation.

Use a repository-capable implementation or coding agent for analysis when the answer
requires several documents, source code, repository structure, tooling, dependencies,
diffs, terminal commands or reproducible verification. A substantial cross-cutting
investigation may be a durable `AN` work item. Analysis produces findings and
recommendations only; later implementation uses a separately approved `AB` item when
required.

## Lightweight Task Policy

Data- och analysportalen is an early-stage mockup/prototype (see
`docs/project/PROJECT_STATUS.md`). To keep overhead proportionate to that stage:

- **No work item needed:** generated build output (`frontend/dist/`), typo fixes in
  prose that do not change meaning, and reformatting that changes no behavior.
- **Lightweight handling allowed:** small, low-risk mockdata additions that follow an
  existing pattern exactly (a new service/system/guide entry using an existing
  `urlKey` scheme), minor non-behavioral styling polish, and small documentation
  clarifications that do not change a governing principle. Traceability rule: use a
  scoped, descriptive commit message that names the change; do not invent a second,
  untracked tracking system.
- **Always requires a standard work item:** anything touching the information model
  (`docs/03_Informationsmodell.md`), the configuration model or `urlKey`/`systemUrls`
  mechanism (`docs/05_Konfiguration.md`, `docs/13_Utvecklarguide.md`), security
  posture, architecture (`docs/04_Systemarkitektur.md`), a new page or feature area,
  Worksmith tooling itself, or any change that would need an ADR.
- **Escalation rule:** if a lightweight change grows in scope, risk or durable impact
  while in progress, stop and create a normal work item before continuing.

Never invent a second, parallel, untracked task-tracking system as a shortcut around
this policy.

## Missing Requested Context Gate

If a planning assistant requested required documents, files or context before
preparing a work-item manifest, **it must not prepare the manifest until that context
is provided, or the project owner explicitly approves proceeding without it.**

## 2. Preflight New Work

Before preparing a creation manifest, the planning assistant:

1. reads the current queue (`npm run project -- queue`);
2. performs a focused search for duplicate, related, dependent or completed work
   (`docs/work-items/`, `docs/WORK_QUEUE.md`);
3. reads `docs/project/DOCUMENT_INDEX.md` and identifies the permanent topic owners;
4. requests any relevant document that is unavailable and could change scope,
   architecture, constraints or acceptance criteria (see the gate above);
5. stops rather than guessing when missing authoritative context is material;
6. agrees purpose, deliverables, verification and explicit out-of-scope limits with
   the project owner.

## 3. Prepare The Temporary Branch

Git operations are manual and project-owner controlled. Perform this routine only
when the owner has authorized the applicable operations. Before Worksmith makes its
first repository mutation, inspect the working tree and current branch. Do not switch
branches or update `main` while uncommitted work could be overwritten:

```powershell
git status --short --branch
git branch --show-current
```

When the working tree is clean, update local `main` without creating a merge commit.
Because Worksmith has not yet allocated an identifier, create a short-lived temporary
branch before creating or starting the work item:

```powershell
git switch main
git pull --ff-only origin main
git switch -c work/pending-short-description
```

## 4. Create And Start The Work Item When Required

On the temporary branch, repeat the queue and duplicate checks from Preflight New
Work. If no matching item exists and the approved work requires a standard work item,
prepare one strict manifest following `docs/project/WORK_ITEM_SCHEMA.md` with
`"id": "auto"`. The project owner approves the proposal; no assistant calculates,
reserves or hardcodes the identifier. Create the item and preview and apply its start
transition on the temporary branch:

```powershell
npm.cmd run project -- queue
npm.cmd run project -- create <manifest-path>
npm.cmd run project -- transition <ID> ready in_progress --dry-run
npm.cmd run project -- transition <ID> ready in_progress
```

## 5. Rename The Branch With The Allocated Identifier

Only one metadata-enabled item may be `in_progress`. Use the identifier returned by
Worksmith, then immediately rename the temporary branch so that the allocated
work-item identifier appears in its name:

```powershell
git branch -m docs/<work-item-id>-<short-description>
```

The temporary branch exists only to keep Worksmith's initial mutations off `main`;
do not retain it under its pending name. Continue implementation on the renamed work
branch. Local verification, Worksmith review/completion, commit, rebase, push, pull
request and cleanup follow in the later sections in that order.

## Task Prompt Contract

One complete task prompt is the project owner's normal interface to Codex, Claude
Code or another repository-capable agent. The owner should not normally need to write
a separate JSON manifest, allocate an identifier, edit the queue, create the branch
personally or assemble several instruction fragments. When explicitly authorized,
the agent handles those technical preparation steps within the same task.

Each prompt owns one stage and states: role and active work item; intended outcome and
approved repository scope; only the documents and paths required for the task;
explicit prohibitions and out-of-scope work; authority limits and required
verification; the expected handoff and any assigned lifecycle operation.

Return the finished task prompt as one complete, self-contained and easily copyable
block. Keep introductions and explanations outside it. Do not distribute instructions
belonging to the same delivery between comments or multiple blocks; include all
context an implementation agent needs in that single block.

A task prompt for Codex, Claude Code or another repository-capable implementation
agent must also require the agent, before implementation, to:

- inspect the Worksmith queue and existing work items for matching, related or
  dependent work;
- use a matching existing item and follow its scope and current status;
- create a new item through Worksmith only when no matching item exists and the
  Lightweight Task Policy requires a standard work item; changes classified as
  **No work item needed** or **Lightweight handling allowed** must not create one;
- let Worksmith allocate the identifier with `id: auto`, never invent, calculate or
  hardcode an identifier, and never edit `docs/WORK_QUEUE.md` or machine-managed
  metadata manually; and
- stop and report what the project owner must provide or do when required context,
  dependencies, permissions or approval are missing.

The prompt must preserve the project owner's approval authority and the constraint
that only one metadata-enabled item may be `in_progress`.

When creation is required, the strict manifest is temporary internal machine input
to `npm run project -- create`, generated within the task. It neither replaces the
task prompt nor becomes a separate user-facing delivery or permanent document.

## 6. Execute The Implementation

The implementation agent implements only approved scope, preserves unrelated
working-tree changes and avoids metadata and queue edits except assigned CLI
operations. Implement only the approved work-item scope on the renamed work branch.

## 7. Verify Locally, Move To Needs Review And Review

Run targeted checks during implementation and fix failures before review. When the
implementation is complete, run full relevant verification on the work branch. Every
repository change requires at least:

```powershell
npm.cmd run project -- validate
git diff --check
git status --short --branch
```

For frontend work, first read the current root and frontend `package.json`,
`docs/09_Teststrategi.md` and `docs/13_Utvecklarguide.md`; never guess script names.
The currently declared scripts support these root-based commands:

```powershell
npm.cmd --prefix frontend run build
npm.cmd --prefix frontend test -- --watch=false
```

Material UI changes also require visual review at roughly 375 px, 768 px and desktop
width. Report documented expected test failures separately and verify that no new
failures appeared. After successful local verification, move the item to review:

```powershell
npm.cmd run project -- transition <ID> in_progress needs_review --dry-run
npm.cmd run project -- transition <ID> in_progress needs_review
```

Return a concise handoff containing result and changed files; verification commands
and outcomes; deviations, risks and unresolved limitations; permanent documentation
impact (`updated`, `none` or `follow-up required`); current lifecycle state; and only
owner-controlled next actions. The handoff is one complete, self-contained and easily
copyable block and distinguishes completed agent actions, verified results, remaining
terminal work and remaining GitHub actions. For every manual step, include commands
in order, the URL routine, relevant button actions, expected results and stop
conditions. State whether commit, push, PR, review, merge and branch deletion are
complete or pending.

The Worksmith implementation review checks scope, changed files, verification and
permanent-document impact and returns `Approved` or `Changes Requested`. It decides
whether the work item may be completed and committed. Normal in-scope corrections
remain on the same item and branch. This is separate from the later pull-request
review, which reviews the pushed, rebased and integration-verified delivery before
merge to `main`.

## Topic Classification And Disposition

Adopt the topic/disposition convention using the registered vocabulary in
`.worksmith/topics.json` (see `npm run project -- topics`). In a work item's Markdown
body, use these plain-text labels (matched literally, not fuzzy):

```text
Primary topic: worksmith
Secondary topics: documentation
Disposition: accepted_now
Disposition note: Optional short clarification.
Follow-up: Optional comma-separated follow-up notes.
```

`Disposition` values are one of: `accepted_now`, `accepted_later`, `rejected`,
`parked`, `no_action`, `needs_more_analysis`. This convention is workflow-only and
forward-only: it documents classification going forward, it does not retroactively
reclassify older work items.

## 8. Complete The Approved Work Item

```bash
npm run project -- complete <id> --approved --dry-run
npm run project -- complete <id> --approved
```

Only after an `Approved` implementation review, preview and apply completion. The CLI
marks the item `done` but does not commit, push, open a PR, merge or deploy. When
permanent documentation changed, refresh Required Maintained Copies only after the
repository change is approved, following `PROJECT_RULES.md`.

## 9. Commit, Rebase, Verify, Push And Verify The Remote Branch

Commit and push require explicit project-owner authorization. Replace the `git add`
placeholder with the actually approved files. Avoid `git add .` when unrelated files
may exist. For frontend changes, run the declared build/test commands and applicable
visual review both before commit and after rebase. Use this complete sequence:

```powershell
git status --short --branch
git diff
git diff --check
npm.cmd run project -- validate
# For frontend scope:
npm.cmd --prefix frontend run build
npm.cmd --prefix frontend test -- --watch=false
git add <explicit-approved-paths>
git status --short
git commit -m "<work-item-id> <scoped commit message>"
git fetch origin
git rebase origin/main
npm.cmd run project -- validate
git diff --check origin/main...HEAD
git status --short --branch
# Repeat for frontend scope after rebase:
npm.cmd --prefix frontend run build
npm.cmd --prefix frontend test -- --watch=false
git push -u origin HEAD
```

Rebase only with the clean working tree produced by the scoped commit. Do not hide
unrelated work in an automatic stash. Do not push or propose a PR if post-rebase
verification fails.

Never push directly to `main` or use `git push --force`. After rebase,
`git push --force-with-lease` is allowed only on the contributor's own work branch,
with explicit owner approval and after confirming it cannot overwrite another
person's work.

A pull request cannot be created until the branch exists on `origin`. Verify it:

```powershell
$branch = (git branch --show-current).Trim()
$remoteHead = git ls-remote --heads origin "refs/heads/$branch"

if (-not $remoteHead) {
    throw "Arbetsbranchen finns inte på origin. Pusha branchen innan en pull request skapas."
}
```

When a handoff claims push succeeded and the next step depends on it, include this
remote check. It prevents GitHub's “There isn't anything to compare” state caused by
a missing compare branch.

## 10. Create And Review The Pull Request In GitHub

If GitHub CLI is unavailable, use the web interface; do not install it as part of an
ordinary documentation task. Derive the GitHub web URL from the configured HTTPS or
SSH origin without embedding credentials. After verifying the remote branch, open the
correct URL with an encoded branch name:

```powershell
$branch = (git branch --show-current).Trim()
$remoteHead = git ls-remote --heads origin "refs/heads/$branch"

if (-not $remoteHead) {
    throw "Arbetsbranchen finns inte på origin. Pusha branchen innan en pull request skapas."
}

$origin = (git remote get-url origin).Trim()

if ($origin -match '^https://github\.com/([^/]+)/([^/]+?)(?:\.git)?$') {
    $repositoryWebUrl = "https://github.com/$($Matches[1])/$($Matches[2])"
} elseif ($origin -match '^git@github\.com:([^/]+)/(.+?)(?:\.git)?$') {
    $repositoryWebUrl = "https://github.com/$($Matches[1])/$($Matches[2])"
} else {
    throw "Okänt origin-format: $origin"
}

$encodedBranch = [uri]::EscapeDataString($branch)
$prUrl = "$repositoryWebUrl/pull/new/$encodedBranch"
Start-Process $prUrl
```

On GitHub's new-pull-request page:

1. Confirm **base** is `main` and **compare** is the current work branch.
2. Confirm the expected commits and changed files are shown.
3. Enter a title beginning with the work-item identifier.
4. Describe goal and scope, changed files, verification commands/results, permanent
   documentation impact, known risks/limitations and current Worksmith status.
5. Review the diff, then click **Create pull request** (creates the PR; it does not
   merge it).
6. On the PR page, confirm the PR is **Open** and targets the correct branch pair.

The standard reviewer flow is:

1. Open the PR and select **Files changed**.
2. Review every changed file and confirm no unrelated changes are present.
3. Check **Checks** (or the equivalent status area) and confirm required checks pass.
4. Click **Review changes**.
5. Select **Approve** or **Request changes**, add a concise comment, then click
   **Submit review**.

If authors cannot approve their own PR, another authorized project member reviews it.
**Changes Requested** means correct, verify and push the same branch; do not create a
new work item or branch for normal in-scope review fixes.

## 11. Merge In GitHub

After required review and checks pass, an authorized owner or merger:

1. Opens **Conversation** and confirms required checks, reviews and conflict status.
2. Clicks **Merge pull request**, or opens its arrow menu if methods are offered.
3. Uses the repository's existing merge policy. If none is documented, do not invent
   one; request an explicit owner decision.
4. Clicks **Confirm merge** and waits until GitHub shows **Merged**.
5. Clicks **Delete branch** if offered and the remote branch is no longer needed.

**Create pull request** only creates a PR. Green checks mean checks passed; **Ready to
merge** means GitHub believes merging is possible; a deployment does not mean merged.
Only **Merge pull request** followed by **Confirm merge** performs the merge. **Delete
branch** removes the remote branch, not the local one. GitHub labels may vary slightly;
follow the action described here, not only its current label.

## 12. Synchronize And Clean Up After Merge

After GitHub confirms the approved merge, run this owner-controlled routine with the
actual merged branch name. Verify merged content in `origin/main` by relevant files,
work-item state or functionality—not by requiring the original commit hash, because
squash or rebase merge may replace it:

```powershell
$branch = "<merged-work-branch>"

git fetch origin --prune
git switch main
git pull --ff-only origin main
npm.cmd run project -- validate
git status --short --branch

if (git branch --list $branch) {
    git branch -d $branch
}

$remoteBranch = git ls-remote --heads origin "refs/heads/$branch"

if ($remoteBranch) {
    git push origin --delete $branch
} else {
    Write-Host "Fjärrbranchen är redan borttagen."
}

git fetch origin --prune
git status --short --branch
git branch --show-current
```

Use `git branch -d` normally; do not propose `git branch -D` by default. If safe
deletion refuses, investigate why before forcing removal. The expected end state is a
clean, current local `main`, merged content present in `origin/main`, and the
short-lived branch removed locally and remotely.

## Definition Of Delivered

Work is fully delivered when approved scope and verification are complete, review and
owner approval are recorded, lifecycle state is synchronized, and applicable Git,
deployment, production verification and external-context handoff have been performed
or explicitly reported as pending.
