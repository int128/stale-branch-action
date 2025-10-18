import assert from 'node:assert'
import { Minimatch } from 'minimatch'
import type { ListRefsQuery } from './generated/graphql.js'

type Filter = {
  expiration: Date
  excludeRefs: string[]
}

type Ref = {
  name: string
  committedDate: Date
}

export const getStaleRefs = (refs: ListRefsQuery, prefix: string, filter: Filter): Ref[] => {
  assert(refs.repository != null)
  assert(refs.repository.refs != null)
  assert(refs.repository.refs.nodes != null)

  const excludeRefPatterns = filter.excludeRefs.map((excludeRef) => new Minimatch(excludeRef))

  const staleRefs = []
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

    staleRefs.push({
      name: refName,
      committedDate,
    })
  }
  return staleRefs
}
