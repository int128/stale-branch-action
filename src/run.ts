import * as core from '@actions/core'
import * as github from '@actions/github'
import * as listRefs from './queries/listRefs.js'
import { getStaleRefs } from './stale.js'
import { deleteRefs } from './git.js'

type Inputs = {
  expirationDays: number
  refPrefix: string
  excludeRefs: string[]
  dryRun: boolean
  ignoreDeletionError: boolean
  token: string
}

export const run = async (inputs: Inputs): Promise<void> => {
  const octokit = github.getOctokit(inputs.token)
  const listRefsQuery = await listRefs.paginate(listRefs.withOctokit(octokit), {
    owner: github.context.repo.owner,
    name: github.context.repo.repo,
    refPrefix: inputs.refPrefix,
  })
  core.info(`Found ${listRefsQuery.repository?.refs?.totalCount} refs in the repository`)

  const expiration = new Date(Date.now() - inputs.expirationDays * 24 * 60 * 60 * 1000)
  core.info(`Finding stale refs by expiration at ${expiration.toISOString()}`)
  const staleRefs = getStaleRefs(listRefsQuery, inputs.refPrefix, {
    expiration,
    excludeRefs: inputs.excludeRefs,
  })
  core.setOutput('stale-refs', staleRefs.map((ref) => ref.name).join('\n'))
  if (staleRefs.length === 0) {
    core.info(`No stale branch`)
    return
  }

  core.info(`Found ${staleRefs.length} stale refs:`)
  for (const ref of staleRefs) {
    core.info(`- ${ref.name} (committed at ${ref.committedDate.toISOString()})`)
  }
  if (inputs.dryRun) {
    core.info(`Exiting due to dry-run`)
    return
  }
  const errorRefs = await deleteRefs(inputs.token, staleRefs)
  if (errorRefs.length > 0 && !inputs.ignoreDeletionError) {
    throw new Error(`Failed to delete refs: ${errorRefs.map((ref) => ref.name).join(', ')}`)
  }
}
