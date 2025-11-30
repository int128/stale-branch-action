import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import type { Context } from './github.js'

type Ref = {
  name: string
}

export const deleteRefs = async (refs: Ref[], context: Context, token: string): Promise<Ref[]> => {
  const cwd = await fs.mkdtemp(path.join(context.runnerTemp, 'stale-branch-action-'))

  core.info(`Setting up a workspace at ${cwd}`)
  await exec.exec('git', ['init'], { cwd })
  await exec.exec('git', ['remote', 'add', 'origin', `https://github.com/${context.repo.owner}/${context.repo.repo}`], {
    cwd,
  })
  const credentials = Buffer.from(`x-access-token:${token}`).toString('base64')
  core.setSecret(credentials)
  await exec.exec(
    'git',
    ['config', '--local', 'http.https://github.com/.extraheader', `AUTHORIZATION: basic ${credentials}`],
    { cwd },
  )

  core.info(`Deleting ${refs.length} refs`)
  const errorRefs = []
  for (const ref of refs) {
    const code = await exec.exec('git', ['push', 'origin', '--delete', ref.name], { cwd, ignoreReturnCode: true })
    if (code !== 0) {
      core.warning(`Failed to delete ${ref.name}`)
      errorRefs.push(ref)
    }
  }
  return errorRefs
}
