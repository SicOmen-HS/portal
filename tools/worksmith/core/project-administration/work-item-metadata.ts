import { parseStrictJson } from "./strict-json";
import {
  ARMBASE_PROJECT_ADMINISTRATION_CONFIG,
  SUPPORTED_STATUSES,
  type WorkItemStatus
} from "./configuration";

export { SUPPORTED_STATUSES, VALID_TRANSITIONS, type WorkItemStatus } from "./configuration";

export const METADATA_START = ARMBASE_PROJECT_ADMINISTRATION_CONFIG.metadata.startSentinel;
export const METADATA_END = ARMBASE_PROJECT_ADMINISTRATION_CONFIG.metadata.endSentinel;

export interface WorkItemMetadata {
  schema_version: 1;
  id: string;
  prefix: string;
  title: string;
  status: WorkItemStatus;
  created_on: string;
  completed_on: string | null;
}

export class WorkItemMetadataError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "WorkItemMetadataError";
  }
}

export function isWorkItemStatus(value: string): value is WorkItemStatus {
  return SUPPORTED_STATUSES.some((status) => status === value);
}

export function parseWorkItemMetadata(
  content: string,
  expectedIdentifier: string
): { metadata: WorkItemMetadata; jsonStart: number; jsonEnd: number } {
  const startCount = content.split(METADATA_START).length - 1;
  const endCount = content.split(METADATA_END).length - 1;

  if (startCount === 0 && endCount === 0) {
    throw new WorkItemMetadataError(
      "LEGACY_WORK_ITEM",
      `'${expectedIdentifier}' has no metadata block and cannot be transitioned.`
    );
  }
  if (startCount !== 1 || endCount !== 1) {
    throw new WorkItemMetadataError(
      "METADATA_BLOCK_COUNT",
      `'${expectedIdentifier}' must contain exactly one metadata block.`
    );
  }

  const start = content.indexOf(METADATA_START) + METADATA_START.length;
  const end = content.indexOf(METADATA_END, start);
  const parsed = parseStrictJson(content.slice(start, end).trim());

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new WorkItemMetadataError("METADATA_NOT_OBJECT", "Work-item metadata must be an object.");
  }

  const value = parsed as Record<string, unknown>;
  if (value.id !== expectedIdentifier) {
    throw new WorkItemMetadataError(
      "METADATA_ID_MISMATCH",
      `Metadata id '${String(value.id)}' does not match '${expectedIdentifier}'.`
    );
  }
  if (typeof value.status !== "string" || !isWorkItemStatus(value.status)) {
    throw new WorkItemMetadataError("METADATA_STATUS", "Metadata status is not supported.");
  }
  if (
    value.schema_version !== 1 ||
    typeof value.prefix !== "string" ||
    typeof value.title !== "string" ||
    typeof value.created_on !== "string" ||
    (value.completed_on !== null && typeof value.completed_on !== "string")
  ) {
    throw new WorkItemMetadataError("METADATA_SCHEMA", "Metadata does not match schema version 1.");
  }

  return {
    metadata: value as unknown as WorkItemMetadata,
    jsonStart: start,
    jsonEnd: end
  };
}

export function updateWorkItemStatus(
  content: string,
  parsed: { metadata: WorkItemMetadata; jsonStart: number; jsonEnd: number },
  targetStatus: WorkItemStatus
): string {
  const updated = JSON.stringify({ ...parsed.metadata, status: targetStatus }, null, 2);
  return `${content.slice(0, parsed.jsonStart)}\n${updated}\n${content.slice(parsed.jsonEnd)}`;
}

export function completeWorkItemMetadata(
  content: string,
  parsed: { metadata: WorkItemMetadata; jsonStart: number; jsonEnd: number },
  completedOn: string
): string {
  const updated = JSON.stringify(
    { ...parsed.metadata, status: "done", completed_on: completedOn },
    null,
    2
  );
  return `${content.slice(0, parsed.jsonStart)}\n${updated}\n${content.slice(parsed.jsonEnd)}`;
}
