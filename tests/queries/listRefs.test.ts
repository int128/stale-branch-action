import { describe, expect, test, vi } from 'vitest'
import type { ListRefsQuery, ListRefsQueryVariables } from '../../src/generated/graphql.js'
import * as listRefs from '../../src/queries/listRefs.js'

describe('paginateListRefs', () => {
  const listRefsVariables: ListRefsQueryVariables = {
    owner: 'octocat',
    name: 'example',
    refPrefix: 'refs/heads/',
  }

  test('empty', async () => {
    const mockListRefs = vi.fn<(v: ListRefsQueryVariables) => Promise<ListRefsQuery>>()
    mockListRefs.mockResolvedValueOnce({
      repository: {
        refs: {
          totalCount: 0,
          pageInfo: { hasNextPage: false },
          nodes: [],
        },
      },
    })

    const refs = await listRefs.paginate(mockListRefs, listRefsVariables)

    expect(mockListRefs).toHaveBeenCalledTimes(1)
    expect(refs).toStrictEqual({
      repository: {
        refs: {
          totalCount: 0,
          pageInfo: { hasNextPage: false },
          nodes: [],
        },
      },
    })
  })

  test('single page', async () => {
    const mockListRefs = vi.fn<(v: ListRefsQueryVariables) => Promise<ListRefsQuery>>()
    mockListRefs.mockResolvedValueOnce({
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
    })

    const refs = await listRefs.paginate(mockListRefs, listRefsVariables)

    expect(mockListRefs).toHaveBeenCalledTimes(1)
    expect(refs).toStrictEqual({
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
    })
  })

  test('multiple pages', async () => {
    const mockListRefs = vi.fn<(v: ListRefsQueryVariables) => Promise<ListRefsQuery>>()
    mockListRefs.mockResolvedValueOnce({
      repository: {
        refs: {
          totalCount: 1000,
          pageInfo: {
            hasNextPage: true,
            endCursor: 'Cursor1',
          },
          nodes: [
            {
              name: 'branch-1',
              associatedPullRequests: { totalCount: 1 },
              target: { __typename: 'Commit', committedDate: '2023-04-05T06:07:08Z' },
            },
          ],
        },
      },
    })
    mockListRefs.mockResolvedValueOnce({
      repository: {
        refs: {
          totalCount: 1000,
          pageInfo: {
            hasNextPage: true,
            endCursor: 'Cursor2',
          },
          nodes: [
            {
              name: 'branch-2',
              associatedPullRequests: { totalCount: 0 },
              target: { __typename: 'Commit', committedDate: '2023-04-05T06:07:08Z' },
            },
            {
              name: 'branch-3',
              associatedPullRequests: { totalCount: 1 },
              target: { __typename: 'Commit', committedDate: '2023-04-05T06:07:08Z' },
            },
          ],
        },
      },
    })
    mockListRefs.mockResolvedValueOnce({
      repository: {
        refs: {
          totalCount: 1000,
          pageInfo: { hasNextPage: false },
          nodes: [
            {
              name: 'branch-4',
              associatedPullRequests: { totalCount: 1 },
              target: { __typename: 'Commit', committedDate: '2023-04-05T06:07:08Z' },
            },
          ],
        },
      },
    })

    const refs = await listRefs.paginate(mockListRefs, listRefsVariables)

    expect(mockListRefs).toHaveBeenNthCalledWith(1, {
      owner: 'octocat',
      name: 'example',
      refPrefix: 'refs/heads/',
    })
    expect(mockListRefs).toHaveBeenNthCalledWith(2, {
      owner: 'octocat',
      name: 'example',
      refPrefix: 'refs/heads/',
      afterCursor: 'Cursor1',
    })
    expect(mockListRefs).toHaveBeenNthCalledWith(3, {
      owner: 'octocat',
      name: 'example',
      refPrefix: 'refs/heads/',
      afterCursor: 'Cursor2',
    })

    expect(refs).toStrictEqual({
      repository: {
        refs: {
          totalCount: 1000,
          pageInfo: { hasNextPage: false },
          nodes: [
            {
              name: 'branch-1',
              associatedPullRequests: { totalCount: 1 },
              target: { __typename: 'Commit', committedDate: '2023-04-05T06:07:08Z' },
            },
            {
              name: 'branch-2',
              associatedPullRequests: { totalCount: 0 },
              target: { __typename: 'Commit', committedDate: '2023-04-05T06:07:08Z' },
            },
            {
              name: 'branch-3',
              associatedPullRequests: { totalCount: 1 },
              target: { __typename: 'Commit', committedDate: '2023-04-05T06:07:08Z' },
            },
            {
              name: 'branch-4',
              associatedPullRequests: { totalCount: 1 },
              target: { __typename: 'Commit', committedDate: '2023-04-05T06:07:08Z' },
            },
          ],
        },
      },
    })
  })
})
