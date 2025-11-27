// src/analysis/claude-client.ts

import Anthropic from "@anthropic-ai/sdk";
import { AnalysisDepth } from "./size-analyzer";
import { FileDiff } from "../git/diff-parser";

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

  switch (depth) {
    case AnalysisDepth.SUPERFICIAL:
      return buildSuperficialPrompt(diffContent, totalLines);
    case AnalysisDepth.SIMPLIFIED:
      return buildSimplifiedPrompt(diffContent, totalLines);
    case AnalysisDepth.FULL:
      return buildFullPrompt(diffContent, totalLines);
    case AnalysisDepth.DETAILED:
      return buildDetailedPrompt(diffContent, totalLines);
  }
}

function buildSuperficialPrompt(diff: string, lines: number): string {
  return `You are analyzing a very large Pull Request (${lines} lines changed).
Provide a quick high-level risk assessment.

DIFF:
${diff}

Respond with JSON only:
{
  "overallRisk": <number 0-10>,
  "breakingChanges": [
    {
      "file": "path/to/file",
      "type": "api|schema|export|contract",
      "description": "brief description",
      "severity": <number 0-10>
    }
  ],
  "fatalErrorRisks": [
    {
      "file": "path/to/file",
      "type": "runtime_crash|white_screen|data_loss|infinite_loop",
      "description": "brief description",
      "severity": <number 0-10>
    }
  ],
  "findings": [],
  "summary": "Brief 1-2 sentence summary of main risks"
}

Focus ONLY on:
1. Database migrations
2. API contract changes
3. Critical config changes
4. Obvious fatal error patterns

Keep response concise. Respond ONLY with valid JSON, no markdown.`;
}

function buildSimplifiedPrompt(diff: string, lines: number): string {
  return `You are analyzing a large Pull Request (${lines} lines changed).
Focus on major risks only.

DIFF:
${diff}

Respond with JSON only:
{
  "overallRisk": <number 0-10>,
  "breakingChanges": [
    {
      "file": "path/to/file",
      "line": <number optional>,
      "type": "api|schema|export|contract",
      "description": "what breaks and why",
      "severity": <number 0-10>
    }
  ],
  "fatalErrorRisks": [
    {
      "file": "path/to/file",
      "line": <number optional>,
      "type": "runtime_crash|white_screen|data_loss|infinite_loop",
      "description": "what could cause fatal error",
      "severity": <number 0-10>
    }
  ],
  "findings": [
    {
      "file": "path/to/file",
      "category": "migration|config|complexity",
      "description": "finding description",
      "severity": <number 0-10>
    }
  ],
  "summary": "2-3 sentence summary highlighting top 3 risks"
}

Analyze for:
1. BREAKING CHANGES: API changes, removed exports, schema modifications, contract changes
2. FATAL ERROR POTENTIAL: Runtime crashes, null pointer exceptions, white screens, data corruption
3. Database migrations and their impact
4. Critical configuration changes

Rank findings by severity. Respond ONLY with valid JSON, no markdown.`;
}

function buildFullPrompt(diff: string, lines: number): string {
  return `You are analyzing a Pull Request (${lines} lines changed).
Provide comprehensive risk analysis.

DIFF:
${diff}

Respond with JSON only:
{
  "overallRisk": <number 0-10>,
  "breakingChanges": [
    {
      "file": "path/to/file",
      "line": <number optional>,
      "type": "api|schema|export|contract",
      "description": "detailed description of breaking change",
      "severity": <number 0-10>
    }
  ],
  "fatalErrorRisks": [
    {
      "file": "path/to/file", 
      "line": <number optional>,
      "type": "runtime_crash|white_screen|data_loss|infinite_loop",
      "description": "detailed description of potential fatal error",
      "severity": <number 0-10>
    }
  ],
  "findings": [
    {
      "file": "path/to/file",
      "category": "migration|config|complexity|security|performance",
      "description": "finding description",
      "severity": <number 0-10>
    }
  ],
  "summary": "Comprehensive summary of all major risks"
}

Analyze for:
1. BREAKING CHANGES (highest priority):
   - API endpoint changes
   - Function signature modifications in public APIs
   - Database schema changes
   - Removed or renamed exports
   - Contract/interface changes
   - Environment variable changes

2. FATAL ERROR POTENTIAL (second priority):
   - Uncaught exceptions that could crash the app
   - Null/undefined reference errors
   - Frontend errors that could cause white screen
   - Backend errors that could crash server
   - Infinite loops or memory leaks
   - Data corruption risks

3. Database migrations impact
4. Configuration changes
5. Code complexity increase
6. Security concerns
7. Performance implications

Provide specific line numbers when possible. Rank all findings by severity.
Respond ONLY with valid JSON, no markdown.`;
}

function buildDetailedPrompt(diff: string, lines: number): string {
  return `You are analyzing a small Pull Request (${lines} lines changed).
Provide deep, line-by-line risk analysis.

DIFF:
${diff}

Respond with JSON only:
{
  "overallRisk": <number 0-10>,
  "breakingChanges": [
    {
      "file": "path/to/file",
      "line": <number>,
      "type": "api|schema|export|contract",
      "description": "very detailed description with context",
      "severity": <number 0-10>
    }
  ],
  "fatalErrorRisks": [
    {
      "file": "path/to/file",
      "line": <number>,
      "type": "runtime_crash|white_screen|data_loss|infinite_loop",
      "description": "detailed description with reproduction scenario",
      "severity": <number 0-10>
    }
  ],
  "findings": [
    {
      "file": "path/to/file",
      "category": "migration|config|complexity|security|performance|testing|edge_case",
      "description": "detailed finding with recommendations",
      "severity": <number 0-10>
    }
  ],
  "summary": "Detailed summary with recommendations"
}

Perform deep analysis:
1. BREAKING CHANGES (line-by-line):
   - Every API change with before/after comparison
   - Every export removal or modification
   - Every schema change with migration impact
   - Every contract/interface change with affected consumers
   - Every env variable change with deployment impact

2. FATAL ERROR POTENTIAL (scenario-based):
   - Every potential runtime crash with reproduction steps
   - Every null/undefined risk with edge cases
   - Every frontend error that could white screen
   - Every async error that could hang the app
   - Every data corruption scenario

3. Edge cases not covered by tests
4. Performance regressions
5. Security vulnerabilities
6. Test coverage gaps
7. Integration points affected
8. Deployment risks

Be extremely thorough. Include line numbers for every finding.
Provide actionable recommendations for each risk.
Respond ONLY with valid JSON, no markdown.`;
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
