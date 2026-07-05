import { readFile, readdir } from "node:fs/promises";
import { WORK_ITEMS_DIRECTORY, isWorkItemIdentifier } from "./identifiers";
import { parseTopicConvention, type ParsedTopicConvention } from "./topic-convention";
import { WorkItemMetadataError, parseWorkItemMetadata, type WorkItemMetadata } from "./work-item-metadata";
import type { WorksmithDiagnostic } from "./worksmith-result";

/**
 * Shared read-only repository scan reused by the topic catalog and the AN
 * disposition-gap report. It is a best-effort discovery scan, not a
 * validator: a work item with malformed metadata is reported as legacy here
 * rather than rejected, exactly as `show` already treats legacy items. Use
 * `validate` for structural correctness.
 */

export interface ScannedWorkItem {
  id: string;
  file: string;
  content: string;
  legacy: boolean;
  metadata: WorkItemMetadata | null;
  convention: ParsedTopicConvention;
}

export async function scanWorkItems(): Promise<ScannedWorkItem[]> {
  const entries = await readdir(WORK_ITEMS_DIRECTORY, { withFileTypes: true });
  const fileNames = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  const results: ScannedWorkItem[] = [];
  for (const fileName of fileNames) {
    const id = fileName.slice(0, -3);
    if (!isWorkItemIdentifier(id)) {
      continue;
    }
    const file = `${WORK_ITEMS_DIRECTORY}/${fileName}`;
    const content = await readFile(file, "utf8");
    const convention = parseTopicConvention(content);

    try {
      const { metadata } = parseWorkItemMetadata(content, id);
      results.push({ id, file, content, legacy: false, metadata, convention });
    } catch (error) {
      if (error instanceof WorkItemMetadataError) {
        results.push({ id, file, content, legacy: true, metadata: null, convention });
        continue;
      }
      throw error;
    }
  }

  return results;
}

/**
 * Non-mutating diagnostics for one item's parsed topic/disposition data:
 * an unregistered topic reference or a disposition value outside the known
 * enum. These are always warnings, never validation-policy failures.
 */
export function buildTopicConventionDiagnostics(
  convention: ParsedTopicConvention,
  knownTopicIds: ReadonlySet<string>,
  isKnownDisposition: (value: string) => boolean
): WorksmithDiagnostic[] {
  const diagnostics: WorksmithDiagnostic[] = [];
  const referencedTopics = [
    ...(convention.primary_topic === null ? [] : [convention.primary_topic]),
    ...convention.secondary_topics
  ];
  const unregistered = [...new Set(referencedTopics)].filter((topicId) => !knownTopicIds.has(topicId));

  for (const topicId of unregistered) {
    diagnostics.push({
      code: "UNREGISTERED_TOPIC",
      severity: "warning",
      message: `Topic '${topicId}' is not registered in .worksmith/topics.json.`
    });
  }

  if (convention.disposition !== null && !isKnownDisposition(convention.disposition)) {
    diagnostics.push({
      code: "MALFORMED_DISPOSITION",
      severity: "warning",
      message: `Disposition '${convention.disposition}' is not one of the known disposition statuses.`
    });
  }

  return diagnostics;
}
