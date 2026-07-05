import { readFile } from "node:fs/promises";
import { parseBulletList, splitMarkdownSections } from "./markdown-sections";
import {
  hasTopicConventionData,
  isKnownDispositionStatus,
  type ParsedTopicConvention
} from "./topic-convention";
import { buildTopicConventionDiagnostics } from "./topic-discovery";
import { VALID_TRANSITIONS, type WorkItemStatus } from "./work-item-metadata";
import { fetchWorkItemSummary, loadKnownTopicIds, WorkItemShowError } from "./work-item-show";
import {
  createWorksmithError,
  createWorksmithSuccess,
  type WorksmithDiagnostic,
  type WorksmithResult
} from "./worksmith-result";
import { renderWorksmithJsonResult } from "./worksmith-output";

/**
 * Read-only assistant handoff renderer for one existing work item. Reuses
 * `show`'s exact-ID fetch, legacy-safety and topic/disposition convention
 * parsing rather than re-implementing them. Every rendered field is
 * deterministically derived from the work item itself or from fixed policy
 * text (AN-020) — never inferred, never guessed, never written back.
 */

const REQUIRED_READ_FIRST = "docs/project/PROJECT_RULES.md" as const;

const EXPECTED_FINAL_HANDOFF = [
  "result and changed files",
  "verification commands and outcomes",
  "deviations, risks and unresolved limitations",
  "permanent documentation impact: updated, none or follow-up required",
  "current lifecycle state",
  "only the owner-controlled next actions that remain applicable"
] as const;

const REMINDERS = [
  "Permanent documentation and current repository state outrank older work-item prose.",
  "Any referenced prior work item is historical context, not current authority."
] as const;

export interface WorkItemHandoffLifecycleOption {
  to: string;
  dry_run_command: string;
  apply_command: string;
}

export interface WorkItemHandoffPayload extends ParsedTopicConvention {
  id: string;
  file: string;
  legacy: boolean;
  title: string;
  status: string | null;
  goal: string | null;
  scope: string[];
  out_of_scope: string[];
  verification: string[];
  next_lifecycle_options: WorkItemHandoffLifecycleOption[];
  disposition_reminder: boolean;
  read_first: string[];
  expected_final_handoff: string[];
  reminders: string[];
}

export class WorkItemHandoffError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "WorkItemHandoffError";
  }
}

function extractVerificationList(content: string): string[] {
  const lines = content.split(/\r?\n/);
  const section = splitMarkdownSections(lines).find((candidate) => candidate.heading === "Verification");
  if (section === undefined) {
    return [];
  }
  return parseBulletList(section.content) ?? [];
}

function buildLifecycleOptions(id: string, status: string | null): WorkItemHandoffLifecycleOption[] {
  if (status === null) {
    return [];
  }
  const destinations = VALID_TRANSITIONS[status as WorkItemStatus] ?? [];
  return destinations.map((to) => ({
    to,
    dry_run_command: `npm run project -- transition ${id} ${status} ${to} --dry-run`,
    apply_command: `npm run project -- transition ${id} ${status} ${to}`
  }));
}

function isDispositionReminderRelevant(id: string, status: string | null, disposition: string | null): boolean {
  return (
    status !== null &&
    id.startsWith("AN-") &&
    (status === "in_progress" || status === "needs_review") &&
    disposition === null
  );
}

export async function buildWorkItemHandoff(
  identifier: string
): Promise<{ payload: WorkItemHandoffPayload; diagnostics: WorksmithDiagnostic[] }> {
  const summary = await fetchWorkItemSummary(identifier);
  const content = await readFile(summary.file, "utf8");
  const verification = extractVerificationList(content);

  const { knownTopicIds, diagnostics: taxonomyDiagnostics } = await loadKnownTopicIds();
  const conventionDiagnostics = buildTopicConventionDiagnostics(summary, knownTopicIds, isKnownDispositionStatus);

  const payload: WorkItemHandoffPayload = {
    id: summary.id,
    file: summary.file,
    legacy: summary.legacy,
    title: summary.title,
    status: summary.status,
    goal: summary.goal,
    scope: summary.scope,
    out_of_scope: summary.out_of_scope,
    verification,
    next_lifecycle_options: buildLifecycleOptions(summary.id, summary.status),
    disposition_reminder: isDispositionReminderRelevant(summary.id, summary.status, summary.disposition),
    read_first: [REQUIRED_READ_FIRST, summary.file],
    expected_final_handoff: [...EXPECTED_FINAL_HANDOFF],
    reminders: [...REMINDERS],
    primary_topic: summary.primary_topic,
    secondary_topics: summary.secondary_topics,
    disposition: summary.disposition,
    disposition_note: summary.disposition_note,
    follow_up: summary.follow_up
  };

  return { payload, diagnostics: [...taxonomyDiagnostics, ...conventionDiagnostics] };
}

function renderTopicSection(payload: WorkItemHandoffPayload, diagnostics: readonly WorksmithDiagnostic[]): string[] {
  const lines = ["## Topic And Disposition Context", ""];

  if (!hasTopicConventionData(payload)) {
    lines.push("Topic classification: not yet recorded — see .worksmith/topics.json for the registered vocabulary.");
  } else {
    if (payload.primary_topic !== null) {
      lines.push(`- Primary topic: ${payload.primary_topic}`);
    }
    if (payload.secondary_topics.length > 0) {
      lines.push(`- Secondary topics: ${payload.secondary_topics.join(", ")}`);
    }
    if (payload.disposition !== null) {
      lines.push(`- Disposition: ${payload.disposition}`);
    }
    if (payload.disposition_note !== null) {
      lines.push(`- Disposition note: ${payload.disposition_note}`);
    }
    if (payload.follow_up.length > 0) {
      lines.push(`- Follow-up: ${payload.follow_up.join(", ")}`);
    }
  }

  if (payload.disposition_reminder) {
    lines.push(
      "",
      "Reminder: record AN disposition (see PROJECT_WORKFLOW.md) before requesting needs_review."
    );
  }

  if (diagnostics.length > 0) {
    lines.push("", "Warnings:", ...diagnostics.map((diagnostic) => `- ${diagnostic.message}`));
  }

  return lines;
}

function renderBulletSection(heading: string, items: readonly string[]): string[] {
  return [`## ${heading}`, "", ...(items.length === 0 ? ["(none)"] : items.map((item) => `- ${item}`))];
}

function renderHandoffMarkdown(payload: WorkItemHandoffPayload, diagnostics: readonly WorksmithDiagnostic[]): string {
  const lines = [`# Handoff: ${payload.id} - ${payload.title || "(untitled)"}`, ""];

  lines.push("## Read First", "", ...payload.read_first.map((item) => `- ${item}`), "");

  if (payload.legacy) {
    lines.push(
      "## Active Work Item",
      "",
      `- ID: ${payload.id}`,
      `- File: ${payload.file}`,
      "- Legacy work item: no metadata block present; status, goal, scope and lifecycle commands are not available.",
      "",
      ...renderTopicSection(payload, diagnostics),
      "",
      "## Reminders",
      "",
      ...payload.reminders.map((reminder) => `- ${reminder}`)
    );
    return lines.join("\n");
  }

  lines.push(
    "## Active Work Item",
    "",
    `- ID: ${payload.id}`,
    `- Title: ${payload.title}`,
    `- Status: ${payload.status}`,
    `- File: ${payload.file}`,
    "",
    "## Goal",
    "",
    payload.goal ?? "(none)",
    "",
    ...renderBulletSection("Scope", payload.scope),
    "",
    ...renderBulletSection("Out Of Scope / Prohibitions", payload.out_of_scope),
    "",
    ...renderBulletSection("Suggested Verification", payload.verification),
    "",
    ...renderTopicSection(payload, diagnostics),
    "",
    "## Lifecycle Commands",
    "",
    ...(payload.next_lifecycle_options.length === 0
      ? ["No further lifecycle transitions available (terminal state)."]
      : payload.next_lifecycle_options.flatMap((option) => [option.dry_run_command, option.apply_command])),
    "",
    "## Expected Final Handoff",
    "",
    ...payload.expected_final_handoff.map((item) => `- ${item}`),
    "",
    "## Reminders",
    "",
    ...payload.reminders.map((reminder) => `- ${reminder}`)
  );

  return lines.join("\n");
}

type HandoffOutputTarget = "terminal" | "json";

function parseHandoffArguments(arguments_: string[]): { identifier?: string; output: HandoffOutputTarget } {
  let identifier: string | undefined;
  let output: HandoffOutputTarget = "terminal";
  let outputSeen = false;

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--output") {
      if (outputSeen) {
        throw new WorkItemHandoffError("INVALID_ARGUMENTS", "--output may be specified only once.");
      }
      const value = arguments_[index + 1];
      if (value !== "terminal" && value !== "json") {
        throw new WorkItemHandoffError(
          "INVALID_ARGUMENTS",
          `Unsupported output '${value ?? ""}'. Expected terminal or json.`
        );
      }
      output = value;
      outputSeen = true;
      index += 1;
      continue;
    }
    if (argument.startsWith("--")) {
      throw new WorkItemHandoffError("INVALID_ARGUMENTS", `handoff does not accept option '${argument}'.`);
    }
    if (identifier !== undefined) {
      throw new WorkItemHandoffError("INVALID_ARGUMENTS", "handoff accepts exactly one work-item identifier.");
    }
    identifier = argument;
  }

  return { identifier, output };
}

function printHandoffError(code: string, message: string): void {
  console.error(JSON.stringify({ error: { code, message } }, null, 2));
}

export async function runWorkItemHandoffCommand(arguments_: string[]): Promise<number> {
  let options: { identifier?: string; output: HandoffOutputTarget };
  try {
    options = parseHandoffArguments(arguments_);
  } catch (error) {
    printHandoffError(
      error instanceof WorkItemHandoffError ? error.code : "INVALID_ARGUMENTS",
      error instanceof Error ? error.message : String(error)
    );
    return 1;
  }

  if (options.identifier === undefined) {
    printHandoffError("MISSING_IDENTIFIER", "handoff requires exactly one work-item identifier.");
    return 1;
  }

  let result: WorksmithResult<WorkItemHandoffPayload | Record<string, never>>;
  try {
    const { payload, diagnostics } = await buildWorkItemHandoff(options.identifier);
    result = createWorksmithSuccess("work_item_handoff", payload, { diagnostics });
  } catch (error) {
    const code = error instanceof WorkItemShowError || error instanceof WorkItemHandoffError
      ? error.code
      : "WORK_ITEM_HANDOFF_FAILED";
    const message = error instanceof Error ? error.message : String(error);
    result = createWorksmithError("work_item_handoff", code, message);
  }

  if (options.output === "json") {
    return renderWorksmithJsonResult(result);
  }

  if (result.status === "error") {
    printHandoffError(result.diagnostics[0].code, result.diagnostics[0].message);
    return result.exit_code;
  }

  console.log(renderHandoffMarkdown(result.payload as WorkItemHandoffPayload, result.diagnostics));
  return result.exit_code;
}
