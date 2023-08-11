import * as core from '@actions/core'
import * as github from '@actions/github'
import { paginateRefs } from './queries/refs'

type Inputs = {
  token: string
}

export const run = async (inputs: Inputs): Promise<void> => {
  const octokit = github.getOctokit(inputs.token)
  const refs = await paginateRefs(octokit, {
    owner: github.context.repo.owner,
    name: github.context.repo.repo,
    refPrefix: 'refs/heads/',
  })
  core.info(JSON.stringify(refs, undefined, 2))
}
