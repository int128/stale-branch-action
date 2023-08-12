# stale-branch-action [![ts](https://github.com/int128/stale-branch-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/stale-branch-action/actions/workflows/ts.yaml)

This action deletes stale branches.

## Getting Started

```yaml
jobs:
  delete:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v3
      - uses: int128/release-stale-branch-action@v1
        with:
          expiration-days: 7
```

## Specification

### Inputs

| Name              | Default       | Description           |
| ----------------- | ------------- | --------------------- |
| `expiration-days` | (required)    | Expiration in days    |
| `ref-prefix`      | `refs/heads/` | Prefix of refs        |
| `dry-run`         | -             | Set `true` if dry-run |

### Outputs

None.
