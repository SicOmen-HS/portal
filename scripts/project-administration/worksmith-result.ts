export const WORKSMITH_RESULT_VERSION = 1 as const;
export const WORKSMITH_PRODUCER = "worksmith" as const;

export type WorksmithCommandName =
  | "allocate_id"
  | "configuration_show"
  | "disposition_report"
  | "queue_list"
  | "topic_catalog"
  | "transition_work_item"
  | "work_item_handoff"
  | "work_item_show";
export type WorksmithResultStatus = "success" | "error";
export type WorksmithDiagnosticSeverity = "info" | "warning" | "error";
export type WorksmithChangedFileOperation = "created" | "updated" | "deleted";

export interface WorksmithDiagnostic {
  code: string;
  severity: WorksmithDiagnosticSeverity;
  message: string;
  details?: unknown;
}

export interface WorksmithChangedFile {
  path: string;
  operation: WorksmithChangedFileOperation;
}

export interface WorksmithCommandReference {
  executable: string;
  arguments: readonly string[];
}

export interface WorksmithNextAction {
  id: string;
  description: string;
  command?: WorksmithCommandReference;
}

export interface WorksmithResult<TPayload extends object> {
  result_version: typeof WORKSMITH_RESULT_VERSION;
  producer: typeof WORKSMITH_PRODUCER;
  command: WorksmithCommandName;
  status: WorksmithResultStatus;
  exit_code: number;
  diagnostics: readonly WorksmithDiagnostic[];
  changed_files: readonly WorksmithChangedFile[];
  next_actions: readonly WorksmithNextAction[];
  payload: TPayload;
}

interface WorksmithSuccessOptions {
  diagnostics?: readonly WorksmithDiagnostic[];
  changedFiles?: readonly WorksmithChangedFile[];
  nextActions?: readonly WorksmithNextAction[];
}

export function createWorksmithSuccess<TPayload extends object>(
  command: WorksmithCommandName,
  payload: TPayload,
  options: WorksmithSuccessOptions = {}
): WorksmithResult<TPayload> {
  return {
    result_version: WORKSMITH_RESULT_VERSION,
    producer: WORKSMITH_PRODUCER,
    command,
    status: "success",
    exit_code: 0,
    diagnostics: options.diagnostics ?? [],
    changed_files: options.changedFiles ?? [],
    next_actions: options.nextActions ?? [],
    payload
  };
}

export function createWorksmithError(
  command: WorksmithCommandName,
  code: string,
  message: string,
  details?: unknown
): WorksmithResult<Record<string, never>> {
  return {
    result_version: WORKSMITH_RESULT_VERSION,
    producer: WORKSMITH_PRODUCER,
    command,
    status: "error",
    exit_code: 1,
    diagnostics: [
      {
        code,
        severity: "error",
        message,
        ...(details === undefined ? {} : { details })
      }
    ],
    changed_files: [],
    next_actions: [],
    payload: {}
  };
}

export function renderArmBaseCompatibilityResult<TPayload extends object>(
  result: WorksmithResult<TPayload>
): number {
  if (result.status === "success") {
    console.log(JSON.stringify(result.payload, null, 2));
    return result.exit_code;
  }

  const diagnostic = result.diagnostics[0];
  if (diagnostic === undefined) {
    throw new Error("An error Worksmith result requires at least one diagnostic.");
  }
  const output = {
    error: {
      code: diagnostic.code,
      message: diagnostic.message,
      ...(diagnostic.details === undefined ? {} : { details: diagnostic.details })
    }
  };
  console.error(JSON.stringify(output, null, 2));
  return result.exit_code;
}
