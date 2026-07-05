import { mkdir, open, unlink, type FileHandle } from "node:fs/promises";
import path from "node:path";

export const MUTATION_LOCK_FILENAME = ".worksmith-mutation.lock";

export class RepositoryMutationLockError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "RepositoryMutationLockError";
  }
}

function lockPath(repositoryRoot: string): string {
  return path.join(path.resolve(repositoryRoot), MUTATION_LOCK_FILENAME);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function removeAcquiredLock(file: FileHandle, filePath: string): Promise<void> {
  const releaseErrors: string[] = [];
  try {
    await file.close();
  } catch (error) {
    releaseErrors.push(`close failed: ${errorMessage(error)}`);
  }
  try {
    await unlink(filePath);
  } catch (error) {
    releaseErrors.push(`remove failed: ${errorMessage(error)}`);
  }
  if (releaseErrors.length > 0) {
    throw new RepositoryMutationLockError(
      "MUTATION_LOCK_RELEASE_FAILED",
      `Could not release repository mutation lock '${MUTATION_LOCK_FILENAME}': ${releaseErrors.join("; ")}`
    );
  }
}

async function acquireRepositoryMutationLock(
  repositoryRoot: string,
  operation: string
): Promise<{ file: FileHandle; filePath: string }> {
  const root = path.resolve(repositoryRoot);
  await mkdir(root, { recursive: true });
  const filePath = lockPath(root);
  let file: FileHandle;
  try {
    file = await open(filePath, "wx");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new RepositoryMutationLockError(
        "MUTATION_LOCK_HELD",
        `Repository mutation lock '${MUTATION_LOCK_FILENAME}' is already held. ` +
          "If no Project Administration mutation is running, remove the orphaned lock manually and retry."
      );
    }
    throw error;
  }

  try {
    await file.writeFile(
      `${JSON.stringify({ lock_version: 1, operation, pid: process.pid }, null, 2)}\n`,
      "utf8"
    );
  } catch (error) {
    try {
      await removeAcquiredLock(file, filePath);
    } catch (releaseError) {
      throw new RepositoryMutationLockError(
        "MUTATION_LOCK_RELEASE_FAILED",
        `${errorMessage(error)}; ${errorMessage(releaseError)}`
      );
    }
    throw error;
  }

  return { file, filePath };
}

export async function withRepositoryMutationLock<TValue>(
  operation: string,
  callback: () => Promise<TValue>,
  repositoryRoot = process.cwd()
): Promise<TValue> {
  const lock = await acquireRepositoryMutationLock(repositoryRoot, operation);
  let operationError: unknown;
  try {
    return await callback();
  } catch (error) {
    operationError = error;
    throw error;
  } finally {
    try {
      await removeAcquiredLock(lock.file, lock.filePath);
    } catch (releaseError) {
      if (operationError !== undefined) {
        throw new RepositoryMutationLockError(
          "MUTATION_LOCK_RELEASE_FAILED",
          `${errorMessage(operationError)}; ${errorMessage(releaseError)}`
        );
      }
      throw releaseError;
    }
  }
}
