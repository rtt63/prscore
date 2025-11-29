import { PRDiff } from "../git/diff-parser";
import { ClaudeAnalysis } from "./claude-client";
import { SizeAnalysis } from "./size-analyzer";
import { CategorizedFiles } from "./file-categorizer";

/*
 * This metric partially relies on DORA research https://www.datadoghq.com/knowledge-center/dora-metrics/
 * Such metrics probably irrelevant for big companies where you can wait for review for a week. If it's your case you likely don't need this tool at all.
 *
 * For the rest:
 * 0-2 days - great. Context is fresh, perforance is good. PR clearly not abandoned.
 * 2-3 days - still good, some minor pitalls happen. Maybe testing shows some problems, but overall performance is good.
 * 3-5 days - it's alive, but likely engineer already switched focus for at least 2-3 times before get back on this. Be careful.
 * 5-10 days - it took long, might be discussions if this change is really needed. Focus clearly lost.
 * 10+ days - back from the dead. Be very careful at least becuase there might be a reason why it was dead for a first place.
 *
 * */
const CRITICAL_TIME_SPAN_HOURS = 240;
function getTimeSpanScore(timeSpanHours: number): number {
  if (timeSpanHours > CRITICAL_TIME_SPAN_HOURS) return 8.0; // 10+ days
  if (timeSpanHours > 120) return 6.0; // 5-10 days
  if (timeSpanHours > 72) return 2.5; // 3-5 days
  if (timeSpanHours > 48) return 0.7; // 2-3 days

  return 0; // 0-2 days
}

export interface RiskScore {
  overall: number;
  level: "low" | "medium" | "high" | "critical";
  breakdown: {
    prSize: number;
    breakingChanges: number;
    fatalErrors: number;
    migrations: number;
    configChanges: number;
    timeSpan: number;
  };
  recommendations: string[];
  details: {
    sizeAnalysis: SizeAnalysis;
    claudeAnalysis: ClaudeAnalysis;
    categorizedFiles: CategorizedFiles;
    timeSpanHours: number;
  };
}

const WEIGHTS = {
  BREAKING_CHANGES: 10,
  PR_SIZE: 10,
  FATAL_ERRORS: 9,
  MIGRATIONS: 7,
  CONFIG_CHANGES: 5,
  TIME_SPAN: 1,
};

export function calculateRiskScore(
  prDiff: PRDiff,
  sizeAnalysis: SizeAnalysis,
  claudeAnalysis: ClaudeAnalysis,
  categorizedFiles: CategorizedFiles,
): RiskScore {
  let timeSpanHours = 0;
  if (prDiff.commits.length > 0) {
    const firstCommit = prDiff.commits[0];
    const lastCommit = prDiff.commits[prDiff.commits.length - 1];
    if (firstCommit && lastCommit) {
      timeSpanHours = getTimeSpanHours(firstCommit.date, lastCommit.date);
    }
  }

  const prSizeScore = sizeAnalysis.baseRiskScore;

  const breakingChangesScore =
    claudeAnalysis.breakingChanges.length === 0
      ? 0
      : Math.min(
          10,
          Math.max(...claudeAnalysis.breakingChanges.map((bc) => bc.severity)) +
            Math.min(2, claudeAnalysis.breakingChanges.length * 0.5),
        );

  const fatalErrorsScore =
    claudeAnalysis.fatalErrorRisks.length === 0
      ? 0
      : Math.min(
          10,
          Math.max(...claudeAnalysis.fatalErrorRisks.map((fe) => fe.severity)) +
            Math.min(2, claudeAnalysis.fatalErrorRisks.length * 0.5),
        );

  const hasMigrations = categorizedFiles.critical.some((f) =>
    /migration|\.sql$/i.test(f.path),
  );
  const migrationCount = categorizedFiles.critical.filter((f) =>
    /migration|\.sql$/i.test(f.path),
  ).length;
  const migrationsScore = hasMigrations
    ? Math.min(
        10,
        7.0 + (migrationCount > 1 ? Math.min(2, migrationCount * 0.5) : 0),
      )
    : 0;

  const configFiles = categorizedFiles.critical.filter((f) =>
    /config|\.env|docker|\.tf$|k8s|kubernetes/i.test(f.path),
  );
  const configChangesScore =
    configFiles.length === 0
      ? 0
      : Math.min(10, 5.0 + Math.min(3, configFiles.length * 0.8));

  const timeSpanScore = getTimeSpanScore(timeSpanHours);

  const totalWeight =
    WEIGHTS.PR_SIZE +
    WEIGHTS.BREAKING_CHANGES +
    WEIGHTS.FATAL_ERRORS +
    WEIGHTS.MIGRATIONS +
    WEIGHTS.CONFIG_CHANGES +
    WEIGHTS.TIME_SPAN;

  const weightedSum =
    prSizeScore * WEIGHTS.PR_SIZE +
    breakingChangesScore * WEIGHTS.BREAKING_CHANGES +
    fatalErrorsScore * WEIGHTS.FATAL_ERRORS +
    migrationsScore * WEIGHTS.MIGRATIONS +
    configChangesScore * WEIGHTS.CONFIG_CHANGES +
    timeSpanScore * WEIGHTS.TIME_SPAN;

  const overall = Math.min(10, weightedSum / totalWeight);
  const level =
    overall >= 7.5
      ? "critical"
      : overall >= 5.0
        ? "high"
        : overall >= 3.0
          ? "medium"
          : "low";

  const recommendations: string[] = [];

  if (sizeAnalysis.totalLines > 1000) {
    recommendations.push(
      "Consider splitting this PR into smaller, focused changes",
    );
    recommendations.push("Add detailed testing checklist in PR description");
  }

  if (claudeAnalysis.breakingChanges.length > 0) {
    recommendations.push("Document all breaking changes in PR description");
    recommendations.push("Coordinate deployment with dependent services");
    recommendations.push("Prepare rollback plan");
  }

  if (claudeAnalysis.fatalErrorRisks.length > 0) {
    recommendations.push("Add comprehensive error handling tests");
    recommendations.push("Perform manual QA on critical user flows");
    recommendations.push("Consider feature flag for gradual rollout");
  }

  if (hasMigrations) {
    recommendations.push("Review database migration with DBA");
    recommendations.push("Test migration on staging with production-like data");
    recommendations.push("Prepare migration rollback script");
    recommendations.push("Schedule deployment during low-traffic window");
  }

  if (configFiles.length > 0) {
    recommendations.push("Verify all environment variables are documented");
    recommendations.push("Update deployment runbook");
  }

  if (timeSpanHours > CRITICAL_TIME_SPAN_HOURS) {
    recommendations.push(
      "PR developed over extended period - extra careful review needed",
    );
    recommendations.push("Verify no merge conflicts or stale code");
  }

  if (overall >= 7) {
    recommendations.push("⚠️ CRITICAL RISK: Require multiple senior reviewers");
    recommendations.push("⚠️ Schedule extended testing period before merge");
  }

  return {
    overall: Math.round(overall * 10) / 10,
    level,
    breakdown: {
      prSize: prSizeScore,
      breakingChanges: breakingChangesScore,
      fatalErrors: fatalErrorsScore,
      migrations: migrationsScore,
      configChanges: configChangesScore,
      timeSpan: timeSpanScore,
    },
    recommendations,
    details: {
      sizeAnalysis,
      claudeAnalysis,
      categorizedFiles,
      timeSpanHours,
    },
  };
}

function getTimeSpanHours(first: Date, last: Date): number {
  return Math.abs(last.getTime() - first.getTime()) / (1000 * 60 * 60);
}
