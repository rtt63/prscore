import { FileDiff } from "../git/diff-parser";
export declare enum FileCategory {
    CRITICAL = "critical",
    NORMAL = "normal",
    LOW = "low"
}
export interface CategorizedFiles {
    critical: FileDiff[];
    normal: FileDiff[];
    low: FileDiff[];
}
export declare function categorizeFiles(files: FileDiff[]): CategorizedFiles;
export declare function hasBreakingChangeMarkers(file: FileDiff): boolean;
//# sourceMappingURL=file-categorizer.d.ts.map