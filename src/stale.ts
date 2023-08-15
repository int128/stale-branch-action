import assert from 'assert'
import { ListRefsQuery } from './generated/graphql'

export const getStaleRefs = (refs: ListRefsQuery, prefix: string, expiration: Date): string[] => {
  assert(refs.repository != null)
  assert(refs.repository.refs != null)
  assert(refs.repository.refs.nodes != null)

  const staleRefNames = []
  for (const node of refs.repository.refs.nodes) {
    assert(node != null)
    if (node.associatedPullRequests.totalCount > 0) {
      continue // branch is associated to a pull request
    }

    assert(node.target != null)
    assert.strictEqual(node.target.__typename, 'Commit')
    const committedDate = new Date(node.target.committedDate)
    if (committedDate.getTime() > expiration.getTime()) {
      continue // branch is not outdated
    }

    staleRefNames.push(`${prefix}${node.name}`)
  }
  return staleRefNames
}
