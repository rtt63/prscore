import fs from "fs";
import path from "path";
import { PromptsConfig } from "./prompts-config";
import { getDefaultPromptsConfig } from "./default-prompts";

const CONFIG_FILENAME = ".amisaferc.json";

export function loadPromptsConfig(cwd: string = process.cwd()): PromptsConfig {
  const configPath = findConfigFile(cwd);

  if (!configPath) {
    return getDefaultPromptsConfig();
  }

  try {
    const configContent = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(configContent);

    if (!config.prompts) {
      console.warn(
        `No "prompts" section found in ${configPath}, using defaults`,
      );
      return getDefaultPromptsConfig();
    }

    return validateAndMergeConfig(config.prompts);
  } catch (error) {
    console.warn(
      `Failed to load config from ${configPath}: ${error}. Using defaults.`,
    );
    return getDefaultPromptsConfig();
  }
}

function findConfigFile(startDir: string): string | null {
  let currentDir = startDir;

  while (true) {
    const configPath = path.join(currentDir, CONFIG_FILENAME);

    if (fs.existsSync(configPath)) {
      return configPath;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return null;
    }

    currentDir = parentDir;
  }
}

function validateAndMergeConfig(
  userConfig: Partial<PromptsConfig>,
): PromptsConfig {
  const defaults = getDefaultPromptsConfig();

  return {
    superficial: userConfig.superficial || defaults.superficial,
    simplified: userConfig.simplified || defaults.simplified,
    full: userConfig.full || defaults.full,
    detailed: userConfig.detailed || defaults.detailed,
  };
}
