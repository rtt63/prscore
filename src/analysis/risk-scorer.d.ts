import { PRDiff } from "../git/diff-parser";
import { ClaudeAnalysis } from "./claude-client";
import { SizeAnalysis } from "./size-analyzer";
import { CategorizedFiles } from "./file-categorizer";
export interface RiskScore {
    overall: number;
    level: "low" | "medium" | "high" | "critical";
    breakdown: {
        prSize: number;
        breakingChanges: number;
        fatalErrors: number;
        migrations: number;
        configChanges: number;
        timeSpan: number;
    };
    recommendations: string[];
    details: {
        sizeAnalysis: SizeAnalysis;
        claudeAnalysis: ClaudeAnalysis;
        categorizedFiles: CategorizedFiles;
        timeSpanHours: number;
    };
}
export declare function calculateRiskScore(prDiff: PRDiff, sizeAnalysis: SizeAnalysis, claudeAnalysis: ClaudeAnalysis, categorizedFiles: CategorizedFiles): RiskScore;
//# sourceMappingURL=risk-scorer.d.ts.map