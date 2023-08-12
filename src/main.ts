import * as core from '@actions/core'
import { run } from './run'

const main = async (): Promise<void> => {
  await run({
    expirationDays: Number.parseInt(core.getInput('expiration-days', { required: true })),
    refPrefix: core.getInput('ref-prefix', { required: true }),
    token: core.getInput('token', { required: true }),
  })
}

main().catch((e) => core.setFailed(e instanceof Error ? e : String(e)))
