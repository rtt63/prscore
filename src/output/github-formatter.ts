import { RiskLevel, RiskScore } from "../analysis/risk-scorer";

const RISK_LEVEL_EMOJIS: Record<RiskLevel, string> = {
  [RiskLevel.LOW]: "🟢",
  [RiskLevel.MEDIUM]: "🟡",
  [RiskLevel.HIGH]: "🟠",
  [RiskLevel.CRITICAL]: "🔴",
};

const SEVERITY_THRESHOLD_ERROR = 7;
const SEVERITY_THRESHOLD_DISPLAY = 5;

function getSeverityLevel(severity: number): "error" | "warning" {
  return severity >= SEVERITY_THRESHOLD_ERROR ? "error" : "warning";
}

export function formatForGitHub(result: RiskScore): void {
  console.log(
    `::notice::Overall Risk: ${result.overall}/10 (${result.level.toUpperCase()})`,
  );

  for (const change of result.details.claudeAnalysis.breakingChanges) {
    const level = getSeverityLevel(change.severity);
    const location = change.line
      ? `file=${change.file},line=${change.line}`
      : `file=${change.file}`;
    console.log(
      `::${level} ${location}::Breaking Change: ${change.description}`,
    );
  }

  for (const risk of result.details.claudeAnalysis.fatalErrorRisks) {
    const level = getSeverityLevel(risk.severity);
    const location = risk.line
      ? `file=${risk.file},line=${risk.line}`
      : `file=${risk.file}`;
    console.log(
      `::${level} ${location}::Fatal Error Risk: ${risk.description}`,
    );
  }

  for (const finding of result.details.claudeAnalysis.findings) {
    if (finding.severity < SEVERITY_THRESHOLD_DISPLAY) continue;
    const level = getSeverityLevel(finding.severity);
    console.log(
      `::${level} file=${finding.file}::${finding.category}: ${finding.description}`,
    );
  }
}

export function formatJobSummary(result: RiskScore): string {
  let summary = `# Deploy Risk Analysis\n\n`;

  const emoji = RISK_LEVEL_EMOJIS[result.level];
  summary += `## ${emoji} Overall Risk: ${result.overall}/10 (${result.level.toUpperCase()})\n\n`;

  summary += `### Risk Breakdown\n\n`;
  summary += `| Factor | Score |\n`;
  summary += `|--------|-------|\n`;
  summary += `| PR Size | ${result.breakdown.prSize}/10 |\n`;
  summary += `| Breaking Changes | ${result.breakdown.breakingChanges}/10 |\n`;
  summary += `| Fatal Errors | ${result.breakdown.fatalErrors}/10 |\n`;
  summary += `| Migrations | ${result.breakdown.migrations}/10 |\n`;
  summary += `| Config Changes | ${result.breakdown.configChanges}/10 |\n`;
  summary += `| Time Span | ${result.breakdown.timeSpan}/10 |\n\n`;

  if (result.details.claudeAnalysis.breakingChanges.length > 0) {
    summary += `### ⚠️ Breaking Changes\n\n`;
    for (const change of result.details.claudeAnalysis.breakingChanges) {
      summary += `- **${change.file}** (${change.type}): ${change.description}\n`;
    }
    summary += `\n`;
  }

  if (result.details.claudeAnalysis.fatalErrorRisks.length > 0) {
    summary += `### 💥 Fatal Error Risks\n\n`;
    for (const risk of result.details.claudeAnalysis.fatalErrorRisks) {
      summary += `- **${risk.file}** (${risk.type}): ${risk.description}\n`;
    }
    summary += `\n`;
  }

  if (result.recommendations.length > 0) {
    summary += `### 📋 Recommendations\n\n`;
    for (const rec of result.recommendations) {
      summary += `- ${rec}\n`;
    }
    summary += `\n`;
  }

  summary += `### 📊 Details\n\n`;
  summary += `- **Total Lines Changed**: ${result.details.sizeAnalysis.totalLines}\n`;
  summary += `- **Files Changed**: ${result.details.categorizedFiles.critical.length + result.details.categorizedFiles.normal.length + result.details.categorizedFiles.low.length}\n`;
  summary += `- **Time Span**: ${Math.round(result.details.timeSpanHours)} hours\n`;

  return summary;
}
