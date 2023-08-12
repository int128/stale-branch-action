import * as listRefs from '../../src/queries/listRefs'
import { ListRefsQuery, ListRefsQueryVariables } from '../../src/generated/graphql'

test('paginateListRefs', async () => {
  const mockListRefs = jest.fn<Promise<ListRefsQuery>, [ListRefsQueryVariables]>()
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
          {
            name: 'branch-2',
            associatedPullRequests: { totalCount: 0 },
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
          hasNextPage: false,
        },
        nodes: [
          {
            name: 'branch-3',
            associatedPullRequests: { totalCount: 1 },
            target: { __typename: 'Commit', committedDate: '2023-04-05T06:07:08Z' },
          },
        ],
      },
    },
  })

  const refs = await listRefs.paginate(mockListRefs, {
    owner: 'octocat',
    name: 'example',
    refPrefix: 'refs/heads/',
  })
  expect(refs).toStrictEqual({
    repository: {
      refs: {
        totalCount: 1000,
        pageInfo: {
          hasNextPage: false,
        },
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
        ],
      },
    },
  })
})
