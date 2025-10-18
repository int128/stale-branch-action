import { describe, expect, test } from 'vitest'
import { getStaleRefs } from '../src/stale.js'

describe('getStaleBranches', () => {
  test('empty', () => {
    const staleBranches = getStaleRefs(
      {
        repository: {
          refs: {
            totalCount: 0,
            pageInfo: { hasNextPage: false },
            nodes: [],
          },
        },
      },
      'refs/heads/',
      { expiration: new Date(), excludeRefs: [] },
    )
    expect(staleBranches).toStrictEqual([])
  })

  test('recent branch', () => {
    const staleBranches = getStaleRefs(
      {
        repository: {
          refs: {
            totalCount: 1,
            pageInfo: { hasNextPage: false },
            nodes: [
              {
                name: 'branch-1',
                associatedPullRequests: { totalCount: 1 },
                target: { __typename: 'Commit', committedDate: '2023-04-05T06:07:08Z' },
              },
            ],
          },
        },
      },
      'refs/heads/',
      { expiration: new Date('2023-04-01T00:00:00Z'), excludeRefs: [] },
    )
    expect(staleBranches).toStrictEqual([])
  })

  test('outdated branch but pull request is associated', () => {
    const staleBranches = getStaleRefs(
      {
        repository: {
          refs: {
            totalCount: 1,
            pageInfo: { hasNextPage: false },
            nodes: [
              {
                name: 'branch-1',
                associatedPullRequests: { totalCount: 1 },
                target: { __typename: 'Commit', committedDate: '2023-04-05T06:07:08Z' },
              },
            ],
          },
        },
      },
      'refs/heads/',
      { expiration: new Date('2023-04-10T00:00:00Z'), excludeRefs: [] },
    )
    expect(staleBranches).toStrictEqual([])
  })

  test('outdated branch', () => {
    const staleBranches = getStaleRefs(
      {
        repository: {
          refs: {
            totalCount: 1,
            pageInfo: { hasNextPage: false },
            nodes: [
              {
                name: 'branch-1',
                associatedPullRequests: { totalCount: 0 },
                target: { __typename: 'Commit', committedDate: '2023-04-05T06:07:08Z' },
              },
            ],
          },
        },
      },
      'refs/heads/',
      { expiration: new Date('2023-04-10T00:00:00Z'), excludeRefs: [] },
    )
    expect(staleBranches).toStrictEqual([
      {
        name: 'refs/heads/branch-1',
        committedDate: new Date('2023-04-05T06:07:08Z'),
      },
    ])
  })

  test('exclude branch', () => {
    const staleBranches = getStaleRefs(
      {
        repository: {
          refs: {
            totalCount: 2,
            pageInfo: { hasNextPage: false },
            nodes: [
              {
                name: 'branch-1',
                associatedPullRequests: { totalCount: 0 },
                target: { __typename: 'Commit', committedDate: '2023-04-05T06:07:08Z' },
              },
              {
                name: 'branch-2/production',
                associatedPullRequests: { totalCount: 0 },
                target: { __typename: 'Commit', committedDate: '2023-04-05T06:07:08Z' },
              },
            ],
          },
        },
      },
      'refs/heads/',
      { expiration: new Date('2023-04-10T00:00:00Z'), excludeRefs: ['refs/heads/branch-*'] },
    )
    expect(staleBranches).toStrictEqual([
      {
        name: 'refs/heads/branch-2/production',
        committedDate: new Date('2023-04-05T06:07:08Z'),
      },
    ])
  })
})
