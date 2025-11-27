import { execSync } from "child_process";

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

export function getPRDiff(base: string, head: string): PRDiff {
  const statsOutput = execSync(`git diff --numstat ${base}...${head}`, {
    encoding: "utf-8",
  });

  const files: FileDiff[] = [];
  let totalAdditions = 0;
  let totalDeletions = 0;

  for (const line of statsOutput.split("\n").filter(Boolean)) {
    const parts = line.split("\t");
    const additions = parts[0];
    const deletions = parts[1];
    const path = parts[2];

    if (!additions || !deletions || !path) {
      continue;
    }

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

    const fileDiff = execSync(`git diff ${base}...${head} -- "${path}"`, {
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

function getCommitHistory(base: string, head: string): CommitInfo[] {
  const logOutput = execSync(
    `git log ${base}..${head} --pretty=format:"%H|%an|%ad|%s" --date=iso`,
    { encoding: "utf-8" },
  ).trim();

  if (!logOutput) {
    return [];
  }

  return logOutput.split("\n").map((line) => {
    const [sha, author, dateStr, message] = line.split("|");
    return {
      sha: sha || "",
      author: author || "",
      date: new Date(dateStr || ""),
      message: message || "",
    };
  });
}
