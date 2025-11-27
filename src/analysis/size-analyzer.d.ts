import { PRDiff } from "../git/diff-parser";
export declare enum PRSize {
    SMALL = "small",
    MEDIUM = "medium",
    LARGE = "large",
    CRITICAL = "critical",
    HUGE = "huge"
}
export declare enum AnalysisDepth {
    DETAILED = "detailed",
    FULL = "full",
    SIMPLIFIED = "simplified",
    SUPERFICIAL = "superficial"
}
export interface SizeAnalysis {
    size: PRSize;
    totalLines: number;
    depth: AnalysisDepth;
    baseRiskScore: number;
    reason: string;
}
export declare function analyzePRSize(prDiff: PRDiff): SizeAnalysis;
export declare function calculateTimeSpanRisk(hours: number): number;
//# sourceMappingURL=size-analyzer.d.ts.map