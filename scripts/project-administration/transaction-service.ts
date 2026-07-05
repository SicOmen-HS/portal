import { readFile } from "node:fs/promises";
import {
  validateProjectAdministration,
  type ProjectAdministrationValidationSummary
} from "../validate-project-administration";

export interface TransactionStep {
  rollbackFailureLabel: string;
  apply: (markForRollback: () => void) => Promise<void>;
  rollback: () => Promise<void>;
}

interface CoordinatedTransactionOptions {
  steps: readonly TransactionStep[];
  afterApply: () => Promise<void>;
  createRollbackError: (message: string) => Error;
}

export async function requireValidAdministrationState(
  createError: (summary: ProjectAdministrationValidationSummary) => Error
): Promise<ProjectAdministrationValidationSummary> {
  const summary = await validateProjectAdministration(false);
  if (summary.errorCount > 0) {
    throw createError(summary);
  }
  return summary;
}

export async function requireUnchangedFiles(
  snapshots: readonly { path: string; content: string }[],
  createError: () => Error
): Promise<void> {
  const current = await Promise.all(snapshots.map((snapshot) => readFile(snapshot.path, "utf8")));
  if (current.some((content, index) => content !== snapshots[index].content)) {
    throw createError();
  }
}

export async function executeCoordinatedTransaction(
  options: CoordinatedTransactionOptions
): Promise<void> {
  const rollbackSteps: TransactionStep[] = [];
  try {
    for (const step of options.steps) {
      let marked = false;
      await step.apply(() => {
        if (!marked) {
          rollbackSteps.push(step);
          marked = true;
        }
      });
    }
    await options.afterApply();
  } catch (error) {
    const rollbackErrors: string[] = [];
    for (const step of [...rollbackSteps].reverse()) {
      try {
        await step.rollback();
      } catch (rollbackError) {
        rollbackErrors.push(`${step.rollbackFailureLabel}: ${String(rollbackError)}`);
      }
    }

    if (rollbackErrors.length > 0) {
      const originalMessage = error instanceof Error ? error.message : String(error);
      throw options.createRollbackError(`${originalMessage}; ${rollbackErrors.join("; ")}`);
    }
    throw error;
  }
}
