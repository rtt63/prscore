import { writeFileSync, existsSync } from "fs";
import { getDefaultPromptsConfig } from "../config/default-prompts";

export function initConfig(force: boolean = false): void {
  const configPath = ".prscorerc.json";

  if (existsSync(configPath) && !force) {
    console.error(`Error: ${configPath} already exists`);
    console.error("Use --force to overwrite");
    process.exit(1);
  }

  const config = {
    prompts: getDefaultPromptsConfig(),
  };

  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");

  console.log(`✅ Created ${configPath}`);
  console.log(
    "\nYou can now customize the analysis prompts by editing this file.",
  );
  console.log(
    "The file contains focus points for each analysis depth (superficial, simplified, full, detailed).",
  );
}
