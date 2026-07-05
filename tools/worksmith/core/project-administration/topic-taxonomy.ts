import { readFile } from "node:fs/promises";
import { parseStrictJson } from "./strict-json";

/**
 * Strict read-only reader for the project-owned topic taxonomy file.
 * Worksmith defines the shape; the actual topic values are entirely
 * project-owned configuration (see AN-019, AB-245). This module must never
 * hardcode a project-specific topic id.
 */

export const TOPIC_TAXONOMY_PATH = ".worksmith/topics.json" as const;
export const TOPIC_TAXONOMY_VERSION = 1 as const;

export interface WorksmithTopic {
  id: string;
  label: string;
}

export interface TopicTaxonomy {
  schema_version: typeof TOPIC_TAXONOMY_VERSION;
  topics: readonly WorksmithTopic[];
}

export interface EffectiveTopicTaxonomy {
  path: typeof TOPIC_TAXONOMY_PATH;
  present: boolean;
  taxonomy: TopicTaxonomy;
}

export class TopicTaxonomyError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details?: unknown
  ) {
    super(message);
    this.name = "TopicTaxonomyError";
  }
}

const EMPTY_TAXONOMY: TopicTaxonomy = Object.freeze({
  schema_version: TOPIC_TAXONOMY_VERSION,
  topics: []
});

function requireObject(value: unknown, location: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TopicTaxonomyError("TOPIC_TAXONOMY_INVALID", `${location} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requireNonEmptyString(value: unknown, location: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TopicTaxonomyError(
      "TOPIC_TAXONOMY_INVALID",
      `${location} must be a non-empty string.`
    );
  }
  return value;
}

export function parseTopicTaxonomy(json: string): TopicTaxonomy {
  let parsed: unknown;
  try {
    parsed = parseStrictJson(json);
  } catch (error) {
    throw new TopicTaxonomyError(
      "TOPIC_TAXONOMY_INVALID",
      `Invalid strict JSON: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  const root = requireObject(parsed, "topic taxonomy");
  const unknownKeys = Object.keys(root).filter(
    (key) => key !== "schema_version" && key !== "topics"
  );
  if (unknownKeys.length > 0) {
    throw new TopicTaxonomyError(
      "TOPIC_TAXONOMY_INVALID",
      `Unknown field(s) in topic taxonomy: ${unknownKeys.join(", ")}.`
    );
  }
  if (root.schema_version !== TOPIC_TAXONOMY_VERSION) {
    throw new TopicTaxonomyError(
      "TOPIC_TAXONOMY_UNSUPPORTED_VERSION",
      `Topic taxonomy schema_version must be ${TOPIC_TAXONOMY_VERSION}.`
    );
  }
  if (!Array.isArray(root.topics)) {
    throw new TopicTaxonomyError("TOPIC_TAXONOMY_INVALID", "Topic taxonomy 'topics' must be an array.");
  }

  const seenIds = new Set<string>();
  const duplicateIds = new Set<string>();
  const topics: WorksmithTopic[] = root.topics.map((entry, index) => {
    const location = `topics[${index}]`;
    const topicObject = requireObject(entry, location);
    const topicKeys = Object.keys(topicObject).filter((key) => key !== "id" && key !== "label");
    if (topicKeys.length > 0) {
      throw new TopicTaxonomyError(
        "TOPIC_TAXONOMY_INVALID",
        `Unknown field(s) in ${location}: ${topicKeys.join(", ")}.`
      );
    }
    const id = requireNonEmptyString(topicObject.id, `${location}.id`);
    const label = requireNonEmptyString(topicObject.label, `${location}.label`);

    if (seenIds.has(id)) {
      duplicateIds.add(id);
    }
    seenIds.add(id);

    return { id, label };
  });

  if (duplicateIds.size > 0) {
    throw new TopicTaxonomyError(
      "TOPIC_TAXONOMY_DUPLICATE_IDS",
      `Topic taxonomy contains duplicate topic id(s): ${[...duplicateIds].sort().join(", ")}.`,
      { duplicate_ids: [...duplicateIds].sort() }
    );
  }

  return { schema_version: TOPIC_TAXONOMY_VERSION, topics };
}

/**
 * Reads `.worksmith/topics.json` as project-owned configuration. A missing
 * file is not an error — it means the adopting project has not yet
 * registered a topic taxonomy — and yields an empty taxonomy rather than a
 * Worksmith-defined default, since Worksmith must never invent project
 * topic values.
 */
export async function loadTopicTaxonomy(): Promise<EffectiveTopicTaxonomy> {
  let content: string;
  try {
    content = await readFile(TOPIC_TAXONOMY_PATH, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { path: TOPIC_TAXONOMY_PATH, present: false, taxonomy: EMPTY_TAXONOMY };
    }
    throw new TopicTaxonomyError(
      "TOPIC_TAXONOMY_UNREADABLE",
      `Could not read ${TOPIC_TAXONOMY_PATH}: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return { path: TOPIC_TAXONOMY_PATH, present: true, taxonomy: parseTopicTaxonomy(content) };
}
