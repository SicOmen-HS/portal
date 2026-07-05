import { runAllocateIdCommand } from "../allocate-work-item-id";
import { runCompleteCommand } from "../complete-work-item";
import { runCreateWorkItemCommand } from "../create-work-item";
import { runDraftCommand } from "../draft-compile";
import { runTransitionCommand } from "../transition-work-item";
import { runValidateProjectAdministrationCommand } from "../validate-project-administration";
import { ARMBASE_PROJECT_ADMINISTRATION_CONFIG } from "./configuration";
import { runDispositionReportCommand } from "./disposition-report";
import { runInitializeCommand } from "./initialize-project";
import { runQueueListCommand } from "./list-work-queue";
import {
  loadWorksmithPresentationConfiguration,
  WorksmithPresentationConfigurationError
} from "./presentation-configuration";
import { runShowPresentationConfigurationCommand } from "./show-presentation-configuration";
import { runTopicCatalogCommand } from "./topic-catalog";
import { runWorkItemHandoffCommand } from "./work-item-handoff";
import { runWorkItemShowCommand } from "./work-item-show";

export function printProjectAdministrationUsage(): void {
  console.log(`${ARMBASE_PROJECT_ADMINISTRATION_CONFIG.applicationName}

Usage:
  npm run project -- init [target-directory] [--dry-run]
  npm run project -- validate [--detail summary|full]
  npm run project -- config [--output terminal|json]
  npm run project -- queue [--output terminal|json|handoff] [--shell powershell|bash]
  npm run project -- allocate-id AB
  npm run project -- create manifest.json [--dry-run] [--detail full]
  npm run project -- transition AB-204 backlog ready [--dry-run]
  npm run project -- complete AB-205 --approved [--dry-run]
  npm run project -- draft compile draft.md
  npm run project -- show AB-204 [--output terminal|json]
  npm run project -- topics [--output terminal|json]
  npm run project -- disposition-report [--output terminal|json]
  npm run project -- handoff AB-204 [--output terminal|json]
`);
}

export async function runProjectAdministrationCli(arguments_: string[]): Promise<number> {
  const [command, ...commandArguments] = arguments_;
  let presentation;
  try {
    presentation = await loadWorksmithPresentationConfiguration();
  } catch (error) {
    const message =
      error instanceof WorksmithPresentationConfigurationError
        ? error.message
        : error instanceof Error
          ? error.message
          : String(error);
    console.error(
      JSON.stringify(
        {
          error: {
            code: "INVALID_PRESENTATION_CONFIGURATION",
            message
          }
        },
        null,
        2
      )
    );
    return 1;
  }

  switch (command) {
    case "init":
      return runInitializeCommand(commandArguments);
    case "validate": {
      return runValidateProjectAdministrationCommand(
        commandArguments,
        presentation.configuration.output.warning_detail
      );
    }
    case "config":
      return runShowPresentationConfigurationCommand(commandArguments, presentation);
    case "queue":
      return runQueueListCommand(commandArguments, presentation.configuration);
    case "allocate-id":
      return runAllocateIdCommand(commandArguments);
    case "create":
      return runCreateWorkItemCommand(commandArguments);
    case "transition":
      return runTransitionCommand(commandArguments);
    case "complete":
      return runCompleteCommand(commandArguments);
    case "draft":
      return runDraftCommand(commandArguments);
    case "show":
      return runWorkItemShowCommand(commandArguments);
    case "topics":
      return runTopicCatalogCommand(commandArguments);
    case "disposition-report":
      return runDispositionReportCommand(commandArguments);
    case "handoff":
      return runWorkItemHandoffCommand(commandArguments);
    case "help":
    case "--help":
    case "-h":
      printProjectAdministrationUsage();
      return 0;
    default:
      printProjectAdministrationUsage();
      if (command !== undefined) {
        console.error(`Unknown command '${command}'.`);
      }
      return 1;
  }
}
