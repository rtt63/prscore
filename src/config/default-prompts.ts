import { PromptsConfig } from "./prompts-config";

export function getDefaultPromptsConfig(): PromptsConfig {
  return {
    superficial: {
      introduction:
        "You are analyzing a very large Pull Request ({{lines}} lines changed).\nProvide a quick high-level risk assessment.",
      jsonSchema: `Respond with JSON only:
{
  "overallRisk": <number 0-10>,
  "breakingChanges": [
    {
      "file": "path/to/file",
      "type": "api|schema|export|contract",
      "description": "brief description",
      "severity": <number 0-10>
    }
  ],
  "fatalErrorRisks": [
    {
      "file": "path/to/file",
      "type": "runtime_crash|white_screen|data_loss|infinite_loop",
      "description": "brief description",
      "severity": <number 0-10>
    }
  ],
  "findings": [],
  "summary": "Brief 1-2 sentence summary of main risks"
}`,
      focusPoints: [
        "Focus ONLY on:",
        "1. Database migrations",
        "2. API contract changes",
        "3. Critical config changes",
        "4. Obvious fatal error patterns",
        "",
        "Keep response concise. Respond ONLY with valid JSON, no markdown.",
      ],
    },
    simplified: {
      introduction:
        "You are analyzing a large Pull Request ({{lines}} lines changed).\nFocus on major risks only.",
      jsonSchema: `Respond with JSON only:
{
  "overallRisk": <number 0-10>,
  "breakingChanges": [
    {
      "file": "path/to/file",
      "line": <number optional>,
      "type": "api|schema|export|contract",
      "description": "what breaks and why",
      "severity": <number 0-10>
    }
  ],
  "fatalErrorRisks": [
    {
      "file": "path/to/file",
      "line": <number optional>,
      "type": "runtime_crash|white_screen|data_loss|infinite_loop",
      "description": "what could cause fatal error",
      "severity": <number 0-10>
    }
  ],
  "findings": [
    {
      "file": "path/to/file",
      "category": "migration|config|complexity",
      "description": "finding description",
      "severity": <number 0-10>
    }
  ],
  "summary": "2-3 sentence summary highlighting top 3 risks"
}`,
      focusPoints: [
        "Analyze for:",
        "1. BREAKING CHANGES: API changes, removed exports, schema modifications, contract changes",
        "2. FATAL ERROR POTENTIAL: Runtime crashes, null pointer exceptions, white screens, data corruption",
        "3. Database migrations and their impact",
        "4. Critical configuration changes",
        "",
        "Rank findings by severity. Respond ONLY with valid JSON, no markdown.",
      ],
    },
    full: {
      introduction:
        "You are analyzing a Pull Request ({{lines}} lines changed).\nProvide comprehensive risk analysis.",
      jsonSchema: `Respond with JSON only:
{
  "overallRisk": <number 0-10>,
  "breakingChanges": [
    {
      "file": "path/to/file",
      "line": <number optional>,
      "type": "api|schema|export|contract",
      "description": "detailed description of breaking change",
      "severity": <number 0-10>
    }
  ],
  "fatalErrorRisks": [
    {
      "file": "path/to/file",
      "line": <number optional>,
      "type": "runtime_crash|white_screen|data_loss|infinite_loop",
      "description": "detailed description of potential fatal error",
      "severity": <number 0-10>
    }
  ],
  "findings": [
    {
      "file": "path/to/file",
      "category": "migration|config|complexity|security|performance",
      "description": "finding description",
      "severity": <number 0-10>
    }
  ],
  "summary": "Comprehensive summary of all major risks"
}`,
      focusPoints: [
        "Analyze for:",
        "1. BREAKING CHANGES (highest priority):",
        "   - API endpoint changes",
        "   - Function signature modifications in public APIs",
        "   - Database schema changes",
        "   - Removed or renamed exports",
        "   - Contract/interface changes",
        "   - Environment variable changes",
        "",
        "2. FATAL ERROR POTENTIAL (second priority):",
        "   - Uncaught exceptions that could crash the app",
        "   - Null/undefined reference errors",
        "   - Frontend errors that could cause white screen",
        "   - Backend errors that could crash server",
        "   - Infinite loops or memory leaks",
        "   - Data corruption risks",
        "",
        "3. Database migrations impact",
        "4. Configuration changes",
        "5. Code complexity increase",
        "6. Security concerns",
        "7. Performance implications",
        "",
        "Provide specific line numbers when possible. Rank all findings by severity.",
        "Respond ONLY with valid JSON, no markdown.",
      ],
    },
    detailed: {
      introduction:
        "You are analyzing a small Pull Request ({{lines}} lines changed).\nProvide deep, line-by-line risk analysis.",
      jsonSchema: `Respond with JSON only:
{
  "overallRisk": <number 0-10>,
  "breakingChanges": [
    {
      "file": "path/to/file",
      "line": <number>,
      "type": "api|schema|export|contract",
      "description": "very detailed description with context",
      "severity": <number 0-10>
    }
  ],
  "fatalErrorRisks": [
    {
      "file": "path/to/file",
      "line": <number>,
      "type": "runtime_crash|white_screen|data_loss|infinite_loop",
      "description": "detailed description with reproduction scenario",
      "severity": <number 0-10>
    }
  ],
  "findings": [
    {
      "file": "path/to/file",
      "category": "migration|config|complexity|security|performance|testing|edge_case",
      "description": "detailed finding with recommendations",
      "severity": <number 0-10>
    }
  ],
  "summary": "Detailed summary with recommendations"
}`,
      focusPoints: [
        "Perform deep analysis:",
        "1. BREAKING CHANGES (line-by-line):",
        "   - Every API change with before/after comparison",
        "   - Every export removal or modification",
        "   - Every schema change with migration impact",
        "   - Every contract/interface change with affected consumers",
        "   - Every env variable change with deployment impact",
        "",
        "2. FATAL ERROR POTENTIAL (scenario-based):",
        "   - Every potential runtime crash with reproduction steps",
        "   - Every null/undefined risk with edge cases",
        "   - Every frontend error that could white screen",
        "   - Every async error that could hang the app",
        "   - Every data corruption scenario",
        "",
        "3. Edge cases not covered by tests",
        "4. Performance regressions",
        "5. Security vulnerabilities",
        "6. Test coverage gaps",
        "7. Integration points affected",
        "8. Deployment risks",
        "",
        "Be extremely thorough. Include line numbers for every finding.",
        "Provide actionable recommendations for each risk.",
        "Respond ONLY with valid JSON, no markdown.",
      ],
    },
  };
}
