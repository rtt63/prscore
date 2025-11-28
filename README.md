# prscore

Use AI to detect how potentially dangerous to is merge this PR.

Examples

- Big PR
- Breaking changes or changes in specific files
- Too much time between first and last commit, which might leed to lost focus
- Incomplete error handle

## Installation

Required Claude API account

1. Add `ANTHROPIC_API_KEY="your-key"` to secrets
2.

```bash
npm install --save-dev prscore
```

3. To create your custom config locally

```bash
npm install -g prscore && prscore init
```

## Usage

### Local CLI

```bash
# Analyze a PR locally
export ANTHROPIC_API_KEY="your-key"
prscore --base main --head feature-branch
```

### GitHub Action Setup

[Check our setup](https://github.com/rtt63/prscore/blob/main/.github/workflows/risk-check.yml)

1. Add `ANTHROPIC_API_KEY` to repository secrets
2. Comment `/prscore` on any PR to analyze scoring

## Risk Scoring

prscore calculates an overall risk score (0-10) based on:

| Factor           | Weight | What it checks                                     |
| ---------------- | ------ | -------------------------------------------------- |
| Breaking Changes | 10     | API changes, removed exports, schema modifications |
| Fatal Errors     | 9      | Runtime crashes, null errors, white screens        |
| PR Size          | 8      | Lines changed (>2000 = critical)                   |
| Migrations       | 7      | Database schema changes                            |
| Config Changes   | 6      | Environment, Docker, infrastructure files          |
| Time Span        | 2      | Multi-day PRs (stale code risk)                    |

**Risk Levels:**

- `low` (0-2.9): Safe to merge
- `medium` (3-4.9): Review carefully
- `high` (5-7.4): Risky, needs senior review
- `critical` (7.5-10): Dangerous, split or extend testing

## Example Output

```
=== Deploy Risk Analysis ===

Overall Risk: 7.8/10 (CRITICAL)

Breakdown:
  PR Size: 8.5/10
  Breaking Changes: 9.0/10
  Fatal Errors: 7.0/10
  Migrations: 7.0/10
  Config Changes: 0/10
  Time Span: 3.0/10

Recommendations:
  • ⚠️ CRITICAL RISK: Require multiple senior reviewers
  • Document all breaking changes in PR description
  • Review database migration with DBA
  • Consider splitting this PR into smaller changes
```

## Cost

**Spend it wisely**

Uses Claude Sonnet 4.5 API. Average cost per PR analysis:

- Small PR (<200 lines): ~$0.02
- Medium PR (200-500 lines): ~$0.02
- Large PR (500-1000 lines): ~$0.02
- Huge PR (>2000 lines): ~$0.03

Typical team (50 PRs/day): ~$1-1.50/day = **~$40/month**

## License

MIT
