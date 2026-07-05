import type {
  WorksmithCommandReference,
  WorksmithResult
} from "./worksmith-result";
import { getWorksmithMessage, type WorksmithLanguage } from "./localization";

export type WorksmithOutputTarget = "terminal" | "json" | "handoff";
export type WorksmithShell = "powershell" | "bash";

export interface WorksmithOutputOptions {
  target: WorksmithOutputTarget;
  shell: WorksmithShell;
}

export interface WorksmithHandoffContent {
  title: string;
  summary: readonly string[];
  completedActions: readonly string[];
  details?: readonly string[];
  nextActionDescriptions?: Readonly<Record<string, string>>;
}

export class WorksmithOutputArgumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorksmithOutputArgumentError";
  }
}

function readOptionValue(arguments_: readonly string[], index: number, option: string): string {
  const value = arguments_[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new WorksmithOutputArgumentError(`${option} requires a value.`);
  }
  return value;
}

export function parseWorksmithOutputOptions(
  arguments_: readonly string[],
  defaults: WorksmithOutputOptions = { target: "terminal", shell: "powershell" }
): WorksmithOutputOptions {
  let target = defaults.target;
  let shell = defaults.shell;
  let outputSeen = false;
  let shellSeen = false;

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--output") {
      if (outputSeen) {
        throw new WorksmithOutputArgumentError("--output may be specified only once.");
      }
      const value = readOptionValue(arguments_, index, "--output");
      if (value !== "terminal" && value !== "json" && value !== "handoff") {
        throw new WorksmithOutputArgumentError(
          `Unsupported output '${value}'. Expected terminal, json or handoff.`
        );
      }
      target = value;
      outputSeen = true;
      index += 1;
      continue;
    }

    if (argument === "--shell") {
      if (shellSeen) {
        throw new WorksmithOutputArgumentError("--shell may be specified only once.");
      }
      const value = readOptionValue(arguments_, index, "--shell");
      if (value !== "powershell" && value !== "bash") {
        throw new WorksmithOutputArgumentError(
          `Unsupported shell '${value}'. Expected powershell or bash.`
        );
      }
      shell = value;
      shellSeen = true;
      index += 1;
      continue;
    }

    throw new WorksmithOutputArgumentError(`queue does not accept argument '${argument}'.`);
  }

  if (shellSeen && target !== "handoff") {
    throw new WorksmithOutputArgumentError("--shell is supported only with --output handoff.");
  }

  return { target, shell };
}

export function renderWorksmithJsonResult<TPayload extends object>(
  result: WorksmithResult<TPayload>
): number {
  console.log(JSON.stringify(result, null, 2));
  return result.exit_code;
}

function quotePowerShellArgument(argument: string): string {
  if (/^[A-Za-z0-9_./:@=+-]+$/.test(argument)) {
    return argument;
  }
  return `'${argument.replaceAll("'", "''")}'`;
}

function quoteBashArgument(argument: string): string {
  if (/^[A-Za-z0-9_./:@=+-]+$/.test(argument)) {
    return argument;
  }
  return `'${argument.replaceAll("'", `'"'"'`)}'`;
}

export function renderWorksmithShellCommand(
  command: WorksmithCommandReference,
  shell: WorksmithShell
): string {
  const quote = shell === "powershell" ? quotePowerShellArgument : quoteBashArgument;
  return [command.executable, ...command.arguments].map(quote).join(" ");
}

export function renderWorksmithHandoffResult<TPayload extends object>(
  result: WorksmithResult<TPayload>,
  content: WorksmithHandoffContent,
  shell: WorksmithShell,
  language: WorksmithLanguage = "en"
): number {
  const message = (id: Parameters<typeof getWorksmithMessage>[1]): string =>
    getWorksmithMessage(language, id);
  const lines = [
    `# ${content.title}`,
    "",
    `## ${message("handoff.result")}`,
    "",
    `- ${message("handoff.command")}: \`${result.command}\``,
    `- ${message("handoff.status")}: \`${result.status}\``,
    `- ${message("handoff.exit_code")}: ${result.exit_code}`,
    ...content.summary.map((line) => `- ${line}`),
    "",
    `## ${message("handoff.completed_actions")}`,
    "",
    ...(content.completedActions.length === 0
      ? [message("handoff.none")]
      : content.completedActions.map((action) => `- ${action}`)),
    "",
    `## ${message("handoff.changed_files")}`,
    "",
    ...(result.changed_files.length === 0
      ? [message("handoff.none")]
      : result.changed_files.map((file) => `- \`${file.path}\` (${file.operation})`))
  ];

  if (content.details !== undefined && content.details.length > 0) {
    lines.push("", ...content.details);
  }

  lines.push("", `## ${message("handoff.diagnostics")}`, "");
  if (result.diagnostics.length === 0) {
    lines.push(message("handoff.none"));
  } else {
    for (const diagnostic of result.diagnostics) {
      lines.push(`- **${diagnostic.severity}** \`${diagnostic.code}\`: ${diagnostic.message}`);
    }
  }

  lines.push("", `## ${message("handoff.next_actions")}`, "");
  if (result.next_actions.length === 0) {
    lines.push(message("handoff.none"));
  } else {
    for (const action of result.next_actions) {
      lines.push(`- ${content.nextActionDescriptions?.[action.id] ?? action.description}`);
      if (action.command !== undefined) {
        lines.push(
          "",
          `\`\`\`${shell}`,
          renderWorksmithShellCommand(action.command, shell),
          "\`\`\`"
        );
      }
    }
  }

  console.log(lines.join("\n"));
  return result.exit_code;
}
