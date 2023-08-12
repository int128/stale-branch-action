import * as core from '@actions/core'
import * as github from '@actions/github'
import { paginateRefs } from './queries/refs'
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
  const refs = await paginateRefs(octokit, {
    owner: github.context.repo.owner,
    name: github.context.repo.repo,
    refPrefix: inputs.refPrefix,
  })

  const expiration = new Date(Date.now() - inputs.expirationDays * 24 * 60 * 60 * 1000)
  core.info(`Expiration at ${expiration.toISOString()}`)
  const staleBranches = getStaleBranches(refs, expiration)
  core.info(`Stale branches:\n${staleBranches.join('\n')}`)

  if (inputs.dryRun) {
    return
  }
  await deleteBranches(staleBranches)
}
