import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  WORK_ITEMS_DIRECTORY,
  WORK_QUEUE_PATH,
  isWorkItemIdentifier
} from "./project-administration/identifiers";
import {
  QueueMutationError,
  STATUS_TO_QUEUE_SECTION,
  getQueueIdentifiersInSection,
  moveQueueEntry
} from "./project-administration/queue";
import {
  VALID_TRANSITIONS,
  WorkItemMetadataError,
  isWorkItemStatus,
  parseWorkItemMetadata,
  updateWorkItemStatus,
  type WorkItemStatus
} from "./project-administration/work-item-metadata";
import {
  executeCoordinatedTransaction,
  requireUnchangedFiles,
  requireValidAdministrationState
} from "./project-administration/transaction-service";
import {
  RepositoryMutationLockError,
  withRepositoryMutationLock
} from "./project-administration/mutation-lock";
import {
  createWorksmithError,
  createWorksmithSuccess,
  renderArmBaseCompatibilityResult
} from "./project-administration/worksmith-result";

class TransitionError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "TransitionError";
  }
}

function parseArguments(arguments_: string[]): {
  identifier: string;
  expectedStatus: WorkItemStatus;
  targetStatus: WorkItemStatus;
  dryRun: boolean;
} {
  const dryRun =
    arguments_.includes("--dry-run") || process.env.npm_config_dry_run?.toLowerCase() === "true";
  const unknown = arguments_.filter(
    (argument) => argument.startsWith("--") && argument !== "--dry-run"
  );
  const positional = arguments_.filter((argument) => !argument.startsWith("--"));

  if (unknown.length > 0) {
    throw new TransitionError("UNKNOWN_OPTION", `Unknown option(s): ${unknown.join(", ")}.`);
  }
  if (positional.length !== 3) {
    throw new TransitionError(
      "INVALID_ARGUMENTS",
      "Usage: transition PREFIX-<3-5 digits> expected_status target_status [--dry-run]."
    );
  }

  const [identifier, expectedStatus, targetStatus] = positional;
  if (!isWorkItemIdentifier(identifier)) {
    throw new TransitionError(
      "INVALID_IDENTIFIER",
      "Identifier must use a supported prefix and 3-5 canonical digits."
    );
  }
  if (!isWorkItemStatus(expectedStatus) || !isWorkItemStatus(targetStatus)) {
    throw new TransitionError("INVALID_STATUS", "Expected and target statuses must be supported.");
  }

  return { identifier, expectedStatus, targetStatus, dryRun };
}

export async function runTransitionCommand(arguments_: string[]): Promise<number> {
  try {
    const command = parseArguments(arguments_);
    const filePath = `${WORK_ITEMS_DIRECTORY}/${command.identifier}.md`;
    const originalWorkItem = await readFile(filePath, "utf8");
    const parsed = parseWorkItemMetadata(originalWorkItem, command.identifier);

    if (parsed.metadata.status !== command.expectedStatus) {
      throw new TransitionError(
        "STALE_STATUS",
        `Current status is '${parsed.metadata.status}', not '${command.expectedStatus}'.`
      );
    }
    if (command.targetStatus === "done") {
      throw new TransitionError(
        "COMPLETION_NOT_SUPPORTED",
        "Transition to done requires the separate completion transaction."
      );
    }
    if (!VALID_TRANSITIONS[parsed.metadata.status].includes(command.targetStatus)) {
      throw new TransitionError(
        "INVALID_TRANSITION",
        `Transition '${command.expectedStatus}' -> '${command.targetStatus}' is not allowed.`
      );
    }

    await requireValidAdministrationState(
      (summary) =>
        new TransitionError(
          "REPOSITORY_VALIDATION_FAILED",
          `Repository has ${summary.errorCount} blocking administration error(s).`
        )
    );

    const originalQueue = await readFile(WORK_QUEUE_PATH, "utf8");
    const expectedSection = STATUS_TO_QUEUE_SECTION[command.expectedStatus];
    const targetSection = STATUS_TO_QUEUE_SECTION[command.targetStatus];
    if (command.targetStatus === "in_progress") {
      const activeIdentifiers = getQueueIdentifiersInSection(originalQueue, targetSection).filter(
        (identifier) => identifier !== command.identifier
      );
      if (activeIdentifiers.length > 0) {
        throw new TransitionError(
          "IN_PROGRESS_OCCUPIED",
          `Cannot enter in_progress while ${activeIdentifiers.join(", ")} is already active.`
        );
      }
    }
    const queueUpdate = moveQueueEntry(
      originalQueue,
      command.identifier,
      parsed.metadata.title,
      expectedSection,
      targetSection
    );
    const updatedWorkItem = updateWorkItemStatus(
      originalWorkItem,
      parsed,
      command.targetStatus
    );
    const output = {
      operation: "transition_work_item",
      id: command.identifier,
      from: command.expectedStatus,
      to: command.targetStatus,
      queue_from: expectedSection,
      queue_to: targetSection,
      queue_entry: queueUpdate.entry
    };

    if (command.dryRun) {
      return renderArmBaseCompatibilityResult(
        createWorksmithSuccess("transition_work_item", {
          ...output,
          dry_run: true,
          applied: false
        })
      );
    }

    const afterValidation = await withRepositoryMutationLock("transition_work_item", async () => {
      await requireUnchangedFiles(
        [
          { path: filePath, content: originalWorkItem },
          { path: WORK_QUEUE_PATH, content: originalQueue }
        ],
        () =>
          new TransitionError("STALE_REPOSITORY", "Work item or queue changed during transition.")
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
              new TransitionError(
                "POST_TRANSITION_VALIDATION_FAILED",
                `Transitioned state has ${summary.errorCount} blocking administration error(s).`
              )
          );
        },
        createRollbackError: (message) => new TransitionError("ROLLBACK_FAILED", message)
      });
      return validation;
    });

    return renderArmBaseCompatibilityResult(
      createWorksmithSuccess(
        "transition_work_item",
        {
          ...output,
          dry_run: false,
          applied: true,
          validation: {
            errors: afterValidation.errorCount,
            warnings: afterValidation.warningCount,
            legacy_observations: afterValidation.legacyCount
          }
        },
        {
          changedFiles: [
            { path: filePath, operation: "updated" },
            { path: WORK_QUEUE_PATH, operation: "updated" }
          ]
        }
      )
    );
  } catch (error) {
    if (
      error instanceof TransitionError ||
      error instanceof WorkItemMetadataError ||
      error instanceof QueueMutationError ||
      error instanceof RepositoryMutationLockError
    ) {
      return renderArmBaseCompatibilityResult(
        createWorksmithError("transition_work_item", error.code, error.message)
      );
    }
    return renderArmBaseCompatibilityResult(
      createWorksmithError(
        "transition_work_item",
        "TRANSITION_FAILED",
        error instanceof Error ? error.message : String(error)
      )
    );
  }
}

async function main(): Promise<void> {
  process.exitCode = await runTransitionCommand(process.argv.slice(2));
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectExecution) {
  main().catch((error: unknown) => {
    renderArmBaseCompatibilityResult(
      createWorksmithError(
        "transition_work_item",
        "TRANSITION_FAILED",
        error instanceof Error ? error.message : String(error)
      )
    );
    process.exitCode = 1;
  });
}
