# Dependabot Haskell Stack

## Description

This action updates Haskell Stack dependencies to the latest version.

- Bump Haskell Stack resolver
- Bump extra-deps

It will update the versions in both `stack.yaml` and `stack.yaml.lock`.

## Usage

```yaml
name: Update Haskell Stack dependencies

on:
  schedule:
    - cron: '* * * * *'

env:
  GITHUB_TOKEN: ${{ secrets.PAT }}

jobs:
  update-stack:
    permissions:
      contents: write
      pull-requests: write
    name: Update dependencies
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        id: checkout
        uses: actions/checkout@v4

      - name: Setup Stack
        uses: haskell-actions/setup@v2
        with:
          enable-stack: true

      - name: Update stack dependencies
        id: bump-deps
        uses: stevemao/dep-haskell-stack@v2.0.0

      - name: Create Pull Request
        id: pr
        uses: peter-evans/create-pull-request@v5
        with:
          branch: '${{vars.AL_VERSION}}-${{steps.bump-deps.outputs.new-resolver}}'
          token: ${{ env.GITHUB_TOKEN }}
          commit-message:
            'Update resolver from ${{steps.bump-deps.outputs.old-resolver}} to
            ${{steps.bump-deps.outputs.new-resolver}}'
          title:
            'Update resolver from ${{steps.bump-deps.outputs.old-resolver}} to
            ${{steps.bump-deps.outputs.new-resolver}}'

      - name: Enable auto-merge for Dependabot PRs
        if: steps.pr.outputs.pull-request-url
        run: gh pr merge --auto --merge "$PR_URL"
        env:
          PR_URL: ${{steps.pr.outputs.pull-request-url}}
          GH_TOKEN: ${{ env.GITHUB_TOKEN }}
```
