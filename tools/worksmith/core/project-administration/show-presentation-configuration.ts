import type { EffectiveWorksmithPresentationConfiguration } from "./presentation-configuration";
import { getWorksmithMessage } from "./localization";
import {
  createWorksmithError,
  createWorksmithSuccess,
  renderArmBaseCompatibilityResult
} from "./worksmith-result";

export function runShowPresentationConfigurationCommand(
  arguments_: string[],
  effective: EffectiveWorksmithPresentationConfiguration
): number {
  const output =
    arguments_.length === 0
      ? "json"
      : arguments_.length === 2 && arguments_[0] === "--output"
        ? arguments_[1]
        : undefined;
  if (output !== "json" && output !== "terminal") {
    return renderArmBaseCompatibilityResult(
      createWorksmithError(
        "configuration_show",
        "INVALID_ARGUMENTS",
        "config accepts only --output terminal or --output json."
      )
    );
  }

  const result = createWorksmithSuccess("configuration_show", {
    path: effective.path,
    source: effective.source,
    effective_configuration: effective.configuration
  });
  if (output === "json") {
    return renderArmBaseCompatibilityResult(result);
  }

  const language = effective.configuration.output.language;
  const message = (id: Parameters<typeof getWorksmithMessage>[1]): string =>
    getWorksmithMessage(language, id);
  console.log(
    [
      message("config.title"),
      "",
      `${message("config.source")}: ${effective.source}`,
      `${message("config.path")}: ${effective.path}`,
      `${message("config.project_name")}: ${effective.configuration.project.name}`,
      `${message("config.profile")}: ${effective.configuration.project.profile}`,
      `${message("config.language")}: ${language}`,
      `${message("config.output_target")}: ${effective.configuration.output.target}`,
      `${message("config.shell")}: ${effective.configuration.output.shell}`,
      `${message("config.color")}: ${effective.configuration.output.color}`,
      `${message("config.warning_detail")}: ${effective.configuration.output.warning_detail}`
    ].join("\n")
  );
  return result.exit_code;
}
