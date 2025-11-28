#!/usr/bin/env node

import { Command } from "commander";
import { analyzeDeployRisk } from "./analyzer";
import { formatForGitHub, formatJobSummary } from "./output/github-formatter";
import { writeFileSync } from "fs";
import { initConfig } from "./commands/init";

const program = new Command();

program
  .name("prscore")
  .description("AI-powered deploy risk analyzer")
  .version("0.1.0");

// Init command
program
  .command("init")
  .description("Create .prscorerc.json config file with default prompts")
  .option("-f, --force", "Overwrite existing config file")
  .action((options) => {
    initConfig(options.force);
  });

// Analyze command (default)
program
  .command("analyze", { isDefault: true })
  .description("Analyze deploy risk between two branches")
  .requiredOption("-b, --base <branch>", "Base branch")
  .requiredOption("-h, --head <branch>", "Head branch")
  .option("-k, --api-key <key>", "Anthropic API key")
  .option("--github", "Output in GitHub Actions format")
  .action(async (options) => {
    const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error("Error: Anthropic API key required");
      console.error(
        "Use --api-key or set ANTHROPIC_API_KEY environment variable",
      );
      process.exit(1);
    }

    try {
      if (!options.github) {
        console.log("\nAnalyzing deploy risk...\n");
      }

      const result = await analyzeDeployRisk({
        base: options.base,
        head: options.head,
        anthropicApiKey: apiKey,
      });

      if (options.github) {
        formatForGitHub(result);

        const summary = formatJobSummary(result);
        const summaryFile = process.env.GITHUB_STEP_SUMMARY;
        if (summaryFile) {
          writeFileSync(summaryFile, summary);
        }
      } else {
        console.log("=== Deploy Risk Analysis ===\n");
        console.log(
          `Overall Risk: ${result.overall}/10 (${result.level.toUpperCase()})`,
        );
        console.log("\nBreakdown:");
        console.log(`  PR Size: ${result.breakdown.prSize}/10`);
        console.log(
          `  Breaking Changes: ${result.breakdown.breakingChanges}/10`,
        );
        console.log(`  Fatal Errors: ${result.breakdown.fatalErrors}/10`);
        console.log(`  Migrations: ${result.breakdown.migrations}/10`);
        console.log(`  Config Changes: ${result.breakdown.configChanges}/10`);
        console.log(`  Time Span: ${result.breakdown.timeSpan}/10`);

        if (result.recommendations.length > 0) {
          console.log("\nRecommendations:");
          result.recommendations.forEach((rec) => console.log(`  • ${rec}`));
        }

        if (result.details.claudeAnalysis.breakingChanges.length > 0) {
          console.log("\nBreaking Changes:");
          result.details.claudeAnalysis.breakingChanges.forEach((bc) => {
            console.log(
              `  [${bc.file}] ${bc.description} (severity: ${bc.severity}/10)`,
            );
          });
        }

        if (result.details.claudeAnalysis.fatalErrorRisks.length > 0) {
          console.log("\nFatal Error Risks:");
          result.details.claudeAnalysis.fatalErrorRisks.forEach((fe) => {
            console.log(
              `  [${fe.file}] ${fe.description} (severity: ${fe.severity}/10)`,
            );
          });
        }

        console.log("\n");
      }
    } catch (error) {
      console.error("Error:", error);
      process.exit(1);
    }
  });

program.parse();
