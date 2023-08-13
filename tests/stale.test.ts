import { getStaleRefs } from '../src/stale'

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
      new Date(),
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
      new Date('2023-04-01T00:00:00Z'),
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
      new Date('2023-04-10T00:00:00Z'),
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
      new Date('2023-04-10T00:00:00Z'),
    )
    expect(staleBranches).toStrictEqual(['refs/heads/branch-1'])
  })
})
