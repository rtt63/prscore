import { getPRDiff } from "./git/diff-parser";
import { categorizeFiles } from "./analysis/file-categorizer";
import { analyzePRSize } from "./analysis/size-analyzer";
import { analyzeWithClaude } from "./analysis/claude-client";
import { calculateRiskScore, RiskScore } from "./analysis/risk-scorer";

export interface AnalyzerOptions {
  base: string;
  head: string;
  anthropicApiKey: string;
}

const LARGE_PR_THRESHOLD = 2000;

export async function analyzeDeployRisk(
  options: AnalyzerOptions,
): Promise<RiskScore> {
  const prDiff = getPRDiff(options.base, options.head);
  const categorizedFiles = categorizeFiles(prDiff.files);
  const sizeAnalysis = analyzePRSize(prDiff);

  const isLargePR = sizeAnalysis.totalLines > LARGE_PR_THRESHOLD;
  const filesToAnalyze = isLargePR
    ? categorizedFiles.critical
    : [...categorizedFiles.critical, ...categorizedFiles.normal];

  const claudeAnalysis = await analyzeWithClaude(
    filesToAnalyze,
    sizeAnalysis.depth,
    sizeAnalysis.totalLines,
    options.anthropicApiKey,
  );

  const riskScore = calculateRiskScore(
    prDiff,
    sizeAnalysis,
    claudeAnalysis,
    categorizedFiles,
  );

  return riskScore;
}
