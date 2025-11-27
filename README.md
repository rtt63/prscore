# amisafe

AI-powered deploy risk analyzer for Pull Requests. Get the score of how potentially dangerous might be to merge this.

## Features

- 🔍 **Breaking Change Detection** - API changes, removed exports, schema modifications
- 💥 **Fatal Error Analysis** - Runtime crashes, white screens, data corruption risks
- 📏 **PR Size Assessment** - Automatic risk scoring based on change size
- 🗄️ **Migration Detection** - Database schema change analysis
- ⚙️ **Config Change Tracking** - Environment and infrastructure change detection
- 🤖 **AI-Powered** - Uses Claude AI for deep code analysis
- 🎯 **GitHub Integration** - Automated PR checks and annotations

## Installation

```bash
npm install -g amisafe
```

## Usage

### Local CLI

```bash
# Analyze a PR locally
amisafe --base main --head feature-branch

# With API key
export ANTHROPIC_API_KEY="your-key"
amisafe --base main --head feature-branch
```

### GitHub Action

Add to `.github/workflows/risk-check.yml`:

```yaml
name: Deploy Risk Check

on:
  pull_request:
    types: [opened, synchronize]
  issue_comment:
    types: [created]

jobs:
  risk-analysis:
    if: |
      github.event_name == 'pull_request' ||
      (github.event_name == 'issue_comment' && 
       github.event.issue.pull_request &&
       contains(github.event.comment.body, '/risk-check'))

    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install amisafe
        run: npm install -g amisafe

      - name: Get PR info
        id: pr
        uses: actions/github-script@v7
        with:
          script: |
            let pr;
            if (context.eventName === 'pull_request') {
              pr = context.payload.pull_request;
            } else {
              const { data } = await github.rest.pulls.get({
                owner: context.repo.owner,
                repo: context.repo.repo,
                pull_number: context.issue.number
              });
              pr = data;
            }

            core.setOutput('base', pr.base.ref);
            core.setOutput('head', pr.head.sha);

      - name: Run analysis
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          amisafe \
            --base origin/${{ steps.pr.outputs.base }} \
            --head ${{ steps.pr.outputs.head }} \
            --github
```

**Setup:**

1. Add `ANTHROPIC_API_KEY` to repository secrets
2. The action runs automatically on every PR
3. Comment `/risk-check` on any PR to re-analyze

## Configuration

Set your Anthropic API key:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

Or pass it directly:

```bash
amisafe --api-key sk-ant-... --base main --head feature
```

## Risk Scoring

amisafe calculates an overall risk score (0-10) based on:

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

## Development

```bash
# Clone repo
git clone https://github.com/yourusername/amisafe
cd amisafe

# Install dependencies
npm install

# Build
npm run build

# Test locally
npm run dev -- --base main --head feature-branch
```

## Cost

Uses Claude Sonnet 4.5 API. Average cost per PR analysis:

- Small PR (<200 lines): ~$0.02
- Medium PR (200-500 lines): ~$0.02
- Large PR (500-1000 lines): ~$0.02
- Huge PR (>2000 lines): ~$0.03

Typical team (50 PRs/day): ~$1-1.50/day = **~$40/month**

## License

MIT
