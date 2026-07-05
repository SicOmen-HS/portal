import { readFile } from "node:fs/promises";
import { WORK_ITEMS_DIRECTORY, isWorkItemIdentifier } from "./identifiers";
import { splitMarkdownSections, parseBulletList, parseParagraphs } from "./markdown-sections";
import {
  hasTopicConventionData,
  isKnownDispositionStatus,
  parseTopicConvention,
  type ParsedTopicConvention
} from "./topic-convention";
import { buildTopicConventionDiagnostics } from "./topic-discovery";
import { loadTopicTaxonomy, TopicTaxonomyError } from "./topic-taxonomy";
import { WorkItemMetadataError, parseWorkItemMetadata } from "./work-item-metadata";
import {
  createWorksmithError,
  createWorksmithSuccess,
  type WorksmithDiagnostic,
  type WorksmithResult
} from "./worksmith-result";
import { renderWorksmithJsonResult } from "./worksmith-output";

/**
 * Read-only exact-ID work-item show/fetch. Reads and displays a compact
 * summary of one existing work item. Never writes, never touches the queue,
 * never mutates or retrofits legacy work items, and does not acquire the
 * repository mutation lock.
 */

export interface WorkItemShowPayload extends ParsedTopicConvention {
  id: string;
  file: string;
  legacy: boolean;
  title: string;
  status: string | null;
  created_on: string | null;
  completed_on: string | null;
  goal: string | null;
  scope: string[];
  out_of_scope: string[];
}

export class WorkItemShowError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "WorkItemShowError";
  }
}

function extractLegacyTitle(content: string): string {
  const firstLine = content.split(/\r?\n/, 1)[0] ?? "";
  const match = firstLine.match(/^#\s+\S+\s*-\s*(.+)$/);
  return match?.[1].trim() ?? "";
}

function extractCompactSectionText(content: string, heading: string): string | null {
  const lines = content.split(/\r?\n/);
  const section = splitMarkdownSections(lines).find((candidate) => candidate.heading === heading);
  if (section === undefined) {
    return null;
  }
  const paragraphs = parseParagraphs(section.content);
  return paragraphs.length === 0 ? null : paragraphs.join(" ");
}

function extractCompactSectionList(content: string, heading: string): string[] {
  const lines = content.split(/\r?\n/);
  const section = splitMarkdownSections(lines).find((candidate) => candidate.heading === heading);
  if (section === undefined) {
    return [];
  }
  return parseBulletList(section.content) ?? [];
}

export async function fetchWorkItemSummary(identifier: string): Promise<WorkItemShowPayload> {
  if (!isWorkItemIdentifier(identifier)) {
    throw new WorkItemShowError(
      "INVALID_IDENTIFIER",
      `'${identifier}' is not a recognized work-item identifier (expected AB/AN/IM plus 3-5 digits).`
    );
  }

  const filePath = `${WORK_ITEMS_DIRECTORY}/${identifier}.md`;
  let content: string;
  try {
    content = await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new WorkItemShowError("WORK_ITEM_NOT_FOUND", `No work item found at '${filePath}'.`);
    }
    throw error;
  }

  const convention = parseTopicConvention(content);

  let metadata;
  try {
    ({ metadata } = parseWorkItemMetadata(content, identifier));
  } catch (error) {
    if (error instanceof WorkItemMetadataError && error.code === "LEGACY_WORK_ITEM") {
      return {
        id: identifier,
        file: filePath,
        legacy: true,
        title: extractLegacyTitle(content),
        status: null,
        created_on: null,
        completed_on: null,
        goal: null,
        scope: [],
        out_of_scope: [],
        ...convention
      };
    }
    if (error instanceof WorkItemMetadataError) {
      throw new WorkItemShowError(
        error.code,
        `'${identifier}' has an invalid metadata block: ${error.message}`
      );
    }
    throw error;
  }

  return {
    id: identifier,
    file: filePath,
    legacy: false,
    title: metadata.title,
    status: metadata.status,
    created_on: metadata.created_on,
    completed_on: metadata.completed_on,
    goal: extractCompactSectionText(content, "Goal"),
    scope: extractCompactSectionList(content, "Scope"),
    out_of_scope: extractCompactSectionList(content, "Out of Scope"),
    ...convention
  };
}

export async function loadKnownTopicIds(): Promise<{
  knownTopicIds: ReadonlySet<string>;
  diagnostics: WorksmithDiagnostic[];
}> {
  try {
    const effective = await loadTopicTaxonomy();
    return {
      knownTopicIds: new Set(effective.taxonomy.topics.map((topic) => topic.id)),
      diagnostics: []
    };
  } catch (error) {
    const message = error instanceof TopicTaxonomyError ? error.message : String(error);
    return {
      knownTopicIds: new Set(),
      diagnostics: [
        {
          code: "TOPIC_TAXONOMY_INVALID",
          severity: "warning",
          message: `Topic classification could not be checked against the registered taxonomy: ${message}`
        }
      ]
    };
  }
}

type ShowOutputTarget = "terminal" | "json";

function parseShowArguments(arguments_: string[]): { identifier?: string; output: ShowOutputTarget } {
  let identifier: string | undefined;
  let output: ShowOutputTarget = "terminal";
  let outputSeen = false;

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--output") {
      if (outputSeen) {
        throw new WorkItemShowError("INVALID_ARGUMENTS", "--output may be specified only once.");
      }
      const value = arguments_[index + 1];
      if (value !== "terminal" && value !== "json") {
        throw new WorkItemShowError(
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
      throw new WorkItemShowError("INVALID_ARGUMENTS", `show does not accept option '${argument}'.`);
    }
    if (identifier !== undefined) {
      throw new WorkItemShowError("INVALID_ARGUMENTS", "show accepts exactly one work-item identifier.");
    }
    identifier = argument;
  }

  return { identifier, output };
}

function topicConventionLines(payload: WorkItemShowPayload): string[] {
  if (!hasTopicConventionData(payload)) {
    return [];
  }

  const lines = ["", "Topics:"];
  if (payload.primary_topic !== null) {
    lines.push(`  Primary topic: ${payload.primary_topic}`);
  }
  if (payload.secondary_topics.length > 0) {
    lines.push(`  Secondary topics: ${payload.secondary_topics.join(", ")}`);
  }
  if (payload.disposition !== null) {
    lines.push(`  Disposition: ${payload.disposition}`);
  }
  if (payload.disposition_note !== null) {
    lines.push(`  Disposition note: ${payload.disposition_note}`);
  }
  if (payload.follow_up.length > 0) {
    lines.push(`  Follow-up: ${payload.follow_up.join(", ")}`);
  }
  return lines;
}

function diagnosticLines(diagnostics: readonly WorksmithDiagnostic[]): string[] {
  if (diagnostics.length === 0) {
    return [];
  }
  return [
    "",
    "Warnings:",
    ...diagnostics.map((diagnostic) => `  - ${diagnostic.message}`)
  ];
}

function renderShowTerminal(
  payload: WorkItemShowPayload,
  diagnostics: readonly WorksmithDiagnostic[]
): void {
  const lines = [`${payload.id} - ${payload.title || "(untitled)"}`];

  if (payload.legacy) {
    lines.push(
      "Legacy work item: no metadata block present; status and sections are not available.",
      `File: ${payload.file}`,
      ...topicConventionLines(payload),
      ...diagnosticLines(diagnostics)
    );
    console.log(lines.join("\n"));
    return;
  }

  lines.push(
    `Status: ${payload.status}`,
    `Created: ${payload.created_on}`,
    `Completed: ${payload.completed_on ?? "-"}`,
    `File: ${payload.file}`,
    "",
    "Goal:",
    `  ${payload.goal ?? "(none)"}`,
    "",
    "Scope:",
    ...(payload.scope.length === 0 ? ["  (none)"] : payload.scope.map((item) => `  - ${item}`)),
    "",
    "Out of Scope:",
    ...(payload.out_of_scope.length === 0
      ? ["  (none)"]
      : payload.out_of_scope.map((item) => `  - ${item}`)),
    ...topicConventionLines(payload),
    ...diagnosticLines(diagnostics)
  );
  console.log(lines.join("\n"));
}

function printShowError(code: string, message: string): void {
  console.error(JSON.stringify({ error: { code, message } }, null, 2));
}

export async function runWorkItemShowCommand(arguments_: string[]): Promise<number> {
  let options: { identifier?: string; output: ShowOutputTarget };
  try {
    options = parseShowArguments(arguments_);
  } catch (error) {
    printShowError(
      error instanceof WorkItemShowError ? error.code : "INVALID_ARGUMENTS",
      error instanceof Error ? error.message : String(error)
    );
    return 1;
  }

  if (options.identifier === undefined) {
    printShowError("MISSING_IDENTIFIER", "show requires exactly one work-item identifier.");
    return 1;
  }

  let result: WorksmithResult<WorkItemShowPayload | Record<string, never>>;
  try {
    const payload = await fetchWorkItemSummary(options.identifier);
    const { knownTopicIds, diagnostics: taxonomyDiagnostics } = await loadKnownTopicIds();
    const conventionDiagnostics = buildTopicConventionDiagnostics(
      payload,
      knownTopicIds,
      isKnownDispositionStatus
    );
    result = createWorksmithSuccess("work_item_show", payload, {
      diagnostics: [...taxonomyDiagnostics, ...conventionDiagnostics]
    });
  } catch (error) {
    const code = error instanceof WorkItemShowError ? error.code : "WORK_ITEM_SHOW_FAILED";
    const message = error instanceof Error ? error.message : String(error);
    result = createWorksmithError("work_item_show", code, message);
  }

  if (options.output === "json") {
    return renderWorksmithJsonResult(result);
  }

  if (result.status === "error") {
    printShowError(result.diagnostics[0].code, result.diagnostics[0].message);
    return result.exit_code;
  }

  renderShowTerminal(result.payload as WorkItemShowPayload, result.diagnostics);
  return result.exit_code;
}
