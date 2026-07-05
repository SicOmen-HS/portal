#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  DraftCompilationError,
  compileDraftToManifest
} from "./project-administration/draft-compiler";

/**
 * Read-only Markdown draft compiler CLI. Compiles a version 1 draft file to
 * the existing strict create_work_item manifest and prints it as JSON —
 * suitable for piping directly into `npm run project -- create`. Performs
 * no file writes, no identifier allocation and does not acquire the
 * repository mutation lock.
 */

class DraftCommandError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "DraftCommandError";
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

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function readDraftInput(positional: string[]): Promise<string> {
  if (positional.length > 1) {
    throw new DraftCommandError(
      "INVALID_ARGUMENTS",
      "Provide at most one draft file path; otherwise pipe draft text through stdin."
    );
  }

  const content = positional.length === 1 ? await readFile(positional[0], "utf8") : await readStdin();
  if (content.trim().length === 0) {
    throw new DraftCommandError("EMPTY_DRAFT", "No draft content was provided.");
  }
  return content;
}

function parseDraftCompileArguments(arguments_: string[]): string[] {
  const positional: string[] = [];
  for (const argument of arguments_) {
    if (argument.startsWith("--")) {
      throw new DraftCommandError("UNKNOWN_OPTION", `draft compile does not accept option '${argument}'.`);
    }
    positional.push(argument);
  }
  return positional;
}

async function runDraftCompile(arguments_: string[]): Promise<void> {
  const positional = parseDraftCompileArguments(arguments_);
  const draftContent = await readDraftInput(positional);
  const manifest = compileDraftToManifest(draftContent);
  console.log(JSON.stringify(manifest, null, 2));
}

export async function runDraftCommand(arguments_: string[]): Promise<number> {
  const [subcommand, ...rest] = arguments_;

  if (subcommand !== "compile") {
    printError(
      "UNKNOWN_SUBCOMMAND",
      `Unknown 'draft' subcommand '${subcommand ?? ""}'. Expected 'draft compile <file>'.`
    );
    return 1;
  }

  try {
    await runDraftCompile(rest);
    return 0;
  } catch (error) {
    if (error instanceof DraftCompilationError || error instanceof DraftCommandError) {
      printError(error.code, error.message, "details" in error ? error.details : undefined);
    } else {
      printError("DRAFT_COMPILE_FAILED", error instanceof Error ? error.message : String(error));
    }
    return 1;
  }
}

async function main(): Promise<void> {
  process.exitCode = await runDraftCommand(process.argv.slice(2));
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectExecution) {
  main().catch((error: unknown) => {
    printError("DRAFT_COMPILE_FAILED", error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
