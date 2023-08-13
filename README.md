# stale-branch-action [![ts](https://github.com/int128/stale-branch-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/stale-branch-action/actions/workflows/ts.yaml)

This action deletes stale branches.

## Getting Started

It deletes a branch if the following conditions are satisfied:

- The committed date is older than the expiration
- The branch does not have open pull request(s)

To delete branches older than 30 days,

```yaml
jobs:
  delete:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v3
      - uses: int128/stale-branch-action@v1
        with:
          expiration-days: 30
```

You can filter the branches by prefix.

```yaml
jobs:
  delete:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v3
      - uses: int128/stale-branch-action@v1
        with:
          expiration-days: 1
          ref-prefix: refs/heads/renovate/
```

## Specification

### Inputs

| Name              | Default        | Description           |
| ----------------- | -------------- | --------------------- |
| `expiration-days` | (required)     | Expiration in days    |
| `ref-prefix`      | `refs/heads/`  | Prefix of refs        |
| `dry-run`         | `false`        | Set `true` if dry-run |
| `token`           | `github.token` | GitHub token          |

### Outputs

| Name         | Description                        |
| ------------ | ---------------------------------- |
| `stale-refs` | Stale ref names (multiline string) |
