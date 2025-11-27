export interface FileDiff {
    path: string;
    additions: number;
    deletions: number;
    diff: string;
    isBinary: boolean;
}
export interface PRDiff {
    files: FileDiff[];
    totalAdditions: number;
    totalDeletions: number;
    totalFiles: number;
    commits: CommitInfo[];
}
export interface CommitInfo {
    sha: string;
    author: string;
    date: Date;
    message: string;
}
export declare function getPRDiff(base: string, head: string): PRDiff;
//# sourceMappingURL=diff-parser.d.ts.map