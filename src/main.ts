import * as core from '@actions/core'
import { run } from './run'

const main = async (): Promise<void> => {
  await run({
    expirationDays: Number.parseFloat(core.getInput('expiration-days', { required: true })),
    refPrefix: core.getInput('ref-prefix', { required: true }),
    dryRun: core.getBooleanInput('dry-run'),
    token: core.getInput('token', { required: true }),
  })
}

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
