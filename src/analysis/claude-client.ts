import Anthropic from "@anthropic-ai/sdk";
import { AnalysisDepth } from "./size-analyzer";
import { FileDiff } from "../git/diff-parser";
import { loadPromptsConfig } from "../config/config-loader";
import { buildPromptFromTemplate } from "../config/prompts-config";

export interface ClaudeAnalysis {
  overallRisk: number;
  breakingChanges: BreakingChange[];
  fatalErrorRisks: FatalErrorRisk[];
  findings: Finding[];
  summary: string;
}

export interface BreakingChange {
  file: string;
  line?: number;
  type: "api" | "schema" | "export" | "contract";
  description: string;
  severity: number;
}

export interface FatalErrorRisk {
  file: string;
  line?: number;
  type: "runtime_crash" | "white_screen" | "data_loss" | "infinite_loop";
  description: string;
  severity: number;
}

export interface Finding {
  file: string;
  category: string;
  description: string;
  severity: number;
}

export async function analyzeWithClaude(
  files: FileDiff[],
  depth: AnalysisDepth,
  totalLines: number,
  apiKey: string,
): Promise<ClaudeAnalysis> {
  const client = new Anthropic({ apiKey });
  const prompt = buildPrompt(files, depth, totalLines);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: getMaxTokens(depth),
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  if (!content) {
    throw new Error("No content in Claude response");
  }
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }
  return parseResponse(content.text);
}

function buildPrompt(
  files: FileDiff[],
  depth: AnalysisDepth,
  totalLines: number,
): string {
  const diffContent = formatDiff(files);
  const config = loadPromptsConfig();

  switch (depth) {
    case AnalysisDepth.SUPERFICIAL:
      return buildPromptFromTemplate(config.superficial, diffContent, totalLines);
    case AnalysisDepth.SIMPLIFIED:
      return buildPromptFromTemplate(config.simplified, diffContent, totalLines);
    case AnalysisDepth.FULL:
      return buildPromptFromTemplate(config.full, diffContent, totalLines);
    case AnalysisDepth.DETAILED:
      return buildPromptFromTemplate(config.detailed, diffContent, totalLines);
  }
}

function formatDiff(files: FileDiff[]): string {
  return files
    .filter((file) => !file.isBinary)
    .map((file) => {
      return `
=== File: ${file.path} ===
+${file.additions} -${file.deletions}

${file.diff}
`;
    })
    .join("\n");
}

function getMaxTokens(depth: AnalysisDepth): number {
  switch (depth) {
    case AnalysisDepth.SUPERFICIAL:
      return 500;
    case AnalysisDepth.SIMPLIFIED:
      return 1000;
    case AnalysisDepth.FULL:
      return 2000;
    case AnalysisDepth.DETAILED:
      return 4000;
  }
}

function parseResponse(text: string): ClaudeAnalysis {
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error(`Failed to parse Claude response: ${error}`);
  }
}
