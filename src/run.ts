import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import * as listRefs from './queries/listRefs'
import { getStaleRefs } from './stale'

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
  const staleRefs = getStaleRefs(refs, inputs.refPrefix, expiration)
  core.setOutput('stale-refs', staleRefs.join('\n'))
  if (staleRefs.length === 0) {
    core.info(`No stale branch`)
    return
  }
  core.info(`Stale refs:\n${staleRefs.join('\n')}`)

  if (inputs.dryRun) {
    core.info(`Exiting due to dry-run`)
    return
  }
  for (const ref of staleRefs) {
    // Ignore deletion error such as branch protection rule
    const code = await exec.exec('git', ['push', 'origin', '--delete', ref], { ignoreReturnCode: true })
    if (code !== 0) {
      core.warning(`Failed to delete ${ref}`)
    }
  }
}
