import * as core from '@actions/core'
import { getContext, getOctokit } from './github.js'
import { run } from './run.js'

const main = async (): Promise<void> => {
  await run(
    {
      expirationDays: Number.parseFloat(core.getInput('expiration-days', { required: true })),
      refPrefix: core.getInput('ref-prefix', { required: true }),
      excludeRefs: core.getMultilineInput('exclude-refs'),
      dryRun: core.getBooleanInput('dry-run', { required: true }),
      ignoreDeletionError: core.getBooleanInput('ignore-deletion-errors', { required: true }),
      token: core.getInput('token', { required: true }),
    },
    getOctokit(),
    getContext(),
  )
}

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
