# prscore

Use AI to detect how potentially dangerous is to merge this PR.

## Why?

> Is it better than traditional linters/code review approach?

It's a good option for tight, **fast-paced teams** where proper, detailed and qualified code review is a luxury. You still need tests, good typings and skilled engineers.

But **if most of your code reviews are LGTM at best - try this instead.**

## Examples

- Big PRs (too many things at once to keep focus on)
- Breaking changes or changes in specific files (probably more edge-cases than we thought)
- Too much time between first and last commit (heuristically, the longer it takes the more focus is shifting towards "just ship it already")
- Incomplete error handling (The owls are not what they seem)
- and more

## Installation

Required Claude API account

1. Add `ANTHROPIC_API_KEY="your-key"` to secrets
2. Install dependency

```bash
npm install --save-dev prscore
```

3. (optional) Create your custom config locally if needed

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

### Access Control

By default, only users with **write, maintain, or admin** permissions can trigger `/prscore` analysis. This prevents unauthorized token usage.

**To add additional trusted users:**

1. Go to your repository Settings → Secrets and variables → Actions → Variables
2. Create a new repository variable named `PRSCORE_TRUSTED_USERS`
3. Set the value to a comma-separated list of GitHub usernames:
   ```
   user1,user2,user3
   ```

**Example:**

```
PRSCORE_TRUSTED_USERS: alice,bob,charlie
```

When an unauthorized user tries to run `/prscore`, they'll receive a comment explaining the restriction.

## Risk Scoring

prscore calculates an overall risk score (0-10) based on:

| Factor           | Weight | What it checks                                     |
| ---------------- | ------ | -------------------------------------------------- |
| Breaking Changes | 7      | API changes, removed exports, schema modifications |
| Fatal Errors     | 10     | Runtime crashes, null errors, white screens        |
| PR Size          | 8      | Lines changed (>2000 = critical)                   |
| Migrations       | 7      | Database schema changes                            |
| Config Changes   | 5      | Environment, Docker, infrastructure files          |
| Time Span        | 1      | Multi-day PRs (stale code risk)                    |

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

Typical team (50 PRs/day): $1-1.50/day = **~$40/month**

## License

MIT
