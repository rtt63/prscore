"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPRDiff = getPRDiff;
const child_process_1 = require("child_process");
function getPRDiff(base, head) {
    const statsOutput = (0, child_process_1.execSync)(`git diff --numstat ${base}...${head}`, {
        encoding: "utf-8",
    });
    const files = [];
    let totalAdditions = 0;
    let totalDeletions = 0;
    for (const line of statsOutput.split("\n").filter(Boolean)) {
        const [additions, deletions, path] = line.split("\t");
        if (additions === "-" && deletions === "-") {
            files.push({
                path,
                additions: 0,
                deletions: 0,
                diff: "",
                isBinary: true,
            });
            continue;
        }
        const additionsCount = parseInt(additions, 10);
        const deletionsCount = parseInt(deletions, 10);
        totalAdditions += additionsCount;
        totalDeletions += deletionsCount;
        const fileDiff = (0, child_process_1.execSync)(`git diff ${base}...${head} -- "${path}"`, {
            encoding: "utf-8",
        });
        files.push({
            path,
            additions: additionsCount,
            deletions: deletionsCount,
            diff: fileDiff,
            isBinary: false,
        });
    }
    const commits = getCommitHistory(base, head);
    return {
        files,
        totalAdditions,
        totalDeletions,
        totalFiles: files.length,
        commits,
    };
}
function getCommitHistory(base, head) {
    const logOutput = (0, child_process_1.execSync)(`git log ${base}..${head} --pretty=format:"%H|%an|%ad|%s" --date=iso`, { encoding: "utf-8" });
    if (!logOutput.trim()) {
        return [];
    }
    return logOutput
        .split("\n")
        .filter(Boolean)
        .map((line) => {
        const [sha, author, dateStr, message] = line.split("|");
        return {
            sha,
            author,
            date: new Date(dateStr),
            message,
        };
    });
}
//# sourceMappingURL=diff-parser.js.map