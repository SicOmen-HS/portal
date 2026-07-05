import { open, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  IdentifierAllocationError,
  WORK_ITEMS_DIRECTORY,
  WORK_QUEUE_PATH,
  allocateIdentifier,
  isWorkItemPrefix,
  scanIdentifierState,
  type WorkItemPrefix
} from "./project-administration/identifiers";
import { parseStrictJson } from "./project-administration/strict-json";
import { STATUS_TO_QUEUE_SECTION, insertQueueEntry } from "./project-administration/queue";
import { ARMBASE_PROJECT_ADMINISTRATION_CONFIG } from "./project-administration/configuration";
import { METADATA_END, METADATA_START } from "./project-administration/work-item-metadata";
import {
  executeCoordinatedTransaction,
  requireValidAdministrationState
} from "./project-administration/transaction-service";
import {
  RepositoryMutationLockError,
  withRepositoryMutationLock
} from "./project-administration/mutation-lock";

const CREATION_STATUSES = new Set(ARMBASE_PROJECT_ADMINISTRATION_CONFIG.creationStatuses);
export const SECTION_KEYS = [
  "background",
  "goal",
  "scope",
  "requirements",
  "verification",
  "acceptance_criteria",
  "out_of_scope",
  "deliverables"
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];
type CreateDetail = "compact" | "full";

interface CreateInput {
  json: string;
  dryRun: boolean;
  detail: CreateDetail;
  manifestPath?: string;
}

interface ValidationSummary {
  errors: number;
  warnings: number;
  legacy_observations: number;
}

export interface CreateWorkItemManifest {
  schema_version: 1;
  operation: "create_work_item";
  work_item: {
    id: "auto";
    prefix: WorkItemPrefix;
    title: string;
    initial_status: string;
    created_on: string;
    sections: Record<SectionKey, string[]>;
  };
  documentation: {
    changes: [];
  };
  git: {
    commit_message: string;
    commit: false;
    push: false;
  };
}

export class ManifestError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "ManifestError";
  }
}

function printError(code: string, message: string, details?: unknown): void {
  console.error(
    JSON.stringify(
      {
        error: {
          code,
          message,
          ...(details === undefined ? {} : { details })
        }
      },
      null,
      2
    )
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
  location: string
): void {
  const expected = new Set(expectedKeys);
  const unknown = Object.keys(value).filter((key) => !expected.has(key));
  const missing = expectedKeys.filter((key) => !Object.hasOwn(value, key));

  if (unknown.length > 0) {
    throw new ManifestError(
      "MANIFEST_UNKNOWN_FIELD",
      `${location} contains unknown field(s): ${unknown.join(", ")}.`
    );
  }

  if (missing.length > 0) {
    throw new ManifestError(
      "MANIFEST_MISSING_FIELD",
      `${location} is missing field(s): ${missing.join(", ")}.`
    );
  }
}

export function isValidIsoDate(value: string): boolean {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) {
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

export function validateManifest(value: unknown): CreateWorkItemManifest {
  if (!isPlainObject(value)) {
    throw new ManifestError("MANIFEST_NOT_OBJECT", "Manifest must be a JSON object.");
  }
  assertExactKeys(value, ["schema_version", "operation", "work_item", "documentation", "git"], "manifest");

  if (value.schema_version !== 1) {
    throw new ManifestError("MANIFEST_SCHEMA_VERSION", "schema_version must be 1.");
  }
  if (value.operation !== "create_work_item") {
    throw new ManifestError("MANIFEST_OPERATION", "operation must be 'create_work_item'.");
  }

  if (!isPlainObject(value.work_item)) {
    throw new ManifestError("MANIFEST_WORK_ITEM", "work_item must be an object.");
  }
  const workItem = value.work_item;
  assertExactKeys(
    workItem,
    ["id", "prefix", "title", "initial_status", "created_on", "sections"],
    "work_item"
  );

  if (workItem.id !== "auto") {
    throw new ManifestError("MANIFEST_ID", "New work items must use id 'auto'.");
  }
  if (typeof workItem.prefix !== "string" || !isWorkItemPrefix(workItem.prefix)) {
    throw new ManifestError("MANIFEST_PREFIX", "prefix must be AB, AN or IM.");
  }
  if (
    typeof workItem.title !== "string" ||
    workItem.title !== workItem.title.trim() ||
    !/^[A-Z0-9][^\r\n]+$/.test(workItem.title)
  ) {
    throw new ManifestError(
      "MANIFEST_TITLE",
      "title must be a non-empty, trimmed, single-line Title Case value."
    );
  }
  if (typeof workItem.initial_status !== "string" || !CREATION_STATUSES.has(workItem.initial_status)) {
    throw new ManifestError(
      "MANIFEST_STATUS",
      "initial_status must be inbox, backlog, parking_lot or ready."
    );
  }
  if (typeof workItem.created_on !== "string" || !isValidIsoDate(workItem.created_on)) {
    throw new ManifestError("MANIFEST_DATE", "created_on must be a valid YYYY-MM-DD date.");
  }

  if (!isPlainObject(workItem.sections)) {
    throw new ManifestError("MANIFEST_SECTIONS", "sections must be an object.");
  }
  assertExactKeys(workItem.sections, SECTION_KEYS, "work_item.sections");

  const sections = {} as Record<SectionKey, string[]>;
  for (const key of SECTION_KEYS) {
    const section = workItem.sections[key];
    if (
      !Array.isArray(section) ||
      section.length === 0 ||
      section.some(
        (entry) => typeof entry !== "string" || entry.trim().length === 0 || entry !== entry.trim()
      )
    ) {
      throw new ManifestError(
        "MANIFEST_SECTION_CONTENT",
        `sections.${key} must be a non-empty array of non-empty trimmed strings.`
      );
    }
    sections[key] = section as string[];
  }

  if (!isPlainObject(value.documentation)) {
    throw new ManifestError("MANIFEST_DOCUMENTATION", "documentation must be an object.");
  }
  assertExactKeys(value.documentation, ["changes"], "documentation");
  if (!Array.isArray(value.documentation.changes) || value.documentation.changes.length !== 0) {
    throw new ManifestError(
      "DOCUMENTATION_CHANGES_NOT_SUPPORTED",
      "Work-item creation does not support documentation index changes."
    );
  }

  if (!isPlainObject(value.git)) {
    throw new ManifestError("MANIFEST_GIT", "git must be an object.");
  }
  assertExactKeys(value.git, ["commit_message", "commit", "push"], "git");
  if (typeof value.git.commit_message !== "string" || value.git.commit_message.trim().length === 0) {
    throw new ManifestError("MANIFEST_COMMIT_MESSAGE", "git.commit_message must be non-empty.");
  }
  if (value.git.commit !== false || value.git.push !== false) {
    throw new ManifestError(
      "GIT_AUTOMATION_NOT_SUPPORTED",
      "git.commit and git.push must both be false."
    );
  }

  return {
    schema_version: 1,
    operation: "create_work_item",
    work_item: {
      id: "auto",
      prefix: workItem.prefix,
      title: workItem.title,
      initial_status: workItem.initial_status,
      created_on: workItem.created_on,
      sections
    },
    documentation: { changes: [] },
    git: {
      commit_message: value.git.commit_message,
      commit: false,
      push: false
    }
  };
}

function renderParagraphs(values: string[]): string {
  return values.join("\n\n");
}

function renderList(values: string[]): string {
  return values.map((value) => `- ${value}`).join("\n");
}

function renderWorkItem(manifest: CreateWorkItemManifest, identifier: string): string {
  const { title, initial_status: status, created_on: createdOn, sections } = manifest.work_item;
  const metadata = JSON.stringify(
    {
      schema_version: 1,
      id: identifier,
      prefix: manifest.work_item.prefix,
      title,
      status,
      created_on: createdOn,
      completed_on: null
    },
    null,
    2
  );

  return `# ${identifier} - ${title}

${METADATA_START}
${metadata}
${METADATA_END}

## Background

${renderParagraphs(sections.background)}

## Goal

${renderParagraphs(sections.goal)}

## Scope

${renderList(sections.scope)}

## Requirements

${renderList(sections.requirements)}

## Verification

${renderList(sections.verification)}

## Acceptance Criteria

${renderList(sections.acceptance_criteria)}

## Out of Scope

${renderList(sections.out_of_scope)}

## Deliverables

${renderList(sections.deliverables)}
`;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function readManifestInput(arguments_: string[]): Promise<CreateInput> {
  let dryRun = process.env.npm_config_dry_run?.toLowerCase() === "true";
  let detail: CreateDetail = "compact";
  let detailSeen = false;
  const positional: string[] = [];

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (argument === "--detail") {
      if (detailSeen) {
        throw new ManifestError("UNKNOWN_OPTION", "--detail may be specified only once.");
      }
      const value = arguments_[index + 1];
      if (value !== "full") {
        throw new ManifestError("UNKNOWN_OPTION", "--detail supports only 'full'.");
      }
      detail = "full";
      detailSeen = true;
      index += 1;
      continue;
    }
    if (argument.startsWith("--")) {
      throw new ManifestError("UNKNOWN_OPTION", `Unknown option: ${argument}.`);
    }
    positional.push(argument);
  }

  if (positional.length > 1) {
    throw new ManifestError(
      "INVALID_ARGUMENTS",
      "Provide at most one manifest file path; otherwise pipe JSON through stdin."
    );
  }

  const json = positional.length === 1 ? await readFile(positional[0], "utf8") : await readStdin();
  if (json.trim().length === 0) {
    throw new ManifestError("EMPTY_MANIFEST", "No JSON manifest was provided.");
  }

  return {
    json,
    dryRun,
    detail,
    ...(positional[0] === undefined ? {} : { manifestPath: positional[0] })
  };
}

function quoteCommandArgument(value: string): string {
  return /^[A-Za-z0-9_./\\:-]+$/.test(value) ? value : `'${value.replaceAll("'", "''")}'`;
}

function recommendedNextCommands(input: CreateInput): string[] {
  if (input.dryRun && input.manifestPath !== undefined) {
    const manifestPath = quoteCommandArgument(input.manifestPath);
    return [
      `npm run project -- create ${manifestPath}`,
      `npm run project -- create ${manifestPath} --dry-run --detail full`
    ];
  }
  return ["npm run project -- queue", "npm run project -- validate"];
}

function renderValidationSummary(summary: ValidationSummary): string {
  return `${summary.errors} error(s), ${summary.warnings} warning(s), ${summary.legacy_observations} legacy observation(s)`;
}

function renderCompactCreateOutput(
  input: CreateInput,
  manifest: CreateWorkItemManifest,
  preflight: Awaited<ReturnType<typeof prepareCreatePreflight>>,
  validation: ValidationSummary
): void {
  const lines = [
    input.dryRun ? "Work Item Creation Preview" : "Work Item Created",
    "",
    `ID: ${preflight.identifier}`,
    `Title: ${manifest.work_item.title}`,
    `File: ${preflight.filePath}`,
    `Queue section: ${preflight.output.queue_section}`,
    "Preflight: passed",
    `Validation: ${renderValidationSummary(validation)}`,
    ...(input.dryRun ? ["Writes: none (dry-run)"] : []),
    "",
    "Recommended next commands:",
    ...recommendedNextCommands(input).map((command) => `  ${command}`)
  ];
  console.log(lines.join("\n"));
}

function renderFullCreateOutput(
  input: CreateInput,
  manifest: CreateWorkItemManifest,
  preflight: Awaited<ReturnType<typeof prepareCreatePreflight>>,
  validation: ValidationSummary,
  created: boolean
): void {
  console.log(
    JSON.stringify(
      {
        ...preflight.output,
        title: manifest.work_item.title,
        dry_run: input.dryRun,
        created,
        validation,
        next_commands: recommendedNextCommands(input)
      },
      null,
      2
    )
  );
}

async function prepareCreatePreflight(manifest: CreateWorkItemManifest) {
  const beforeValidation = await requireValidAdministrationState(
    (summary) =>
      new ManifestError(
        "REPOSITORY_VALIDATION_FAILED",
        `Repository has ${summary.errorCount} blocking administration error(s).`
      )
  );

  const initialState = await scanIdentifierState();
  const allocation = allocateIdentifier(manifest.work_item.prefix, initialState);
  const identifier = allocation.allocatedId;
  const filePath = `${WORK_ITEMS_DIRECTORY}/${identifier}.md`;
  const queueSection = STATUS_TO_QUEUE_SECTION[manifest.work_item.initial_status];
  const originalQueue = await readFile(WORK_QUEUE_PATH, "utf8");
  const queueUpdate = insertQueueEntry(
    originalQueue,
    queueSection,
    identifier,
    manifest.work_item.title
  );
  const workItemContent = renderWorkItem(manifest, identifier);

  return {
    identifier,
    filePath,
    originalQueue,
    queueUpdate,
    workItemContent,
    output: {
      operation: "create_work_item",
      allocated_id: identifier,
      file: filePath,
      queue_section: queueSection,
      queue_entry: queueUpdate.entry,
      work_item_content: workItemContent,
      preflight: {
        passed: true,
        validation: {
          errors: beforeValidation.errorCount,
          warnings: beforeValidation.warningCount,
          legacy_observations: beforeValidation.legacyCount
        }
      }
    }
  };
}

async function createWorkItem(arguments_: string[]): Promise<void> {
  const input = await readManifestInput(arguments_);
  const manifest = validateManifest(parseStrictJson(input.json));
  const preflight = await prepareCreatePreflight(manifest);

  if (input.dryRun) {
    const validation = preflight.output.preflight.validation;
    if (input.detail === "full") {
      renderFullCreateOutput(input, manifest, preflight, validation, false);
    } else {
      renderCompactCreateOutput(input, manifest, preflight, validation);
    }
    return;
  }

  const afterValidation = await withRepositoryMutationLock("create_work_item", async () => {
    const finalState = await scanIdentifierState();
    const finalAllocation = allocateIdentifier(manifest.work_item.prefix, finalState);
    if (finalAllocation.allocatedId !== preflight.identifier) {
      throw new ManifestError(
        "ALLOCATION_CHANGED",
        `Identifier allocation changed from '${preflight.identifier}' to '${finalAllocation.allocatedId}'. Retry.`
      );
    }

    let validation!: Awaited<ReturnType<typeof requireValidAdministrationState>>;
    await executeCoordinatedTransaction({
      steps: [
        {
          rollbackFailureLabel: "file rollback failed",
          apply: async (markForRollback) => {
            const file = await open(preflight.filePath, "wx");
            markForRollback();
            try {
              await file.writeFile(preflight.workItemContent, "utf8");
            } finally {
              await file.close();
            }
          },
          rollback: async () => unlink(preflight.filePath)
        },
        {
          rollbackFailureLabel: "queue rollback failed",
          apply: async (markForRollback) => {
            markForRollback();
            await writeFile(WORK_QUEUE_PATH, preflight.queueUpdate.content, "utf8");
          },
          rollback: async () => writeFile(WORK_QUEUE_PATH, preflight.originalQueue, "utf8")
        }
      ],
      afterApply: async () => {
        validation = await requireValidAdministrationState(
          (summary) =>
            new ManifestError(
              "POST_CREATE_VALIDATION_FAILED",
              `Created state has ${summary.errorCount} blocking administration error(s).`
            )
        );
      },
      createRollbackError: (message) => new ManifestError("ROLLBACK_FAILED", message)
    });
    return validation;
  });

  const validation = {
    errors: afterValidation.errorCount,
    warnings: afterValidation.warningCount,
    legacy_observations: afterValidation.legacyCount
  };
  if (input.detail === "full") {
    renderFullCreateOutput(input, manifest, preflight, validation, true);
  } else {
    renderCompactCreateOutput(input, manifest, preflight, validation);
  }
}

export async function runCreateWorkItemCommand(arguments_: string[]): Promise<number> {
  try {
    await createWorkItem(arguments_);
    return 0;
  } catch (error) {
    if (
      error instanceof ManifestError ||
      error instanceof IdentifierAllocationError ||
      error instanceof RepositoryMutationLockError
    ) {
      printError(error.code, error.message, "details" in error ? error.details : undefined);
    } else {
      const message = error instanceof Error ? error.message : String(error);
      printError("CREATE_WORK_ITEM_FAILED", message);
    }
    return 1;
  }
}

async function main(): Promise<void> {
  process.exitCode = await runCreateWorkItemCommand(process.argv.slice(2));
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectExecution) {
  main().catch((error: unknown) => {
    printError("CREATE_WORK_ITEM_FAILED", error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
