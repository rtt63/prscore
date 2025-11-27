"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisDepth = exports.PRSize = void 0;
exports.analyzePRSize = analyzePRSize;
exports.calculateTimeSpanRisk = calculateTimeSpanRisk;
var PRSize;
(function (PRSize) {
    PRSize["SMALL"] = "small";
    PRSize["MEDIUM"] = "medium";
    PRSize["LARGE"] = "large";
    PRSize["CRITICAL"] = "critical";
    PRSize["HUGE"] = "huge";
})(PRSize || (exports.PRSize = PRSize = {}));
var AnalysisDepth;
(function (AnalysisDepth) {
    AnalysisDepth["DETAILED"] = "detailed";
    AnalysisDepth["FULL"] = "full";
    AnalysisDepth["SIMPLIFIED"] = "simplified";
    AnalysisDepth["SUPERFICIAL"] = "superficial";
})(AnalysisDepth || (exports.AnalysisDepth = AnalysisDepth = {}));
const THRESHOLDS = {
    SMALL: 200,
    MEDIUM: 500,
    LARGE: 1000,
    CRITICAL: 2000,
};
function analyzePRSize(prDiff) {
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
function calculateTimeSpanRisk(hours) {
    if (hours > 48)
        return 3.0;
    if (hours > 24)
        return 1.5;
    return 0;
}
//# sourceMappingURL=size-analyzer.js.map