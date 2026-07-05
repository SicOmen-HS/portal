import { readFile } from "node:fs/promises";
import { ARMBASE_PROJECT_ADMINISTRATION_CONFIG } from "./configuration";
import { parseQueueListing, type QueueListSection } from "./queue";
import {
  createWorksmithError,
  createWorksmithSuccess,
  renderArmBaseCompatibilityResult,
  type WorksmithResult
} from "./worksmith-result";
import {
  parseWorksmithOutputOptions,
  renderWorksmithHandoffResult,
  renderWorksmithJsonResult,
  WorksmithOutputArgumentError,
  type WorksmithOutputOptions
} from "./worksmith-output";
import type { WorksmithPresentationConfiguration } from "./presentation-configuration";
import { getWorksmithMessage, type WorksmithLanguage } from "./localization";

interface QueueListPayload {
  sections: QueueListSection[];
  total_items: number;
}

function canonicalQueueSections(): string[] {
  return [
    ...new Set(
      ARMBASE_PROJECT_ADMINISTRATION_CONFIG.statuses.map(
        (status) => ARMBASE_PROJECT_ADMINISTRATION_CONFIG.statusToQueueSection[status]
      )
    )
  ];
}

async function createQueueListResult(): Promise<WorksmithResult<QueueListPayload>> {
  const queue = await readFile(ARMBASE_PROJECT_ADMINISTRATION_CONFIG.paths.workQueue, "utf8");
  const sections = parseQueueListing(queue, canonicalQueueSections());

  return createWorksmithSuccess(
    "queue_list",
    {
      sections,
      total_items: sections.reduce((total, section) => total + section.items.length, 0)
    },
    {
      nextActions: [
        {
          id: "validate",
          description: "Validate project administration state.",
          command: { executable: "npm", arguments: ["run", "project", "--", "validate"] }
        }
      ]
    }
  );
}

function renderQueueTerminalResult(
  result: WorksmithResult<QueueListPayload>,
  configuration: WorksmithPresentationConfiguration
): number {
  if (result.status === "error") {
    return renderArmBaseCompatibilityResult(result);
  }

  const language = configuration.output.language;
  const lines = [
    getWorksmithMessage(language, "queue.application_title", {
      project: configuration.project.name
    }),
    "",
    getWorksmithMessage(language, "queue.title")
  ];
  for (const section of result.payload.sections) {
    lines.push("", `## ${section.name} (${section.items.length})`);
    if (section.items.length === 0) {
      lines.push(getWorksmithMessage(language, "queue.empty"));
      continue;
    }

    for (const item of section.items) {
      lines.push(
        `- ${item.id} - ${item.title}${
          item.completed_on === undefined
            ? ""
            : ` (${getWorksmithMessage(language, "queue.completed", {
                date: item.completed_on
              })})`
        }`
      );
    }
  }
  lines.push(
    "",
    getWorksmithMessage(language, "queue.total", { count: result.payload.total_items })
  );
  console.log(lines.join("\n"));
  return result.exit_code;
}

function queueHandoffDetails(
  result: WorksmithResult<QueueListPayload>,
  language: WorksmithLanguage
): string[] {
  const lines = [`## ${getWorksmithMessage(language, "queue.title")}`];
  for (const section of result.payload.sections) {
    lines.push("", `### ${section.name} (${section.items.length})`);
    if (section.items.length === 0) {
      lines.push(getWorksmithMessage(language, "queue.handoff_empty"));
      continue;
    }
    for (const item of section.items) {
      lines.push(
        `- ${item.id} - ${item.title}${
          item.completed_on === undefined
            ? ""
            : ` (${getWorksmithMessage(language, "queue.completed", {
                date: item.completed_on
              })})`
        }`
      );
    }
  }
  return lines;
}

function renderQueueListResult(
  result: WorksmithResult<QueueListPayload>,
  options: WorksmithOutputOptions,
  configuration: WorksmithPresentationConfiguration
): number {
  if (options.target === "json") {
    return renderWorksmithJsonResult(result);
  }
  if (options.target === "handoff") {
    return renderWorksmithHandoffResult(
      result,
      {
        title: getWorksmithMessage(configuration.output.language, "queue.handoff_title"),
        summary: [
          ...(configuration.project.name === "ArmBase"
            ? []
            : [
                getWorksmithMessage(configuration.output.language, "queue.project_summary", {
                  project: configuration.project.name
                })
              ]),
          getWorksmithMessage(configuration.output.language, "queue.items_summary", {
            count: result.payload.total_items
          })
        ],
        completedActions: [
          getWorksmithMessage(configuration.output.language, "queue.completed_read"),
          getWorksmithMessage(configuration.output.language, "queue.completed_listed")
        ],
        details: queueHandoffDetails(result, configuration.output.language),
        nextActionDescriptions: {
          validate: getWorksmithMessage(configuration.output.language, "queue.next_validate")
        }
      },
      options.shell,
      configuration.output.language
    );
  }
  return renderQueueTerminalResult(result, configuration);
}

function renderQueueListError(
  result: ReturnType<typeof createWorksmithError>,
  options: WorksmithOutputOptions,
  language: WorksmithLanguage
): number {
  if (options.target === "json") {
    return renderWorksmithJsonResult(result);
  }
  if (options.target === "handoff") {
    return renderWorksmithHandoffResult(
      result,
      {
        title: getWorksmithMessage(language, "queue.handoff_title"),
        summary: [],
        completedActions: []
      },
      options.shell,
      language
    );
  }
  return renderArmBaseCompatibilityResult(result);
}

export async function runQueueListCommand(
  arguments_: string[],
  configuration: WorksmithPresentationConfiguration
): Promise<number> {
  let options: WorksmithOutputOptions;
  try {
    options = parseWorksmithOutputOptions(arguments_, {
      target: configuration.output.target,
      shell: configuration.output.shell
    });
  } catch (error) {
    return renderArmBaseCompatibilityResult(
      createWorksmithError(
        "queue_list",
        "INVALID_ARGUMENTS",
        error instanceof WorksmithOutputArgumentError ? error.message : String(error)
      )
    );
  }

  try {
    return renderQueueListResult(await createQueueListResult(), options, configuration);
  } catch (error) {
    return renderQueueListError(
      createWorksmithError(
        "queue_list",
        "QUEUE_LIST_FAILED",
        error instanceof Error ? error.message : String(error)
      ),
      options,
      configuration.output.language
    );
  }
}
