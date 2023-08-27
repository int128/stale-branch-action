import assert from 'assert'
import { Minimatch } from 'minimatch'
import { ListRefsQuery } from './generated/graphql'

type Filter = {
  expiration: Date
  excludeRefs: string[]
}

export const getStaleRefs = (refs: ListRefsQuery, prefix: string, filter: Filter): string[] => {
  assert(refs.repository != null)
  assert(refs.repository.refs != null)
  assert(refs.repository.refs.nodes != null)

  const excludeRefPatterns = filter.excludeRefs.map((excludeRef) => new Minimatch(excludeRef))

  const staleRefNames = []
  for (const node of refs.repository.refs.nodes) {
    assert(node != null)
    assert(node.target != null)
    assert.strictEqual(node.target.__typename, 'Commit')
    const refName = `${prefix}${node.name}`

    // Exclude given patterns
    if (excludeRefPatterns.some((pattern) => pattern.match(refName))) {
      continue
    }

    // Exclude a branch associated to any pull request
    if (node.associatedPullRequests.totalCount > 0) {
      continue
    }

    // Exclude a branch committed recently
    const committedDate = new Date(node.target.committedDate)
    if (committedDate.getTime() > filter.expiration.getTime()) {
      continue
    }

    staleRefNames.push(refName)
  }
  return staleRefNames
}
