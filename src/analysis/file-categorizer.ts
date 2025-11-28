import { FileDiff } from "../git/diff-parser";
import {
  loadFilePatternsConfig,
  FilePatterns,
} from "../config/config-loader";

export enum FileCategory {
  CRITICAL = "critical",
  NORMAL = "normal",
  LOW = "low",
}

export interface CategorizedFiles {
  critical: FileDiff[];
  normal: FileDiff[];
  low: FileDiff[];
}

// Cache loaded patterns
let cachedPatterns: FilePatterns | null = null;

function getPatterns(): FilePatterns {
  if (!cachedPatterns) {
    cachedPatterns = loadFilePatternsConfig();
  }
  return cachedPatterns;
}

export function categorizeFiles(files: FileDiff[]): CategorizedFiles {
  const categorized: CategorizedFiles = {
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

function categorizeFile(file: FileDiff): FileCategory {
  if (file.isBinary) {
    return FileCategory.LOW;
  }

  const patterns = getPatterns();

  if (matchesPatterns(file.path, patterns.critical)) {
    return FileCategory.CRITICAL;
  }

  if (matchesPatterns(file.path, patterns.api)) {
    return FileCategory.CRITICAL;
  }

  if (matchesPatterns(file.path, patterns.low)) {
    return FileCategory.LOW;
  }

  if (file.additions + file.deletions < 10) {
    return FileCategory.LOW;
  }

  return FileCategory.NORMAL;
}

function matchesPatterns(path: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(path));
}

export function hasBreakingChangeMarkers(file: FileDiff): boolean {
  const diff = file.diff.toLowerCase();

  if (diff.includes("-export ") && !diff.includes("+export ")) {
    return true;
  }

  if (diff.match(/-\s*(function|const|export|pub|public)\s+\w+\s*\(/)) {
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
