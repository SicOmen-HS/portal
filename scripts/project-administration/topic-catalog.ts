import { scanWorkItems } from "./topic-discovery";
import { loadTopicTaxonomy, TopicTaxonomyError } from "./topic-taxonomy";
import {
  createWorksmithError,
  createWorksmithSuccess,
  type WorksmithResult
} from "./worksmith-result";
import { renderWorksmithJsonResult } from "./worksmith-output";

/**
 * Read-only topic catalog: lists the project-owned topics registered in
 * `.worksmith/topics.json`, how many work items reference each one, and any
 * topic references found in work items that are not registered. It never
 * writes to the taxonomy file or to any work item.
 */

export interface TopicCatalogEntry {
  id: string;
  label: string;
  item_count: number;
  items: string[];
}

export interface UnregisteredTopicReference {
  topic_id: string;
  items: string[];
}

export interface TopicCatalogPayload {
  path: string;
  present: boolean;
  topics: TopicCatalogEntry[];
  unregistered_topic_references: UnregisteredTopicReference[];
}

export class TopicCatalogError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "TopicCatalogError";
  }
}

export async function buildTopicCatalog(): Promise<TopicCatalogPayload> {
  let effective;
  try {
    effective = await loadTopicTaxonomy();
  } catch (error) {
    if (error instanceof TopicTaxonomyError) {
      throw new TopicCatalogError(error.code, error.message);
    }
    throw error;
  }

  const items = await scanWorkItems();
  const itemsByTopic = new Map<string, string[]>();
  const registeredIds = new Set(effective.taxonomy.topics.map((topic) => topic.id));

  for (const item of items) {
    const referenced = [
      ...(item.convention.primary_topic === null ? [] : [item.convention.primary_topic]),
      ...item.convention.secondary_topics
    ];
    for (const topicId of new Set(referenced)) {
      const existing = itemsByTopic.get(topicId) ?? [];
      existing.push(item.id);
      itemsByTopic.set(topicId, existing);
    }
  }

  const topics: TopicCatalogEntry[] = effective.taxonomy.topics.map((topic) => {
    const referencingItems = (itemsByTopic.get(topic.id) ?? []).sort((left, right) =>
      left.localeCompare(right)
    );
    return {
      id: topic.id,
      label: topic.label,
      item_count: referencingItems.length,
      items: referencingItems
    };
  });

  const unregisteredTopicReferences: UnregisteredTopicReference[] = [...itemsByTopic.entries()]
    .filter(([topicId]) => !registeredIds.has(topicId))
    .map(([topicId, referencingItems]) => ({
      topic_id: topicId,
      items: [...referencingItems].sort((left, right) => left.localeCompare(right))
    }))
    .sort((left, right) => left.topic_id.localeCompare(right.topic_id));

  return {
    path: effective.path,
    present: effective.present,
    topics,
    unregistered_topic_references: unregisteredTopicReferences
  };
}

type CatalogOutputTarget = "terminal" | "json";

function parseTopicsArguments(arguments_: string[]): { output: CatalogOutputTarget } {
  let output: CatalogOutputTarget = "terminal";
  let outputSeen = false;

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--output") {
      if (outputSeen) {
        throw new TopicCatalogError("INVALID_ARGUMENTS", "--output may be specified only once.");
      }
      const value = arguments_[index + 1];
      if (value !== "terminal" && value !== "json") {
        throw new TopicCatalogError(
          "INVALID_ARGUMENTS",
          `Unsupported output '${value ?? ""}'. Expected terminal or json.`
        );
      }
      output = value;
      outputSeen = true;
      index += 1;
      continue;
    }
    throw new TopicCatalogError("INVALID_ARGUMENTS", `topics does not accept argument '${argument}'.`);
  }

  return { output };
}

function renderTopicCatalogTerminal(payload: TopicCatalogPayload): void {
  const lines = [`Topic catalog (${payload.path}${payload.present ? "" : " - not present"})`];

  if (payload.topics.length === 0) {
    lines.push("", "No topics are registered.");
  } else {
    lines.push("");
    for (const topic of payload.topics) {
      lines.push(`- ${topic.id} (${topic.label}): ${topic.item_count} item(s)`);
    }
  }

  if (payload.unregistered_topic_references.length > 0) {
    lines.push("", "Unregistered topic references:");
    for (const reference of payload.unregistered_topic_references) {
      lines.push(`  - '${reference.topic_id}' referenced by: ${reference.items.join(", ")}`);
    }
  }

  console.log(lines.join("\n"));
}

function printTopicsError(code: string, message: string): void {
  console.error(JSON.stringify({ error: { code, message } }, null, 2));
}

export async function runTopicCatalogCommand(arguments_: string[]): Promise<number> {
  let options: { output: CatalogOutputTarget };
  try {
    options = parseTopicsArguments(arguments_);
  } catch (error) {
    printTopicsError(
      error instanceof TopicCatalogError ? error.code : "INVALID_ARGUMENTS",
      error instanceof Error ? error.message : String(error)
    );
    return 1;
  }

  let result: WorksmithResult<TopicCatalogPayload | Record<string, never>>;
  try {
    result = createWorksmithSuccess("topic_catalog", await buildTopicCatalog());
  } catch (error) {
    const code = error instanceof TopicCatalogError ? error.code : "TOPIC_CATALOG_FAILED";
    const message = error instanceof Error ? error.message : String(error);
    result = createWorksmithError("topic_catalog", code, message);
  }

  if (options.output === "json") {
    return renderWorksmithJsonResult(result);
  }

  if (result.status === "error") {
    printTopicsError(result.diagnostics[0].code, result.diagnostics[0].message);
    return result.exit_code;
  }

  renderTopicCatalogTerminal(result.payload as TopicCatalogPayload);
  return result.exit_code;
}
