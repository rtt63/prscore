import { writeFileSync, existsSync } from "fs";
import { getDefaultPromptsConfig } from "../config/default-prompts";
import { getDefaultFilePatternsConfig } from "../config/default-file-patterns";

export function initConfig(force: boolean = false): void {
  const configPath = ".prscorerc.json";

  if (existsSync(configPath) && !force) {
    console.error(`Error: ${configPath} already exists`);
    console.error("Use --force to overwrite");
    process.exit(1);
  }

  const config = {
    prompts: getDefaultPromptsConfig(),
    filePatterns: getDefaultFilePatternsConfig(),
  };

  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");

  console.log(`✅ Created ${configPath}`);
  console.log(
    "\nYou can now customize the configuration by editing this file.",
  );
  console.log(
    "The file contains:",
  );
  console.log(
    "  - prompts: Focus points for each analysis depth (superficial, simplified, full, detailed)",
  );
  console.log(
    "  - filePatterns: Patterns for categorizing files (critical, low, api)",
  );
}
