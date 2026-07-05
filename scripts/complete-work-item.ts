import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  WORK_ITEMS_DIRECTORY,
  WORK_QUEUE_PATH,
  isWorkItemIdentifier
} from "./project-administration/identifiers";
import { QueueMutationError, moveQueueEntry } from "./project-administration/queue";
import {
  WorkItemMetadataError,
  completeWorkItemMetadata,
  parseWorkItemMetadata
} from "./project-administration/work-item-metadata";
import { ARMBASE_PROJECT_ADMINISTRATION_CONFIG } from "./project-administration/configuration";
import {
  executeCoordinatedTransaction,
  requireUnchangedFiles,
  requireValidAdministrationState
} from "./project-administration/transaction-service";
import {
  RepositoryMutationLockError,
  withRepositoryMutationLock
} from "./project-administration/mutation-lock";

const PROJECT_TIMEZONE = ARMBASE_PROJECT_ADMINISTRATION_CONFIG.projectTimezone;
const PROJECT_KNOWLEDGE_FILES = ARMBASE_PROJECT_ADMINISTRATION_CONFIG.projectKnowledgeFiles;

class CompletionError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "CompletionError";
  }
}

function printError(code: string, message: string): void {
  console.error(JSON.stringify({ error: { code, message } }, null, 2));
}

function parseArguments(arguments_: string[]): { identifier: string; approved: boolean; dryRun: boolean } {
  const approved =
    arguments_.includes("--approved") || process.env.npm_config_approved?.toLowerCase() === "true";
  const dryRun =
    arguments_.includes("--dry-run") || process.env.npm_config_dry_run?.toLowerCase() === "true";
  const supportedOptions = new Set(["--approved", "--dry-run"]);
  const unknown = arguments_.filter(
    (argument) => argument.startsWith("--") && !supportedOptions.has(argument)
  );
  const positional = arguments_.filter((argument) => !argument.startsWith("--"));

  if (unknown.length > 0) {
    throw new CompletionError("UNKNOWN_OPTION", `Unknown option(s): ${unknown.join(", ")}.`);
  }
  if (positional.length !== 1 || !isWorkItemIdentifier(positional[0])) {
    throw new CompletionError(
      "INVALID_ARGUMENTS",
      "Usage: complete PREFIX-<3-5 digits> --approved [--dry-run]."
    );
  }
  if (!approved) {
    throw new CompletionError(
      "APPROVAL_REQUIRED",
      "Completion requires explicit --approved confirmation."
    );
  }

  return { identifier: positional[0], approved, dryRun };
}

function getProjectDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PROJECT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function detectChangedProjectKnowledgeFiles(): string[] {
  const result = spawnSync("git", ["status", "--porcelain", "--", ...PROJECT_KNOWLEDGE_FILES], {
    encoding: "utf8",
    windowsHide: true
  });

  if (result.status !== 0 || typeof result.stdout !== "string") {
    return [];
  }

  const changed = new Set<string>();
  for (const line of result.stdout.split(/\r?\n/)) {
    if (line.length < 4) {
      continue;
    }
    const reportedPath = line.slice(3).split(" -> ").at(-1)?.replaceAll("\\", "/");
    if (reportedPath !== undefined && PROJECT_KNOWLEDGE_FILES.includes(reportedPath)) {
      changed.add(reportedPath);
    }
  }

  return [...changed].sort((left, right) => left.localeCompare(right));
}

export async function runCompleteCommand(arguments_: string[]): Promise<number> {
  try {
    const command = parseArguments(arguments_);
    const filePath = `${WORK_ITEMS_DIRECTORY}/${command.identifier}.md`;
    const originalWorkItem = await readFile(filePath, "utf8");
    const parsed = parseWorkItemMetadata(originalWorkItem, command.identifier);

    if (parsed.metadata.status !== "needs_review") {
      throw new CompletionError(
        "INVALID_COMPLETION_STATUS",
        `Completion requires status 'needs_review', current status is '${parsed.metadata.status}'.`
      );
    }

    await requireValidAdministrationState(
      (summary) =>
        new CompletionError(
          "REPOSITORY_VALIDATION_FAILED",
          `Repository has ${summary.errorCount} blocking administration error(s).`
        )
    );

    const completedOn = getProjectDate();
    const originalQueue = await readFile(WORK_QUEUE_PATH, "utf8");
    const queueUpdate = moveQueueEntry(
      originalQueue,
      command.identifier,
      parsed.metadata.title,
      "Needs Review",
      "Done",
      completedOn
    );
    const updatedWorkItem = completeWorkItemMetadata(
      originalWorkItem,
      parsed,
      completedOn
    );
    const projectKnowledgeFiles = detectChangedProjectKnowledgeFiles();
    const changedFiles = [filePath, WORK_QUEUE_PATH];
    const baseOutput = {
      operation: "complete_work_item",
      id: command.identifier,
      approved: command.approved,
      from: "needs_review",
      to: "done",
      completed_on: completedOn,
      changed_files: changedFiles,
      changed_project_knowledge_files: projectKnowledgeFiles,
      chatgpt_project_upload_reminders: projectKnowledgeFiles.map(
        (file) => `Upload the finalized '${file}' to the ChatGPT Project.`
      )
    };

    if (command.dryRun) {
      console.log(JSON.stringify({ ...baseOutput, dry_run: true, applied: false }, null, 2));
      return 0;
    }

    const afterValidation = await withRepositoryMutationLock("complete_work_item", async () => {
      await requireUnchangedFiles(
        [
          { path: filePath, content: originalWorkItem },
          { path: WORK_QUEUE_PATH, content: originalQueue }
        ],
        () =>
          new CompletionError("STALE_REPOSITORY", "Work item or queue changed during completion.")
      );

      let validation!: Awaited<ReturnType<typeof requireValidAdministrationState>>;
      await executeCoordinatedTransaction({
        steps: [
          {
            rollbackFailureLabel: "work-item rollback failed",
            apply: async (markForRollback) => {
              markForRollback();
              await writeFile(filePath, updatedWorkItem, "utf8");
            },
            rollback: async () => writeFile(filePath, originalWorkItem, "utf8")
          },
          {
            rollbackFailureLabel: "queue rollback failed",
            apply: async (markForRollback) => {
              markForRollback();
              await writeFile(WORK_QUEUE_PATH, queueUpdate.content, "utf8");
            },
            rollback: async () => writeFile(WORK_QUEUE_PATH, originalQueue, "utf8")
          }
        ],
        afterApply: async () => {
          validation = await requireValidAdministrationState(
            (summary) =>
              new CompletionError(
                "POST_COMPLETION_VALIDATION_FAILED",
                `Completed state has ${summary.errorCount} blocking administration error(s).`
              )
          );
        },
        createRollbackError: (message) => new CompletionError("ROLLBACK_FAILED", message)
      });
      return validation;
    });

    console.log(
      JSON.stringify(
        {
          ...baseOutput,
          dry_run: false,
          applied: true,
          validation: {
            errors: afterValidation.errorCount,
            warnings: afterValidation.warningCount,
            legacy_observations: afterValidation.legacyCount
          }
        },
        null,
        2
      )
    );
    return 0;
  } catch (error) {
    if (
      error instanceof CompletionError ||
      error instanceof WorkItemMetadataError ||
      error instanceof QueueMutationError ||
      error instanceof RepositoryMutationLockError
    ) {
      printError(error.code, error.message);
    } else {
      printError("COMPLETION_FAILED", error instanceof Error ? error.message : String(error));
    }
    return 1;
  }
}

async function main(): Promise<void> {
  process.exitCode = await runCompleteCommand(process.argv.slice(2));
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectExecution) {
  main().catch((error: unknown) => {
    printError("COMPLETION_FAILED", error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
