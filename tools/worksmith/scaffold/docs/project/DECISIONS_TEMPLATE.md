# Decision Log Template

> **Non-authoritative template.** This file contains no ArmBase decisions.
> Replace every `{{PLACEHOLDER}}` when adopting it. A copied decision becomes
> authoritative only through that project's approval process.

## When To Use

Use a decision log for durable product, architecture, security, data, dependency
or operating choices that future work must discover without reading historical
work items. Keep implementation evidence in its work record and link it here
when it supports the decision.

# {{PROJECT_NAME}} Decisions

## Decision Statuses

- `proposed`: under consideration and not approved.
- `approved`: current direction.
- `superseded`: replaced by another identified decision.
- `rejected`: considered and explicitly not selected.

Adapt these statuses deliberately and use them consistently.

## {{DECISION_ID}} - {{DECISION_TITLE}}

- **Status:** `{{STATUS}}`
- **Date:** `{{YYYY-MM-DD}}`
- **Owner:** {{DECISION_OWNER}}
- **Supersedes:** {{DECISION_ID_OR_NONE}}
- **Superseded by:** {{DECISION_ID_OR_NONE}}

### Context

{{PROBLEM, CONSTRAINTS AND WHY A DURABLE DECISION IS NEEDED}}

### Decision

{{THE APPROVED OR PROPOSED DIRECTION IN PRECISE TERMS}}

State what is the default, what is explicitly not approved and which future
change requires a new decision.

### Consequences

- Positive: {{POSITIVE_CONSEQUENCE}}
- Trade-off: {{TRADE_OFF}}
- Required follow-up: {{FOLLOW_UP_OR_NONE}}

### Alternatives Considered

| Alternative | Outcome | Reason |
| --- | --- | --- |
| {{ALTERNATIVE_1}} | {{REJECTED_OR_DEFERRED}} | {{REASON_1}} |
| {{ALTERNATIVE_2}} | {{REJECTED_OR_DEFERRED}} | {{REASON_2}} |

### Related Evidence

- {{LINK_TO_ANALYSIS, WORK_ITEM, ARCHITECTURE DOCUMENT OR SOURCE}}

---

Copy the complete decision section for each new decision. Never edit a
superseded decision to make it appear that the later direction was always in
effect; update status and cross-links instead.

