# Documentation Index Template

> **Non-authoritative template.** This file does not describe ArmBase or any
> active project. Copy it into another project, replace every
> `{{PLACEHOLDER}}`, remove unused sections and verify every link.

## When To Use

Use this structure when a project needs one navigation catalog that tells people
and assistants which document owns each topic and when it should be read. Keep
policy in the owning documents; the index routes to policy but does not redefine
it.

# {{PROJECT_NAME}} Documentation Index

Last reviewed: `{{YYYY-MM-DD}}`

## Read First

Start with [{{GOVERNANCE_DOCUMENT}}]({{GOVERNANCE_PATH}}). Read the active work
record when one exists. Use this index to select only the additional documents
needed for the current task.

Repository documents are authoritative. External copies are discovery aids.

## Governance And Ownership

| Concern | Authoritative document | Notes |
| --- | --- | --- |
| Project governance | [{{GOVERNANCE_DOCUMENT}}]({{GOVERNANCE_PATH}}) | {{AUTHORITY_NOTE}} |
| Current project state | [{{STATUS_DOCUMENT}}]({{STATUS_PATH}}) | {{STATUS_NOTE}} |
| Decisions | [{{DECISION_DOCUMENT}}]({{DECISION_PATH}}) | {{DECISION_NOTE}} |
| Operational workflow | [{{WORKFLOW_DOCUMENT}}]({{WORKFLOW_PATH}}) | {{WORKFLOW_NOTE}} |

## Situation Guide

| Situation | Read | Related context |
| --- | --- | --- |
| {{SITUATION_1}} | [{{OWNER_1}}]({{OWNER_PATH_1}}) | {{RELATED_1}} |
| {{SITUATION_2}} | [{{OWNER_2}}]({{OWNER_PATH_2}}) | {{RELATED_2}} |
| {{SITUATION_3}} | [{{OWNER_3}}]({{OWNER_PATH_3}}) | {{RELATED_3}} |

Add a row only when it materially improves discovery. One topic should have one
clear owner; related documents must not silently compete with it.

## Folder Map

| Folder | Contents | Authority |
| --- | --- | --- |
| `{{FOLDER_1}}/` | {{CONTENTS_1}} | {{AUTHORITY_1}} |
| `{{FOLDER_2}}/` | {{CONTENTS_2}} | {{AUTHORITY_2}} |
| `{{FOLDER_3}}/` | {{CONTENTS_3}} | {{AUTHORITY_3}} |

## Permanent Documents

| Document | Purpose | Read when | Dependencies |
| --- | --- | --- | --- |
| [{{DOCUMENT_1}}]({{PATH_1}}) | {{PURPOSE_1}} | {{READ_TRIGGER_1}} | {{DEPENDENCIES_1}} |
| [{{DOCUMENT_2}}]({{PATH_2}}) | {{PURPOSE_2}} | {{READ_TRIGGER_2}} | {{DEPENDENCIES_2}} |

Group a larger catalog under topic headings such as Architecture, Development,
Deployment, Design or Operations.

## Templates And Examples

List reusable templates separately from active guidance. Mark each template or
example as non-authoritative and state when it should be copied rather than read
as project truth.

## Operational And Historical Records

Describe queues, work items, generated files, temporary records and archives
without promoting them to current policy. State which records are immutable and
when historical documents may be consulted.

## Maintenance Checklist

When a permanent document is created, changed, moved, renamed, removed or
superseded:

1. verify its authority and classification;
2. update its catalog entry and Situation Guide route;
3. verify links and dependencies;
4. remove or redirect obsolete competing guidance; and
5. report whether external project-context copies must be refreshed.

