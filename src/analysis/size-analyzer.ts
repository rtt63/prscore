import { PRDiff } from "../git/diff-parser";

export enum PRSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  CRITICAL = "critical",
  HUGE = "huge",
}

export enum AnalysisDepth {
  DETAILED = "detailed",
  FULL = "full",
  SIMPLIFIED = "simplified",
  SUPERFICIAL = "superficial",
}

export interface SizeAnalysis {
  size: PRSize;
  totalLines: number;
  depth: AnalysisDepth;
  baseRiskScore: number;
  reason: string;
}

const THRESHOLDS = {
  SMALL: 200,
  MEDIUM: 500,
  LARGE: 1000,
  CRITICAL: 2000,
};

export function analyzePRSize(prDiff: PRDiff): SizeAnalysis {
  const totalLines = prDiff.totalAdditions + prDiff.totalDeletions;

  if (totalLines > THRESHOLDS.CRITICAL) {
    return {
      size: PRSize.HUGE,
      totalLines,
      depth: AnalysisDepth.SUPERFICIAL,
      baseRiskScore: 9.5,
      reason: "PR extremely large - impossible to review thoroughly",
    };
  }

  if (totalLines > THRESHOLDS.LARGE) {
    return {
      size: PRSize.CRITICAL,
      totalLines,
      depth: AnalysisDepth.SIMPLIFIED,
      baseRiskScore: 7.5,
      reason: "PR very large - high risk of missing issues",
    };
  }

  if (totalLines > THRESHOLDS.MEDIUM) {
    return {
      size: PRSize.LARGE,
      totalLines,
      depth: AnalysisDepth.FULL,
      baseRiskScore: 5.0,
      reason: "Large PR - requires careful review",
    };
  }

  if (totalLines > THRESHOLDS.SMALL) {
    return {
      size: PRSize.MEDIUM,
      totalLines,
      depth: AnalysisDepth.FULL,
      baseRiskScore: 3.0,
      reason: "Medium-sized PR",
    };
  }

  return {
    size: PRSize.SMALL,
    totalLines,
    depth: AnalysisDepth.DETAILED,
    baseRiskScore: 1.0,
    reason: "Small PR - easy to review",
  };
}

export function calculateTimeSpanRisk(hours: number): number {
  if (hours > 48) return 3.0;
  if (hours > 24) return 1.5;
  return 0;
}
