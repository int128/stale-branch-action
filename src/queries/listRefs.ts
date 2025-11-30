import assert from 'node:assert'
import * as core from '@actions/core'
import type { Octokit } from '@octokit/action'
import type { ListRefsQuery, ListRefsQueryVariables } from '../generated/graphql.js'

const query = /* GraphQL */ `
  query listRefs($owner: String!, $name: String!, $refPrefix: String!, $afterCursor: String) {
    repository(owner: $owner, name: $name) {
      refs(refPrefix: $refPrefix, first: 100, after: $afterCursor) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          name
          associatedPullRequests(first: 1, states: [OPEN]) {
            totalCount
          }
          target {
            __typename
            ... on Commit {
              committedDate
            }
          }
        }
      }
    }
  }
`

export const withOctokit =
  (o: Octokit) =>
  async (v: ListRefsQueryVariables): Promise<ListRefsQuery> =>
    await o.graphql(query, v)

export const paginate = async (
  listRefs: (v: ListRefsQueryVariables) => Promise<ListRefsQuery>,
  v: ListRefsQueryVariables,
): Promise<ListRefsQuery> => {
  core.startGroup(`Query listRefs(${JSON.stringify(v)})`)
  const refs = await listRefs(v)
  core.debug(JSON.stringify(refs, undefined, 2))
  core.endGroup()

  assert(refs.repository != null)
  assert(refs.repository.refs != null)
  assert(refs.repository.refs.nodes != null)
  if (!refs.repository.refs.pageInfo.hasNextPage) {
    return refs
  }

  const next = await paginate(listRefs, { ...v, afterCursor: refs.repository.refs.pageInfo.endCursor })
  assert(next.repository != null)
  assert(next.repository.refs != null)
  assert(next.repository.refs.nodes != null)
  next.repository.refs.nodes = [...refs.repository.refs.nodes, ...next.repository.refs.nodes]
  return next
}
