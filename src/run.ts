import * as core from '@actions/core'
import * as github from '@actions/github'
import * as listRefs from './queries/listRefs'
import { getStaleBranches } from './stale'
import { deleteBranches } from './git'

type Inputs = {
  refPrefix: string
  expirationDays: number
  dryRun: boolean
  token: string
}

export const run = async (inputs: Inputs): Promise<void> => {
  const octokit = github.getOctokit(inputs.token)
  const refs = await listRefs.paginate(listRefs.withOctokit(octokit), {
    owner: github.context.repo.owner,
    name: github.context.repo.repo,
    refPrefix: inputs.refPrefix,
  })
  core.info(`Found ${refs.repository?.refs?.totalCount} branches`)

  const expiration = new Date(Date.now() - inputs.expirationDays * 24 * 60 * 60 * 1000)
  core.info(`Expiration at ${expiration.toISOString()}`)
  const staleBranches = getStaleBranches(refs, expiration)
  core.info(`Stale branches:\n${staleBranches.join('\n')}`)
  core.setOutput('stale-branches', staleBranches.join('\n'))

  if (staleBranches.length === 0) {
    core.info(`No stale branch`)
    return
  }
  if (inputs.dryRun) {
    core.info(`Exiting due to dry-run`)
    return
  }
  await deleteBranches(staleBranches)
}
