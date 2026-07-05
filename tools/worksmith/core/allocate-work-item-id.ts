import {
  IdentifierAllocationError,
  SUPPORTED_PREFIXES,
  WORK_ITEMS_DIRECTORY,
  WORK_QUEUE_PATH,
  allocateIdentifier,
  isWorkItemPrefix,
  scanIdentifierState,
  type WorkItemPrefix
} from "./project-administration/identifiers";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  createWorksmithError,
  createWorksmithSuccess,
  renderArmBaseCompatibilityResult
} from "./project-administration/worksmith-result";

function parseArguments(arguments_: string[]): WorkItemPrefix {
  const positional = arguments_.filter((argument) => argument !== "--dry-run");
  const unknownOptions = arguments_.filter(
    (argument) => argument.startsWith("--") && argument !== "--dry-run"
  );

  if (unknownOptions.length > 0) {
    throw new IdentifierAllocationError(
      "UNKNOWN_OPTION",
      `Unknown option(s): ${unknownOptions.join(", ")}.`
    );
  }

  if (positional.length !== 1) {
    throw new IdentifierAllocationError(
      "INVALID_ARGUMENTS",
      `Provide exactly one prefix: ${SUPPORTED_PREFIXES.join(", ")}. The allocator is always a dry run.`
    );
  }

  const prefix = positional[0];
  if (!isWorkItemPrefix(prefix)) {
    throw new IdentifierAllocationError(
      "INVALID_PREFIX",
      `Unsupported prefix '${prefix}'. Expected AB, AN or IM.`
    );
  }

  return prefix;
}

export async function runAllocateIdCommand(arguments_: string[]): Promise<number> {
  try {
    const prefix = parseArguments(arguments_);
    const state = await scanIdentifierState();
    const allocation = allocateIdentifier(prefix, state);

    return renderArmBaseCompatibilityResult(
      createWorksmithSuccess("allocate_id", {
        prefix,
        allocated_id: allocation.allocatedId,
        highest_existing: allocation.highestExisting,
        source: [WORK_ITEMS_DIRECTORY, WORK_QUEUE_PATH],
        dry_run: true
      })
    );
  } catch (error) {
    if (error instanceof IdentifierAllocationError) {
      return renderArmBaseCompatibilityResult(
        createWorksmithError("allocate_id", error.code, error.message, error.details)
      );
    }
    return renderArmBaseCompatibilityResult(
      createWorksmithError(
        "allocate_id",
        "ALLOCATION_FAILED",
        error instanceof Error ? error.message : String(error)
      )
    );
  }
}

async function main(): Promise<void> {
  process.exitCode = await runAllocateIdCommand(process.argv.slice(2));
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectExecution) {
  main().catch((error: unknown) => {
    renderArmBaseCompatibilityResult(
      createWorksmithError(
        "allocate_id",
        "ALLOCATION_FAILED",
        error instanceof Error ? error.message : String(error)
      )
    );
    process.exitCode = 1;
  });
}
