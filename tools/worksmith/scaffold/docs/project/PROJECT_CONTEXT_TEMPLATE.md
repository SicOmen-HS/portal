# Project Context Template

> **Non-authoritative template.** This file does not describe ArmBase. Copy it,
> replace every `{{PLACEHOLDER}}` and verify every claim against the target
> project's authoritative documents.

## When To Use

Use this optional file when new prompts or collaborators need a compact
orientation before following links to authoritative project documents. Keep it
short. It must point to governance, status, decisions and documentation routing
rather than duplicate their detailed content.

# {{PROJECT_NAME}} Project Context

Last reviewed: `{{YYYY-MM-DD}}`

## Purpose

{{TWO_OR_THREE_SENTENCE_PRODUCT_OR_PROJECT_SUMMARY}}

## Current State

- Phase: {{CURRENT_PHASE}}
- Primary objective: {{CURRENT_OBJECTIVE}}
- Current capabilities: {{SHORT_CAPABILITY_SUMMARY}}
- Current limitations: {{SHORT_LIMITATION_SUMMARY}}

Authoritative current state: [{{STATUS_DOCUMENT}}]({{STATUS_PATH}}).

## Durable Boundaries

- {{INVARIANT_OR_BOUNDARY_1}}
- {{INVARIANT_OR_BOUNDARY_2}}
- {{INVARIANT_OR_BOUNDARY_3}}

Do not copy long policy text here. Link each boundary to its owner when the
statement cannot remain safely summarized.

## Technical Orientation

| Area | Current choice | Detail owner |
| --- | --- | --- |
| Application | {{APPLICATION_STACK}} | {{ARCHITECTURE_PATH}} |
| Data | {{DATA_STACK}} | {{DATA_PATH}} |
| Delivery | {{DELIVERY_STACK}} | {{DELIVERY_PATH}} |

## Authority And Discovery

- Governance: [{{GOVERNANCE_DOCUMENT}}]({{GOVERNANCE_PATH}})
- Documentation index: [{{DOCUMENT_INDEX}}]({{DOCUMENT_INDEX_PATH}})
- Decisions: [{{DECISION_DOCUMENT}}]({{DECISION_PATH}})
- Operational workflow: [{{WORKFLOW_DOCUMENT}}]({{WORKFLOW_PATH}})
- Active work: {{ACTIVE_WORK_LOCATION_OR_COMMAND}}

Repository documents are authoritative. Supplied external copies are discovery
aids and may be stale.

## Prompt Routing

- For planning: read {{PLANNING_CONTEXT}}.
- For implementation: read the active work item and {{IMPLEMENTATION_CONTEXT}}.
- For architecture or dependencies: read {{DECISION_AND_ARCHITECTURE_CONTEXT}}.
- For delivery: read {{DELIVERY_CONTEXT}}.

Request missing authoritative context rather than guessing. Load only what the
current task needs.

## Maintenance

Update this orientation when its summary becomes materially false. Do not use it
as a second decision log, roadmap, status history or documentation index.
