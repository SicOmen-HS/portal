import { isKnownDispositionStatus } from "./topic-convention";
import { scanWorkItems } from "./topic-discovery";
import {
  createWorksmithError,
  createWorksmithSuccess,
  type WorksmithResult
} from "./worksmith-result";
import { renderWorksmithJsonResult } from "./worksmith-output";

/**
 * Read-only report identifying metadata-enabled AN items where a
 * disposition is expected but missing or does not match a known status.
 * Only `in_progress` and `needs_review` AN items are in scope, since those
 * are the current, reviewable decision points AN-019 was concerned about.
 * Completed, backlog and legacy AN items are intentionally excluded; this
 * report never mutates or completes anything.
 */

const RELEVANT_STATUSES = new Set(["in_progress", "needs_review"]);

export interface DispositionGap {
  id: string;
  title: string;
  status: string;
  file: string;
  reason: "missing" | "malformed";
  disposition: string | null;
}

export interface DispositionReportPayload {
  scanned_count: number;
  gaps: DispositionGap[];
}

export class DispositionReportError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "DispositionReportError";
  }
}

export async function buildDispositionReport(): Promise<DispositionReportPayload> {
  const items = await scanWorkItems();
  const relevant = items.filter(
    (item) =>
      !item.legacy &&
      item.metadata !== null &&
      item.metadata.prefix === "AN" &&
      RELEVANT_STATUSES.has(item.metadata.status)
  );

  const gaps: DispositionGap[] = [];
  for (const item of relevant) {
    if (item.metadata === null) {
      continue;
    }
    const disposition = item.convention.disposition;
    if (disposition === null) {
      gaps.push({
        id: item.id,
        title: item.metadata.title,
        status: item.metadata.status,
        file: item.file,
        reason: "missing",
        disposition: null
      });
    } else if (!isKnownDispositionStatus(disposition)) {
      gaps.push({
        id: item.id,
        title: item.metadata.title,
        status: item.metadata.status,
        file: item.file,
        reason: "malformed",
        disposition
      });
    }
  }

  return {
    scanned_count: relevant.length,
    gaps: gaps.sort((left, right) => left.id.localeCompare(right.id))
  };
}

type ReportOutputTarget = "terminal" | "json";

function parseDispositionReportArguments(arguments_: string[]): { output: ReportOutputTarget } {
  let output: ReportOutputTarget = "terminal";
  let outputSeen = false;

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--output") {
      if (outputSeen) {
        throw new DispositionReportError("INVALID_ARGUMENTS", "--output may be specified only once.");
      }
      const value = arguments_[index + 1];
      if (value !== "terminal" && value !== "json") {
        throw new DispositionReportError(
          "INVALID_ARGUMENTS",
          `Unsupported output '${value ?? ""}'. Expected terminal or json.`
        );
      }
      output = value;
      outputSeen = true;
      index += 1;
      continue;
    }
    throw new DispositionReportError(
      "INVALID_ARGUMENTS",
      `disposition-report does not accept argument '${argument}'.`
    );
  }

  return { output };
}

function renderDispositionReportTerminal(payload: DispositionReportPayload): void {
  const lines = [
    `AN disposition report (${payload.scanned_count} in_progress/needs_review AN item(s) scanned)`
  ];

  if (payload.gaps.length === 0) {
    lines.push("", "No disposition gaps found.");
  } else {
    lines.push("");
    for (const gap of payload.gaps) {
      const reasonText =
        gap.reason === "missing" ? "missing disposition" : `malformed disposition '${gap.disposition}'`;
      lines.push(`- ${gap.id} - ${gap.title} (${gap.status}): ${reasonText}`);
    }
  }

  console.log(lines.join("\n"));
}

function printDispositionReportError(code: string, message: string): void {
  console.error(JSON.stringify({ error: { code, message } }, null, 2));
}

export async function runDispositionReportCommand(arguments_: string[]): Promise<number> {
  let options: { output: ReportOutputTarget };
  try {
    options = parseDispositionReportArguments(arguments_);
  } catch (error) {
    printDispositionReportError(
      error instanceof DispositionReportError ? error.code : "INVALID_ARGUMENTS",
      error instanceof Error ? error.message : String(error)
    );
    return 1;
  }

  let result: WorksmithResult<DispositionReportPayload | Record<string, never>>;
  try {
    result = createWorksmithSuccess("disposition_report", await buildDispositionReport());
  } catch (error) {
    const code = error instanceof DispositionReportError ? error.code : "DISPOSITION_REPORT_FAILED";
    const message = error instanceof Error ? error.message : String(error);
    result = createWorksmithError("disposition_report", code, message);
  }

  if (options.output === "json") {
    return renderWorksmithJsonResult(result);
  }

  if (result.status === "error") {
    printDispositionReportError(result.diagnostics[0].code, result.diagnostics[0].message);
    return result.exit_code;
  }

  renderDispositionReportTerminal(result.payload as DispositionReportPayload);
  return result.exit_code;
}
