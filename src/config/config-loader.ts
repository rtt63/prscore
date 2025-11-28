import fs from "fs";
import path from "path";
import { PromptsConfig } from "./prompts-config";
import { getDefaultPromptsConfig } from "./default-prompts";
import { FilePatternsConfig } from "./file-patterns-config";
import { getDefaultFilePatternsConfig } from "./default-file-patterns";

const CONFIG_FILENAME = ".prscorerc.json";

export interface FilePatterns {
  critical: RegExp[];
  low: RegExp[];
  api: RegExp[];
}

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

export function loadFilePatternsConfig(
  cwd: string = process.cwd(),
): FilePatterns {
  const configPath = findConfigFile(cwd);

  if (!configPath) {
    return convertToRegExpPatterns(getDefaultFilePatternsConfig());
  }

  try {
    const configContent = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(configContent);

    if (!config.filePatterns) {
      return convertToRegExpPatterns(getDefaultFilePatternsConfig());
    }

    return convertToRegExpPatterns(
      validateAndMergeFilePatternsConfig(config.filePatterns),
    );
  } catch (error) {
    console.warn(
      `Failed to load file patterns from ${configPath}: ${error}. Using defaults.`,
    );
    return convertToRegExpPatterns(getDefaultFilePatternsConfig());
  }
}

function validateAndMergeFilePatternsConfig(
  userConfig: Partial<FilePatternsConfig>,
): FilePatternsConfig {
  const defaults = getDefaultFilePatternsConfig();

  return {
    critical: userConfig.critical || defaults.critical,
    low: userConfig.low || defaults.low,
    api: userConfig.api || defaults.api,
  };
}

function convertToRegExpPatterns(config: FilePatternsConfig): FilePatterns {
  return {
    critical: config.critical.map(parsePattern),
    low: config.low.map(parsePattern),
    api: config.api.map(parsePattern),
  };
}

function parsePattern(pattern: string): RegExp {
  // Format: "pattern:flags" or just "pattern"
  const colonIndex = pattern.lastIndexOf(":");

  if (colonIndex === -1) {
    // No flags specified
    return new RegExp(pattern);
  }

  const patternStr = pattern.substring(0, colonIndex);
  const flags = pattern.substring(colonIndex + 1);

  return new RegExp(patternStr, flags || undefined);
}
