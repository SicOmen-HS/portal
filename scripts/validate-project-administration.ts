import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ARMBASE_PROJECT_ADMINISTRATION_CONFIG } from "./project-administration/configuration";
import { IDENTIFIER_NUMBER_PATTERN_SOURCE } from "./project-administration/identifiers";
import {
  loadWorksmithPresentationConfiguration,
  type WorksmithWarningDetail
} from "./project-administration/presentation-configuration";

const CONFIG = ARMBASE_PROJECT_ADMINISTRATION_CONFIG;
const WORK_ITEMS_DIRECTORY = CONFIG.paths.workItemsDirectory;
const WORK_QUEUE_PATH = CONFIG.paths.workQueue;
const METADATA_START = CONFIG.metadata.startSentinel;
const METADATA_END = CONFIG.metadata.endSentinel;
const PREFIX_PATTERN = CONFIG.prefixes.join("|");
const IDENTIFIER_PATTERN = new RegExp(
  `^(${PREFIX_PATTERN})-${IDENTIFIER_NUMBER_PATTERN_SOURCE}$`
);
const FILE_NAME_PATTERN = new RegExp(
  `^(${PREFIX_PATTERN})-${IDENTIFIER_NUMBER_PATTERN_SOURCE}\\.md$`
);
const STRICT_H1_PATTERN = new RegExp(
  `^# ((${PREFIX_PATTERN})-${IDENTIFIER_NUMBER_PATTERN_SOURCE}) - (.+)$`
);
const QUEUE_ENTRY_PATTERN = new RegExp(
  `^(\\s*)-\\s+([A-Z]{2}-${IDENTIFIER_NUMBER_PATTERN_SOURCE})\\s+([-–—])\\s+(.+?)\\s*$`
);
const ISO_DATE_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
const SUPPORTED_PREFIXES = new Set(CONFIG.prefixes);
const SUPPORTED_STATUSES = new Set(CONFIG.statuses);
const STATUS_TO_QUEUE_SECTION = CONFIG.statusToQueueSection;
const QUEUE_SECTIONS = new Set(Object.values(STATUS_TO_QUEUE_SECTION));
const ACTIVE_QUEUE_SECTIONS = new Set(
  CONFIG.activeStatuses.map((status) => STATUS_TO_QUEUE_SECTION[status])
);
const METADATA_FIELDS = new Set([
  "schema_version",
  "id",
  "prefix",
  "title",
  "status",
  "created_on",
  "completed_on"
]);

type IssueCategory = "error" | "warning" | "legacy";

interface Issue {
  category: IssueCategory;
  code: string;
  message: string;
}

interface WorkItemMetadata {
  schema_version: number;
  id: string;
  prefix: string;
  title: string;
  status: string;
  created_on: string;
  completed_on: string | null;
}

interface WorkItemRecord {
  relativePath: string;
  fileIdentifier: string | null;
  headingIdentifier: string | null;
  headingTitle: string | null;
  metadata: WorkItemMetadata | null;
}

interface QueueEntry {
  identifier: string;
  title: string;
  section: string;
  lineNumber: number;
  indentation: string;
  separator: string;
  references: string[];
  completedOn: string | null;
}

export interface ProjectAdministrationValidationSummary {
  workItemCount: number;
  queueEntryCount: number;
  metadataCount: number;
  legacyCount: number;
  errorCount: number;
  warningCount: number;
}

const issues: Issue[] = [];

function report(category: IssueCategory, code: string, message: string): void {
  issues.push({ category, code, message });
}

function missingQueueFileCategory(section: string): Exclude<IssueCategory, "legacy"> {
  return ACTIVE_QUEUE_SECTIONS.has(section) ? "error" : "warning";
}

function countOccurrences(value: string, search: string): number {
  let count = 0;
  let offset = 0;

  while (true) {
    const index = value.indexOf(search, offset);
    if (index === -1) {
      return count;
    }

    count += 1;
    offset = index + search.length;
  }
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function findDuplicateJsonKeys(json: string): string[] {
  let offset = 0;
  const duplicates: string[] = [];

  function skipWhitespace(): void {
    while (/\s/.test(json[offset] ?? "")) {
      offset += 1;
    }
  }

  function parseString(): string {
    const start = offset;
    offset += 1;

    while (offset < json.length) {
      if (json[offset] === "\\") {
        offset += 2;
      } else if (json[offset] === '"') {
        offset += 1;
        return JSON.parse(json.slice(start, offset)) as string;
      } else {
        offset += 1;
      }
    }

    return "";
  }

  function parseValue(location: string): void {
    skipWhitespace();

    if (json[offset] === "{") {
      parseObject(location);
      return;
    }

    if (json[offset] === "[") {
      parseArray(location);
      return;
    }

    if (json[offset] === '"') {
      parseString();
      return;
    }

    while (offset < json.length && !/[\s,}\]]/.test(json[offset])) {
      offset += 1;
    }
  }

  function parseObject(location: string): void {
    const keys = new Set<string>();
    offset += 1;
    skipWhitespace();

    if (json[offset] === "}") {
      offset += 1;
      return;
    }

    while (offset < json.length) {
      skipWhitespace();
      const key = parseString();
      const keyLocation = location ? `${location}.${key}` : key;

      if (keys.has(key)) {
        duplicates.push(keyLocation);
      }
      keys.add(key);

      skipWhitespace();
      offset += 1;
      parseValue(keyLocation);
      skipWhitespace();

      if (json[offset] === "}") {
        offset += 1;
        return;
      }

      offset += 1;
    }
  }

  function parseArray(location: string): void {
    offset += 1;
    skipWhitespace();

    if (json[offset] === "]") {
      offset += 1;
      return;
    }

    let index = 0;
    while (offset < json.length) {
      parseValue(`${location}[${index}]`);
      index += 1;
      skipWhitespace();

      if (json[offset] === "]") {
        offset += 1;
        return;
      }

      offset += 1;
    }
  }

  parseValue("");
  return duplicates;
}

function validateMetadata(
  value: unknown,
  record: Omit<WorkItemRecord, "metadata">
): WorkItemMetadata | null {
  const location = record.relativePath;

  if (!isPlainObject(value)) {
    report("error", "METADATA_NOT_OBJECT", `${location}: metadata must be a JSON object.`);
    return null;
  }

  for (const field of Object.keys(value)) {
    if (!METADATA_FIELDS.has(field)) {
      report("error", "METADATA_UNKNOWN_FIELD", `${location}: unknown metadata field '${field}'.`);
    }
  }

  for (const field of METADATA_FIELDS) {
    if (!Object.hasOwn(value, field)) {
      report("error", "METADATA_MISSING_FIELD", `${location}: missing metadata field '${field}'.`);
    }
  }

  const schemaVersion = value.schema_version;
  const id = value.id;
  const prefix = value.prefix;
  const title = value.title;
  const status = value.status;
  const createdOn = value.created_on;
  const completedOn = value.completed_on;

  if (schemaVersion !== CONFIG.metadata.schemaVersion) {
    report("error", "METADATA_SCHEMA_VERSION", `${location}: schema_version must be 1.`);
  }

  if (typeof id !== "string" || !IDENTIFIER_PATTERN.test(id)) {
    report(
      "error",
      "METADATA_ID",
      `${location}: metadata id must use a supported prefix and 3-5 canonical digits.`
    );
  }

  if (typeof prefix !== "string" || !SUPPORTED_PREFIXES.has(prefix)) {
    report("error", "METADATA_PREFIX", `${location}: metadata prefix must be AB, AN or IM.`);
  }

  if (
    typeof id === "string" &&
    IDENTIFIER_PATTERN.test(id) &&
    typeof prefix === "string" &&
    id.split("-")[0] !== prefix
  ) {
    report("error", "METADATA_PREFIX_MISMATCH", `${location}: metadata prefix does not match id '${id}'.`);
  }

  if (typeof title !== "string" || title.trim().length === 0 || title !== title.trim()) {
    report("error", "METADATA_TITLE", `${location}: metadata title must be a non-empty trimmed string.`);
  } else if (!/^[A-Z0-9][^\r\n]*$/.test(title)) {
    report(
      "error",
      "METADATA_TITLE_FORMAT",
      `${location}: metadata title must begin with an uppercase letter or number and stay on one line.`
    );
  }

  if (typeof status !== "string" || !SUPPORTED_STATUSES.has(status)) {
    report("error", "METADATA_STATUS", `${location}: metadata status is not supported.`);
  }

  if (typeof createdOn !== "string" || !isValidIsoDate(createdOn)) {
    report("error", "METADATA_CREATED_ON", `${location}: created_on must be a valid YYYY-MM-DD date.`);
  }

  if (completedOn !== null && (typeof completedOn !== "string" || !isValidIsoDate(completedOn))) {
    report("error", "METADATA_COMPLETED_ON", `${location}: completed_on must be null or a valid YYYY-MM-DD date.`);
  }

  if (status === "done" && typeof completedOn !== "string") {
    report("error", "METADATA_DONE_DATE", `${location}: done work items require completed_on.`);
  } else if (typeof status === "string" && status !== "done" && completedOn !== null) {
    report("error", "METADATA_EARLY_COMPLETION_DATE", `${location}: completed_on must be null before done.`);
  }

  if (typeof id === "string" && record.fileIdentifier !== null && id !== record.fileIdentifier) {
    report(
      "error",
      "METADATA_FILE_ID_MISMATCH",
      `${location}: metadata id '${id}' does not match filename id '${record.fileIdentifier}'.`
    );
  }

  if (typeof id === "string" && record.headingIdentifier !== null && id !== record.headingIdentifier) {
    report(
      "error",
      "METADATA_HEADING_ID_MISMATCH",
      `${location}: metadata id '${id}' does not match H1 id '${record.headingIdentifier}'.`
    );
  }

  if (typeof title === "string" && record.headingTitle !== null && title !== record.headingTitle) {
    report(
      "error",
      "METADATA_HEADING_TITLE_MISMATCH",
      `${location}: metadata title does not match the H1 title.`
    );
  }

  if (
    schemaVersion !== CONFIG.metadata.schemaVersion ||
    typeof id !== "string" ||
    typeof prefix !== "string" ||
    typeof title !== "string" ||
    typeof status !== "string" ||
    typeof createdOn !== "string" ||
    (completedOn !== null && typeof completedOn !== "string")
  ) {
    return null;
  }

  return {
    schema_version: schemaVersion,
    id,
    prefix,
    title,
    status,
    created_on: createdOn,
    completed_on: completedOn
  };
}

async function inspectWorkItem(relativePath: string): Promise<WorkItemRecord> {
  const content = await readFile(relativePath, "utf8");
  const fileName = path.basename(relativePath);
  const fileIdentifier = FILE_NAME_PATTERN.test(fileName) ? fileName.slice(0, -3) : null;

  if (fileIdentifier === null) {
    report(
      "error",
      "INVALID_FILENAME",
      `${relativePath}: filename must use AB, AN or IM with 3-5 canonical digits.`
    );
  }

  const lines = content.split(/\r?\n/);
  const firstH1Index = lines.findIndex((line) => line.startsWith("# "));
  const firstH1 = firstH1Index === -1 ? null : lines[firstH1Index];
  const h1Match = firstH1?.match(STRICT_H1_PATTERN) ?? null;
  const headingIdentifier = h1Match?.[1] ?? null;
  const headingTitle = h1Match?.[3] ?? null;

  if (firstH1 === null) {
    report("error", "MISSING_H1", `${relativePath}: no level-one Markdown heading was found.`);
  } else if (h1Match === null) {
    report(
      "error",
      "INVALID_H1",
      `${relativePath}: first H1 must use '# PREFIX-<3-5 digits> - Title' with a supported prefix.`
    );
  }

  if (fileIdentifier !== null && headingIdentifier !== null && fileIdentifier !== headingIdentifier) {
    report(
      "error",
      "FILE_HEADING_ID_MISMATCH",
      `${relativePath}: filename id '${fileIdentifier}' does not match H1 id '${headingIdentifier}'.`
    );
  }

  const recordWithoutMetadata = {
    relativePath,
    fileIdentifier,
    headingIdentifier,
    headingTitle
  };
  const startCount = countOccurrences(content, METADATA_START);
  const endCount = countOccurrences(content, METADATA_END);

  if (startCount === 0 && endCount === 0) {
    report("legacy", "LEGACY_WORK_ITEM", `${relativePath}: no metadata block; treated as immutable legacy.`);
    return { ...recordWithoutMetadata, metadata: null };
  }

  if (startCount !== 1 || endCount !== 1) {
    report(
      "error",
      "METADATA_BLOCK_COUNT",
      `${relativePath}: expected exactly one metadata block, found ${startCount} start and ${endCount} end sentinels.`
    );
    return { ...recordWithoutMetadata, metadata: null };
  }

  const startIndex = content.indexOf(METADATA_START);
  const jsonStart = startIndex + METADATA_START.length;
  const endIndex = content.indexOf(METADATA_END, jsonStart);

  if (endIndex < jsonStart) {
    report("error", "METADATA_BLOCK_ORDER", `${relativePath}: metadata sentinels are out of order.`);
    return { ...recordWithoutMetadata, metadata: null };
  }

  if (firstH1Index !== -1) {
    const firstH1Offset = lines.slice(0, firstH1Index).reduce((total, line) => total + line.length + 1, 0);
    const firstH1End = firstH1Offset + lines[firstH1Index].length;
    if (content.slice(firstH1End, startIndex).trim().length > 0) {
      report(
        "error",
        "METADATA_BLOCK_POSITION",
        `${relativePath}: metadata block must appear directly after the first H1.`
      );
    }
  }

  const json = content.slice(jsonStart, endIndex).trim();
  let parsed: unknown;

  try {
    parsed = JSON.parse(json) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown JSON error";
    report("error", "METADATA_JSON", `${relativePath}: invalid strict JSON (${message}).`);
    return { ...recordWithoutMetadata, metadata: null };
  }

  for (const duplicate of findDuplicateJsonKeys(json)) {
    report("error", "METADATA_DUPLICATE_KEY", `${relativePath}: duplicate JSON key '${duplicate}'.`);
  }

  const metadata = validateMetadata(parsed, recordWithoutMetadata);
  return { ...recordWithoutMetadata, metadata };
}

function parseQueue(content: string): QueueEntry[] {
  const lines = content.split(/\r?\n/);
  const entries: QueueEntry[] = [];
  let section = "";
  let currentEntry: QueueEntry | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const sectionMatch = line.match(/^## (.+)$/);
    if (sectionMatch !== null) {
      section = sectionMatch[1].trim();
      currentEntry = null;
      continue;
    }

    const entryMatch = line.match(QUEUE_ENTRY_PATTERN);
    if (entryMatch !== null) {
      currentEntry = {
        identifier: entryMatch[2],
        title: entryMatch[4],
        section,
        lineNumber: index + 1,
        indentation: entryMatch[1],
        separator: entryMatch[3],
        references: [],
        completedOn: null
      };
      entries.push(currentEntry);
      continue;
    }

    if (currentEntry === null) {
      continue;
    }

    const referenceMatch = line.match(/^\s+See:\s+`?([^`\s]+)`?\s*$/);
    if (referenceMatch !== null) {
      currentEntry.references.push(referenceMatch[1].replaceAll("\\", "/"));
      continue;
    }

    const completionMatch = line.match(/^\s+Completed:\s+([0-9]{4}-[0-9]{2}-[0-9]{2})\s*$/);
    if (completionMatch !== null) {
      currentEntry.completedOn = completionMatch[1];
    }
  }

  return entries;
}

function validateQueue(
  entries: QueueEntry[],
  workItems: WorkItemRecord[]
): Map<string, QueueEntry[]> {
  const entriesByIdentifier = new Map<string, QueueEntry[]>();
  const workItemsByIdentifier = new Map<string, WorkItemRecord>();
  const workItemsByHeadingIdentifier = new Map<string, WorkItemRecord[]>();
  const workItemPaths = new Set(workItems.map((item) => item.relativePath.toLowerCase()));

  for (const item of workItems) {
    if (item.fileIdentifier !== null) {
      workItemsByIdentifier.set(item.fileIdentifier.toUpperCase(), item);
    }

    if (item.headingIdentifier !== null) {
      const key = item.headingIdentifier.toUpperCase();
      const grouped = workItemsByHeadingIdentifier.get(key) ?? [];
      grouped.push(item);
      workItemsByHeadingIdentifier.set(key, grouped);
    }
  }

  for (const entry of entries) {
    const key = entry.identifier.toUpperCase();
    const grouped = entriesByIdentifier.get(key) ?? [];
    grouped.push(entry);
    entriesByIdentifier.set(key, grouped);

    if (!IDENTIFIER_PATTERN.test(entry.identifier)) {
      report(
        "error",
        "QUEUE_IDENTIFIER",
        `${WORK_QUEUE_PATH}:${entry.lineNumber}: unsupported queue identifier '${entry.identifier}'.`
      );
    }

    if (!QUEUE_SECTIONS.has(entry.section)) {
      report(
        "error",
        "QUEUE_SECTION",
        `${WORK_QUEUE_PATH}:${entry.lineNumber}: '${entry.identifier}' is outside a supported lifecycle section.`
      );
    }

    if (entry.indentation !== "") {
      report(
        "warning",
        "QUEUE_ENTRY_INDENTATION",
        `${WORK_QUEUE_PATH}:${entry.lineNumber}: '${entry.identifier}' should not be indented.`
      );
    }

    if (entry.separator !== "-") {
      report(
        "warning",
        "QUEUE_ENTRY_SEPARATOR",
        `${WORK_QUEUE_PATH}:${entry.lineNumber}: '${entry.identifier}' uses a non-canonical title separator.`
      );
    }

    const expectedPath = `${WORK_ITEMS_DIRECTORY}/${entry.identifier}.md`;
    if (!workItemsByIdentifier.has(key)) {
      const category = missingQueueFileCategory(entry.section);
      report(
        category,
        category === "error" ? "QUEUE_MISSING_ACTIVE_WORK_ITEM" : "QUEUE_MISSING_PLACEHOLDER_WORK_ITEM",
        `${WORK_QUEUE_PATH}:${entry.lineNumber}: '${entry.identifier}' in '${entry.section}' references missing '${expectedPath}'.`
      );
    }

    const conflictingHeadings = (workItemsByHeadingIdentifier.get(key) ?? []).filter(
      (item) => item.fileIdentifier?.toUpperCase() !== key
    );
    for (const conflict of conflictingHeadings) {
      report(
        "error",
        "QUEUE_IDENTIFIER_COLLISION",
        `${WORK_QUEUE_PATH}:${entry.lineNumber}: '${entry.identifier}' is also claimed by the H1 in '${conflict.relativePath}'.`
      );
    }

    if (entry.references.length === 0) {
      report(
        "warning",
        "QUEUE_MISSING_SEE",
        `${WORK_QUEUE_PATH}:${entry.lineNumber}: '${entry.identifier}' has no canonical See reference.`
      );
    } else if (entry.references.length > 1) {
      report(
        "error",
        "QUEUE_MULTIPLE_SEE",
        `${WORK_QUEUE_PATH}:${entry.lineNumber}: '${entry.identifier}' has multiple See references.`
      );
    }

    for (const reference of entry.references) {
      if (reference.toLowerCase() !== expectedPath.toLowerCase()) {
        report(
          "error",
          "QUEUE_REFERENCE_MISMATCH",
          `${WORK_QUEUE_PATH}:${entry.lineNumber}: '${entry.identifier}' references '${reference}', expected '${expectedPath}'.`
        );
      }

      if (!workItemPaths.has(reference.toLowerCase())) {
        const category = missingQueueFileCategory(entry.section);
        report(
          category,
          category === "error"
            ? "QUEUE_ACTIVE_REFERENCE_NOT_FOUND"
            : "QUEUE_PLACEHOLDER_REFERENCE_NOT_FOUND",
          `${WORK_QUEUE_PATH}:${entry.lineNumber}: referenced file '${reference}' does not exist for '${entry.section}'.`
        );
      }
    }
  }

  for (const [identifier, grouped] of entriesByIdentifier) {
    if (grouped.length > 1) {
      report(
        "error",
        "DUPLICATE_QUEUE_IDENTIFIER",
        `${WORK_QUEUE_PATH}: identifier '${identifier}' appears in ${grouped.length} queue entries.`
      );
    }
  }

  return entriesByIdentifier;
}

function validateDuplicateIdentifiers(workItems: WorkItemRecord[]): void {
  const sources = [
    {
      name: "filename",
      code: "DUPLICATE_FILE_IDENTIFIER",
      values: workItems.map((item) => ({ identifier: item.fileIdentifier, path: item.relativePath }))
    },
    {
      name: "H1",
      code: "DUPLICATE_H1_IDENTIFIER",
      values: workItems.map((item) => ({ identifier: item.headingIdentifier, path: item.relativePath }))
    },
    {
      name: "metadata",
      code: "DUPLICATE_METADATA_IDENTIFIER",
      values: workItems.map((item) => ({ identifier: item.metadata?.id ?? null, path: item.relativePath }))
    }
  ];

  for (const source of sources) {
    const grouped = new Map<string, string[]>();
    for (const value of source.values) {
      if (value.identifier === null) {
        continue;
      }

      const key = value.identifier.toUpperCase();
      const paths = grouped.get(key) ?? [];
      paths.push(value.path);
      grouped.set(key, paths);
    }

    for (const [identifier, paths] of grouped) {
      if (paths.length > 1) {
        report(
          "error",
          source.code,
          `Identifier '${identifier}' is duplicated by ${source.name}: ${paths.join(", ")}.`
        );
      }
    }
  }
}

function validateMetadataLifecycle(
  workItems: WorkItemRecord[],
  queueEntries: Map<string, QueueEntry[]>
): void {
  const metadataItems = workItems.filter(
    (item): item is WorkItemRecord & { metadata: WorkItemMetadata } => item.metadata !== null
  );
  const inProgressItems = metadataItems.filter((item) => item.metadata.status === "in_progress");

  if (inProgressItems.length > 1) {
    report(
      "error",
      "MULTIPLE_IN_PROGRESS",
      `More than one metadata-enabled work item is in_progress: ${inProgressItems
        .map((item) => item.metadata.id)
        .join(", ")}.`
    );
  }

  for (const item of metadataItems) {
    if (!SUPPORTED_STATUSES.has(item.metadata.status)) {
      continue;
    }

    const entries = queueEntries.get(item.metadata.id.toUpperCase()) ?? [];
    if (entries.length === 0) {
      report(
        "error",
        "METADATA_QUEUE_ENTRY_MISSING",
        `${item.relativePath}: metadata-enabled item '${item.metadata.id}' is missing from the queue.`
      );
      continue;
    }

    if (entries.length !== 1) {
      continue;
    }

    const entry = entries[0];
    const expectedSection = STATUS_TO_QUEUE_SECTION[item.metadata.status];
    if (entry.section !== expectedSection) {
      report(
        "error",
        "METADATA_QUEUE_STATUS_MISMATCH",
        `${item.relativePath}: status '${item.metadata.status}' maps to '${expectedSection}', not '${entry.section}'.`
      );
    }

    if (entry.title !== item.metadata.title) {
      report(
        "error",
        "METADATA_QUEUE_TITLE_MISMATCH",
        `${item.relativePath}: metadata title does not match the queue title.`
      );
    }

    if (item.metadata.status === "done" && entry.completedOn !== item.metadata.completed_on) {
      report(
        "error",
        "METADATA_QUEUE_COMPLETION_MISMATCH",
        `${item.relativePath}: completed_on does not match the queue completion date.`
      );
    }
  }
}

function printCategory(title: string, category: IssueCategory): void {
  const categoryIssues = issues
    .filter((issue) => issue.category === category)
    .sort((left, right) =>
      `${left.code}:${left.message}`.localeCompare(`${right.code}:${right.message}`)
    );

  console.log(`\n${title} (${categoryIssues.length})`);
  if (categoryIssues.length === 0) {
    console.log("  None.");
    return;
  }

  for (const issue of categoryIssues) {
    console.log(`  - [${issue.code}] ${issue.message}`);
  }
}

function printLegacySummary(): void {
  const legacyIssues = issues.filter((issue) => issue.category === "legacy");
  console.log(`\nLegacy observations (${legacyIssues.length})`);
  if (legacyIssues.length === 0) {
    console.log("  None.");
    return;
  }

  const grouped = new Map<string, number>();
  for (const issue of legacyIssues) {
    grouped.set(issue.code, (grouped.get(issue.code) ?? 0) + 1);
  }

  for (const [code, count] of [...grouped].sort(([left], [right]) => left.localeCompare(right))) {
    console.log(`  - [${code}] ${count} immutable legacy work item(s); details omitted.`);
  }
}

function printWarningSummary(): void {
  const warningIssues = issues.filter((issue) => issue.category === "warning");
  console.log(`\nWarnings (${warningIssues.length})`);
  if (warningIssues.length === 0) {
    console.log("  None.");
    return;
  }

  const grouped = new Map<string, number>();
  for (const issue of warningIssues) {
    grouped.set(issue.code, (grouped.get(issue.code) ?? 0) + 1);
  }

  for (const [code, count] of [...grouped].sort(([left], [right]) => left.localeCompare(right))) {
    console.log(`  - [${code}] ${count} warning(s); details omitted.`);
  }
  console.log("  Run 'npm run project -- validate --detail full' for complete warning detail.");
}

export async function validateProjectAdministration(
  printReport = true,
  warningDetail: WorksmithWarningDetail = "summary"
): Promise<ProjectAdministrationValidationSummary> {
  issues.length = 0;
  const workItemPaths = await findMarkdownFiles(WORK_ITEMS_DIRECTORY);
  const workItems = await Promise.all(workItemPaths.map(inspectWorkItem));
  const queueContent = await readFile(WORK_QUEUE_PATH, "utf8");
  const queueEntries = parseQueue(queueContent);

  validateDuplicateIdentifiers(workItems);
  const queueEntriesByIdentifier = validateQueue(queueEntries, workItems);
  validateMetadataLifecycle(workItems, queueEntriesByIdentifier);

  const metadataCount = workItems.filter((item) => item.metadata !== null).length;
  const legacyCount = issues.filter((issue) => issue.category === "legacy").length;
  const errorCount = issues.filter((issue) => issue.category === "error").length;
  const warningCount = issues.filter((issue) => issue.category === "warning").length;

  if (printReport) {
    console.log("ArmBase project administration validation");
    console.log(`Work items scanned: ${workItems.length}`);
    console.log(`Queue entries scanned: ${queueEntries.length}`);
    console.log(`Metadata-enabled work items: ${metadataCount}`);
    console.log(`Legacy work items: ${legacyCount}`);

    printCategory("Errors", "error");
    if (warningDetail === "full") {
      printCategory("Warnings", "warning");
    } else {
      printWarningSummary();
    }
    printLegacySummary();

    console.log(
      `\nSummary: ${errorCount} error(s), ${warningCount} warning(s), ${legacyCount} legacy observation(s).`
    );
    console.log(errorCount > 0 ? "Result: FAILED" : "Result: PASSED");
  }

  return {
    workItemCount: workItems.length,
    queueEntryCount: queueEntries.length,
    metadataCount,
    legacyCount,
    errorCount,
    warningCount
  };
}

export async function runValidateProjectAdministrationCommand(
  arguments_: string[],
  configuredDetail: WorksmithWarningDetail = "summary"
): Promise<number> {
  let warningDetail = configuredDetail;
  if (arguments_.length > 0) {
    if (
      arguments_.length !== 2 ||
      arguments_[0] !== "--detail" ||
      (arguments_[1] !== "summary" && arguments_[1] !== "full")
    ) {
      console.error("validate accepts only --detail summary or --detail full.");
      return 1;
    }
    warningDetail = arguments_[1];
  }

  const summary = await validateProjectAdministration(true, warningDetail);
  return summary.errorCount > 0 ? 1 : 0;
}

async function main(): Promise<void> {
  const presentation = await loadWorksmithPresentationConfiguration();
  process.exitCode = await runValidateProjectAdministrationCommand(
    process.argv.slice(2),
    presentation.configuration.output.warning_detail
  );
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectExecution) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Project administration validator failed: ${message}`);
    process.exitCode = 1;
  });
}
