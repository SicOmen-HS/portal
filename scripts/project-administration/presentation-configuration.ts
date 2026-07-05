import { readFile } from "node:fs/promises";
import { parseStrictJson } from "./strict-json";
import type { WorksmithLanguage } from "./localization";
import type { WorksmithOutputTarget, WorksmithShell } from "./worksmith-output";

export const WORKSMITH_PRESENTATION_CONFIGURATION_VERSION = 1 as const;
export const WORKSMITH_PRESENTATION_CONFIGURATION_PATH = ".worksmith.json" as const;
export const ARMBASE_POLICY_PROFILE_ID = "armbase-v1" as const;

export type WorksmithColorMode = "auto" | "always" | "never";
export type WorksmithWarningDetail = "full" | "summary";

export interface WorksmithPresentationConfiguration {
  schema_version: typeof WORKSMITH_PRESENTATION_CONFIGURATION_VERSION;
  project: {
    name: string;
    profile: typeof ARMBASE_POLICY_PROFILE_ID;
  };
  output: {
    language: WorksmithLanguage;
    target: WorksmithOutputTarget;
    shell: WorksmithShell;
    color: WorksmithColorMode;
    warning_detail: WorksmithWarningDetail;
  };
}

export interface EffectiveWorksmithPresentationConfiguration {
  path: typeof WORKSMITH_PRESENTATION_CONFIGURATION_PATH;
  source: "built_in_defaults" | "configuration_file";
  configuration: WorksmithPresentationConfiguration;
}

export class WorksmithPresentationConfigurationError extends Error {
  readonly code = "INVALID_PRESENTATION_CONFIGURATION";

  constructor(message: string) {
    super(message);
    this.name = "WorksmithPresentationConfigurationError";
  }
}

export const ARMBASE_V1_POLICY_PROFILE = Object.freeze({
  id: ARMBASE_POLICY_PROFILE_ID
});

export const ARMBASE_PRESENTATION_DEFAULTS: WorksmithPresentationConfiguration = Object.freeze({
  schema_version: WORKSMITH_PRESENTATION_CONFIGURATION_VERSION,
  project: Object.freeze({
    name: "ArmBase",
    profile: ARMBASE_POLICY_PROFILE_ID
  }),
  output: Object.freeze({
    language: "en" as const,
    target: "terminal" as const,
    shell: "powershell" as const,
    color: "auto" as const,
    warning_detail: "summary" as const
  })
});

function requireObject(value: unknown, location: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new WorksmithPresentationConfigurationError(`${location} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requireExactKeys(
  value: Record<string, unknown>,
  location: string,
  expectedKeys: readonly string[],
  optionalKeys: readonly string[] = []
): void {
  const knownKeys = [...expectedKeys, ...optionalKeys];
  const unknownKeys = Object.keys(value).filter((key) => !knownKeys.includes(key));
  if (unknownKeys.length > 0) {
    throw new WorksmithPresentationConfigurationError(
      `Unknown field(s) in ${location}: ${unknownKeys.join(", ")}.`
    );
  }

  const missingKeys = expectedKeys.filter((key) => !(key in value));
  if (missingKeys.length > 0) {
    throw new WorksmithPresentationConfigurationError(
      `Missing required field(s) in ${location}: ${missingKeys.join(", ")}.`
    );
  }
}

function requireString(value: unknown, location: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new WorksmithPresentationConfigurationError(
      `${location} must be a non-empty string.`
    );
  }
  return value;
}

function requireEnum<TValue extends string>(
  value: unknown,
  location: string,
  supported: readonly TValue[]
): TValue {
  if (typeof value !== "string" || !supported.includes(value as TValue)) {
    throw new WorksmithPresentationConfigurationError(
      `${location} must be one of: ${supported.join(", ")}.`
    );
  }
  return value as TValue;
}

export function parseWorksmithPresentationConfiguration(
  json: string
): WorksmithPresentationConfiguration {
  let parsed: unknown;
  try {
    parsed = parseStrictJson(json);
  } catch (error) {
    throw new WorksmithPresentationConfigurationError(
      `Invalid strict JSON: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  const root = requireObject(parsed, "configuration");
  requireExactKeys(root, "configuration", ["schema_version", "project", "output"]);
  if (root.schema_version !== WORKSMITH_PRESENTATION_CONFIGURATION_VERSION) {
    throw new WorksmithPresentationConfigurationError(
      `schema_version must be ${WORKSMITH_PRESENTATION_CONFIGURATION_VERSION}.`
    );
  }

  const project = requireObject(root.project, "project");
  requireExactKeys(project, "project", ["name", "profile"]);
  const name = requireString(project.name, "project.name");
  const profile = requireEnum(project.profile, "project.profile", [ARMBASE_POLICY_PROFILE_ID]);

  const output = requireObject(root.output, "output");
  requireExactKeys(
    output,
    "output",
    ["target", "shell", "color", "warning_detail"],
    ["language"]
  );

  return {
    schema_version: WORKSMITH_PRESENTATION_CONFIGURATION_VERSION,
    project: { name, profile },
    output: {
      language:
        output.language === undefined
          ? "en"
          : requireEnum(output.language, "output.language", ["en", "sv"]),
      target: requireEnum(output.target, "output.target", ["terminal", "json", "handoff"]),
      shell: requireEnum(output.shell, "output.shell", ["powershell", "bash"]),
      color: requireEnum(output.color, "output.color", ["auto", "always", "never"]),
      warning_detail: requireEnum(output.warning_detail, "output.warning_detail", [
        "full",
        "summary"
      ])
    }
  };
}

export async function loadWorksmithPresentationConfiguration(): Promise<EffectiveWorksmithPresentationConfiguration> {
  try {
    const content = await readFile(WORKSMITH_PRESENTATION_CONFIGURATION_PATH, "utf8");
    return {
      path: WORKSMITH_PRESENTATION_CONFIGURATION_PATH,
      source: "configuration_file",
      configuration: parseWorksmithPresentationConfiguration(content)
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {
        path: WORKSMITH_PRESENTATION_CONFIGURATION_PATH,
        source: "built_in_defaults",
        configuration: ARMBASE_PRESENTATION_DEFAULTS
      };
    }
    if (error instanceof WorksmithPresentationConfigurationError) {
      throw error;
    }
    throw new WorksmithPresentationConfigurationError(
      `Could not read ${WORKSMITH_PRESENTATION_CONFIGURATION_PATH}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
