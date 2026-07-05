import { open, lstat, mkdir } from "node:fs/promises";
import path from "node:path";
import { ARMBASE_PROJECT_ADMINISTRATION_CONFIG, type ProjectAdministrationConfig } from "./configuration";
import { RepositoryMutationLockError, withRepositoryMutationLock } from "./mutation-lock";

export class ProjectInitializationError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "ProjectInitializationError";
  }
}

interface InitializationPlan {
  root: string;
  workItemsDirectory: string;
  workQueue: string;
  queueContent: string;
  createWorkItemsDirectory: boolean;
}

function toPortablePath(value: string): string {
  return value.split(path.sep).join("/");
}

function assertSafeRelativePath(value: string, label: string): void {
  const normalized = path.normalize(value);
  if (
    value.trim().length === 0 ||
    path.isAbsolute(value) ||
    normalized === ".." ||
    normalized.startsWith(`..${path.sep}`)
  ) {
    throw new ProjectInitializationError(
      "INIT_UNSAFE_PATH",
      `${label} must be a non-empty path inside the target project.`
    );
  }
}

async function pathKind(target: string): Promise<"directory" | "file" | null> {
  try {
    const stats = await lstat(target);
    return stats.isDirectory() ? "directory" : "file";
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

function renderQueue(config: ProjectAdministrationConfig): string {
  const sections = [...new Set(Object.values(config.statusToQueueSection))];
  return `# Work Queue\n\n${sections.map((section) => `## ${section}`).join("\n\n")}\n`;
}

async function createInitializationPlan(
  targetRoot: string,
  config: ProjectAdministrationConfig
): Promise<InitializationPlan> {
  assertSafeRelativePath(config.paths.workItemsDirectory, "workItemsDirectory");
  assertSafeRelativePath(config.paths.workQueue, "workQueue");

  const root = path.resolve(targetRoot);
  const workItemsDirectory = path.resolve(root, config.paths.workItemsDirectory);
  const workQueue = path.resolve(root, config.paths.workQueue);
  const workItemsKind = await pathKind(workItemsDirectory);
  const queueKind = await pathKind(workQueue);

  if (workItemsKind === "file") {
    throw new ProjectInitializationError(
      "INIT_PATH_CONFLICT",
      `'${toPortablePath(config.paths.workItemsDirectory)}' exists and is not a directory.`
    );
  }
  if (queueKind !== null) {
    throw new ProjectInitializationError(
      "INIT_REFUSES_OVERWRITE",
      `'${toPortablePath(config.paths.workQueue)}' already exists; initialization never overwrites it.`
    );
  }

  return {
    root,
    workItemsDirectory,
    workQueue,
    queueContent: renderQueue(config),
    createWorkItemsDirectory: workItemsKind === null
  };
}

export async function initializeProject(
  targetRoot: string,
  dryRun: boolean,
  config: ProjectAdministrationConfig = ARMBASE_PROJECT_ADMINISTRATION_CONFIG
): Promise<Record<string, unknown>> {
  const plan = await createInitializationPlan(targetRoot, config);
  const plannedChanges = [
    ...(plan.createWorkItemsDirectory ? [config.paths.workItemsDirectory] : []),
    config.paths.workQueue
  ];

  if (!dryRun) {
    await withRepositoryMutationLock(
      "initialize_project_administration",
      async () => {
        await mkdir(plan.workItemsDirectory, { recursive: true });
        await mkdir(path.dirname(plan.workQueue), { recursive: true });
        const queueFile = await open(plan.workQueue, "wx");
        try {
          await queueFile.writeFile(plan.queueContent, "utf8");
        } finally {
          await queueFile.close();
        }
      },
      plan.root
    );
  }

  return {
    operation: "initialize_project_administration",
    root: plan.root,
    configuration: config.applicationName,
    planned_changes: plannedChanges,
    dry_run: dryRun,
    applied: !dryRun
  };
}

function parseArguments(arguments_: string[]): { targetRoot: string; dryRun: boolean } {
  const dryRun =
    arguments_.includes("--dry-run") || process.env.npm_config_dry_run?.toLowerCase() === "true";
  const unknownOptions = arguments_.filter(
    (argument) => argument.startsWith("--") && argument !== "--dry-run"
  );
  const positional = arguments_.filter((argument) => !argument.startsWith("--"));

  if (unknownOptions.length > 0) {
    throw new ProjectInitializationError(
      "UNKNOWN_OPTION",
      `Unknown option(s): ${unknownOptions.join(", ")}.`
    );
  }
  if (positional.length > 1) {
    throw new ProjectInitializationError(
      "INVALID_ARGUMENTS",
      "Usage: init [target-directory] [--dry-run]."
    );
  }

  return { targetRoot: positional[0] ?? ".", dryRun };
}

export async function runInitializeCommand(arguments_: string[]): Promise<number> {
  try {
    const { targetRoot, dryRun } = parseArguments(arguments_);
    console.log(JSON.stringify(await initializeProject(targetRoot, dryRun), null, 2));
    return 0;
  } catch (error) {
    const code =
      error instanceof ProjectInitializationError || error instanceof RepositoryMutationLockError
        ? error.code
        : "INITIALIZATION_FAILED";
    const message = error instanceof Error ? error.message : String(error);
    console.error(JSON.stringify({ error: { code, message } }, null, 2));
    return 1;
  }
}
