# stale-branch-action [![ts](https://github.com/int128/stale-branch-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/stale-branch-action/actions/workflows/ts.yaml)

This action deletes stale branches.

## Getting Started

This action deletes branches that satisfy all of the following conditions:

- A branch has been updated before the expiration date.
- A branch is not associated to any open pull request.

To delete branches older than 30 days,

```yaml
jobs:
  delete:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: int128/stale-branch-action@v1
        with:
          expiration-days: 30
```

### Filter branches

You can filter the branches by prefix.
For example,

```yaml
jobs:
  delete:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: int128/stale-branch-action@v1
        with:
          expiration-days: 1
          ref-prefix: refs/heads/renovate/
```

Note that `ref-prefix` must have a traling slash, due to the limitation of GitHub API.

### Exclude branches

You can exclude branches by glob patterns.
For example,

```yaml
jobs:
  delete:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: int128/stale-branch-action@v1
        with:
          expiration-days: 30
          exclude-refs: |
            refs/heads/*/production
```

### Ignore deletion errors

If a repository rule is set, `git push origin --delete` command may fail.

To ignore any error on deletion,

```yaml
jobs:
  delete:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: int128/stale-branch-action@v1
        with:
          expiration-days: 30
          ignore-deletion-errors: true
```

## Specification

### Inputs

| Name                     | Default        | Description                                     |
| ------------------------ | -------------- | ----------------------------------------------- |
| `expiration-days`        | (required)     | Expiration in days                              |
| `ref-prefix`             | `refs/heads/`  | Prefix of refs                                  |
| `exclude-refs`           | -              | Exclude ref by pattern (multiline string)       |
| `dry-run`                | `false`        | Do not delete refs actually                     |
| `ignore-deletion-errors` | `false`        | Ignore any errors of `git push origin --delete` |
| `token`                  | `github.token` | GitHub token                                    |

### Outputs

| Name         | Description                        |
| ------------ | ---------------------------------- |
| `stale-refs` | Stale ref names (multiline string) |
