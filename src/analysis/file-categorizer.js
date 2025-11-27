"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileCategory = void 0;
exports.categorizeFiles = categorizeFiles;
exports.hasBreakingChangeMarkers = hasBreakingChangeMarkers;
var FileCategory;
(function (FileCategory) {
    FileCategory["CRITICAL"] = "critical";
    FileCategory["NORMAL"] = "normal";
    FileCategory["LOW"] = "low";
})(FileCategory || (exports.FileCategory = FileCategory = {}));
const CRITICAL_PATTERNS = [
    /\.sql$/i,
    /migrations?\//i,
    /schema\.(ts|js|sql)$/i,
    /database\//i,
    /(^|\/)config\.(ts|js|json|ya?ml)$/i,
    /\.env/i,
    /docker/i,
    /\.tf$/i,
    /k8s|kubernetes/i,
    /nginx\.conf/i,
    /package\.json$/,
];
const LOW_PATTERNS = [
    /\.test\.(ts|js|tsx|jsx)$/i,
    /\.spec\.(ts|js|tsx|jsx)$/i,
    /__tests__\//i,
    /\.md$/i,
    /docs?\//i,
    /readme/i,
    /\.txt$/i,
    /changelog/i,
];
const API_PATTERNS = [
    /\/api\//i,
    /\/routes?\//i,
    /\/controllers?\//i,
    /\/endpoints?\//i,
    /\.route\.(ts|js)$/i,
    /\.controller\.(ts|js)$/i,
];
function categorizeFiles(files) {
    const categorized = {
        critical: [],
        normal: [],
        low: [],
    };
    for (const file of files) {
        const category = categorizeFile(file);
        categorized[category].push(file);
    }
    return categorized;
}
function categorizeFile(file) {
    if (file.isBinary) {
        return FileCategory.LOW;
    }
    if (matchesPatterns(file.path, CRITICAL_PATTERNS)) {
        return FileCategory.CRITICAL;
    }
    if (matchesPatterns(file.path, API_PATTERNS)) {
        return FileCategory.CRITICAL;
    }
    if (matchesPatterns(file.path, LOW_PATTERNS)) {
        return FileCategory.LOW;
    }
    if (file.additions + file.deletions < 10) {
        return FileCategory.LOW;
    }
    return FileCategory.NORMAL;
}
function matchesPatterns(path, patterns) {
    return patterns.some((pattern) => pattern.test(path));
}
function hasBreakingChangeMarkers(file) {
    const diff = file.diff.toLowerCase();
    if (diff.includes("-export ") && !diff.includes("+export ")) {
        return true;
    }
    if (diff.match(/-\s*(function|const|export)\s+\w+\s*\(/)) {
        return true;
    }
    if (diff.match(/alter table|drop (table|column)|rename (table|column)/i)) {
        return true;
    }
    if (diff.match(/-(get|post|put|delete|patch)\s*\(/i)) {
        return true;
    }
    return false;
}
//# sourceMappingURL=file-categorizer.js.map