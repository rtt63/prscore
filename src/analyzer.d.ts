import { RiskScore } from "./analysis/risk-scorer";
export interface AnalyzerOptions {
    base: string;
    head: string;
    anthropicApiKey: string;
}
export declare function analyzeDeployRisk(options: AnalyzerOptions): Promise<RiskScore>;
//# sourceMappingURL=analyzer.d.ts.map