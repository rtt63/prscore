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
export declare function analyzeWithClaude(files: FileDiff[], depth: AnalysisDepth, totalLines: number, apiKey: string): Promise<ClaudeAnalysis>;
//# sourceMappingURL=claude-client.d.ts.map