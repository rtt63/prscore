"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeDeployRisk = analyzeDeployRisk;
const diff_parser_1 = require("./git/diff-parser");
const file_categorizer_1 = require("./analysis/file-categorizer");
const size_analyzer_1 = require("./analysis/size-analyzer");
const claude_client_1 = require("./analysis/claude-client");
const risk_scorer_1 = require("./analysis/risk-scorer");
async function analyzeDeployRisk(options) {
    const prDiff = (0, diff_parser_1.getPRDiff)(options.base, options.head);
    const categorizedFiles = (0, file_categorizer_1.categorizeFiles)(prDiff.files);
    const sizeAnalysis = (0, size_analyzer_1.analyzePRSize)(prDiff);
    const filesToAnalyze = sizeAnalysis.totalLines > 2000
        ? categorizedFiles.critical
        : [...categorizedFiles.critical, ...categorizedFiles.normal];
    const claudeAnalysis = await (0, claude_client_1.analyzeWithClaude)(filesToAnalyze, sizeAnalysis.depth, sizeAnalysis.totalLines, options.anthropicApiKey);
    const riskScore = (0, risk_scorer_1.calculateRiskScore)(prDiff, sizeAnalysis, claudeAnalysis, categorizedFiles);
    return riskScore;
}
//# sourceMappingURL=analyzer.js.map