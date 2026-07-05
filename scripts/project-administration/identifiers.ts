import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import {
  ARMBASE_PROJECT_ADMINISTRATION_CONFIG,
  SUPPORTED_PREFIXES,
  type WorkItemPrefix
} from "./configuration";

export { SUPPORTED_PREFIXES, type WorkItemPrefix } from "./configuration";

export const WORK_ITEMS_DIRECTORY =
  ARMBASE_PROJECT_ADMINISTRATION_CONFIG.paths.workItemsDirectory;
export const WORK_QUEUE_PATH = ARMBASE_PROJECT_ADMINISTRATION_CONFIG.paths.workQueue;

const PREFIX_PATTERN = SUPPORTED_PREFIXES.join("|");
const { minimum: MINIMUM_IDENTIFIER_DIGITS, maximum: MAXIMUM_IDENTIFIER_DIGITS } =
  ARMBASE_PROJECT_ADMINISTRATION_CONFIG.identifierDigits;
export const IDENTIFIER_NUMBER_PATTERN_SOURCE = `(?:[0-9]{${MINIMUM_IDENTIFIER_DIGITS}}|[1-9][0-9]{${MINIMUM_IDENTIFIER_DIGITS},${MAXIMUM_IDENTIFIER_DIGITS - 1}})`;
export const WORK_ITEM_IDENTIFIER_PATTERN_SOURCE = `(?:${PREFIX_PATTERN})-${IDENTIFIER_NUMBER_PATTERN_SOURCE}`;
export const WORK_ITEM_IDENTIFIER_PATTERN = new RegExp(`^${WORK_ITEM_IDENTIFIER_PATTERN_SOURCE}$`);
const FILE_IDENTIFIER_PATTERN = new RegExp(
  `^(${PREFIX_PATTERN})-(${IDENTIFIER_NUMBER_PATTERN_SOURCE})\\.md$`
);
const QUEUE_ENTRY_PATTERN = new RegExp(
  `^\\s*-\\s+((${PREFIX_PATTERN})-${IDENTIFIER_NUMBER_PATTERN_SOURCE})\\s+[-–—]\\s+.+$`,
  "gm"
);

export interface IdentifierOccurrence {
  identifier: string;
  location: string;
}

export interface IdentifierState {
  fileIdentifiers: IdentifierOccurrence[];
  queueIdentifiers: IdentifierOccurrence[];
}

export interface IdentifierDuplicate {
  identifier: string;
  locations: string[];
}

export interface AllocationResult {
  allocatedId: string;
  highestExisting: string | null;
}

function toRepositoryPath(value: string): string {
  return value.split(path.sep).join("/");
}

async function findMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findMarkdownFiles(entryPath)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push(toRepositoryPath(entryPath));
    }
  }

  return files.sort((left, right) => left.localeCompare(right));
}

export function findIdentifierDuplicates(
  occurrences: IdentifierOccurrence[]
): IdentifierDuplicate[] {
  const grouped = new Map<string, string[]>();

  for (const occurrence of occurrences) {
    const locations = grouped.get(occurrence.identifier) ?? [];
    locations.push(occurrence.location);
    grouped.set(occurrence.identifier, locations);
  }

  return [...grouped.entries()]
    .filter(([, locations]) => locations.length > 1)
    .map(([identifier, locations]) => ({ identifier, locations }))
    .sort((left, right) => left.identifier.localeCompare(right.identifier));
}

export async function scanIdentifierState(): Promise<IdentifierState> {
  const [files, queue] = await Promise.all([
    findMarkdownFiles(WORK_ITEMS_DIRECTORY),
    readFile(WORK_QUEUE_PATH, "utf8")
  ]);
  const fileIdentifiers: IdentifierOccurrence[] = [];
  const queueIdentifiers: IdentifierOccurrence[] = [];

  for (const file of files) {
    const match = path.basename(file).match(FILE_IDENTIFIER_PATTERN);
    if (match !== null) {
      fileIdentifiers.push({ identifier: match[0].slice(0, -3), location: file });
    }
  }

  for (const match of queue.matchAll(QUEUE_ENTRY_PATTERN)) {
    const lineNumber = queue.slice(0, match.index).split(/\r?\n/).length;
    queueIdentifiers.push({
      identifier: match[1],
      location: `${WORK_QUEUE_PATH}:${lineNumber}`
    });
  }

  return { fileIdentifiers, queueIdentifiers };
}

export function assertNoIdentifierDuplicates(state: IdentifierState): void {
  const duplicateFiles = findIdentifierDuplicates(state.fileIdentifiers);
  const duplicateQueueEntries = findIdentifierDuplicates(state.queueIdentifiers);

  if (duplicateFiles.length > 0 || duplicateQueueEntries.length > 0) {
    throw new IdentifierAllocationError(
      "DUPLICATE_IDENTIFIERS",
      "Duplicate work-item identifiers were detected.",
      {
        work_item_files: duplicateFiles,
        work_queue_entries: duplicateQueueEntries
      }
    );
  }
}

export function allocateIdentifier(
  prefix: WorkItemPrefix,
  state: IdentifierState
): AllocationResult {
  assertNoIdentifierDuplicates(state);

  const identifiers = new Set([
    ...state.fileIdentifiers.map((occurrence) => occurrence.identifier),
    ...state.queueIdentifiers.map((occurrence) => occurrence.identifier)
  ]);
  const matchingNumbers = [...identifiers]
    .filter((identifier) => identifier.startsWith(`${prefix}-`))
    .map((identifier) => Number(identifier.slice(prefix.length + 1)));
  const highestNumber = matchingNumbers.length === 0 ? 0 : Math.max(...matchingNumbers);
  const allocatedNumber = highestNumber + 1;

  const maximumIdentifier = 10 ** MAXIMUM_IDENTIFIER_DIGITS - 1;
  if (allocatedNumber > maximumIdentifier) {
    throw new IdentifierAllocationError(
      "IDENTIFIER_RANGE_EXHAUSTED",
      `No ${MINIMUM_IDENTIFIER_DIGITS}-${MAXIMUM_IDENTIFIER_DIGITS} digit ${prefix} identifiers remain.`
    );
  }

  const formatIdentifier = (number: number): string =>
    `${prefix}-${number.toString().padStart(MINIMUM_IDENTIFIER_DIGITS, "0")}`;

  return {
    allocatedId: formatIdentifier(allocatedNumber),
    highestExisting: highestNumber === 0 ? null : formatIdentifier(highestNumber)
  };
}

export function isWorkItemPrefix(value: string): value is WorkItemPrefix {
  return SUPPORTED_PREFIXES.some((prefix) => prefix === value);
}

export function isWorkItemIdentifier(value: string): boolean {
  return WORK_ITEM_IDENTIFIER_PATTERN.test(value);
}

export class IdentifierAllocationError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details?: unknown
  ) {
    super(message);
    this.name = "IdentifierAllocationError";
  }
}
