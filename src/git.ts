import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import * as fs from 'fs/promises'
import * as os from 'os'
import * as path from 'path'

export const deleteRefs = async (token: string, refs: string[]): Promise<string[]> => {
  const runnerTempDir = process.env.RUNNER_TEMP || os.tmpdir()
  const cwd = await fs.mkdtemp(path.join(runnerTempDir, 'stale-branch-action-'))

  core.info(`Setting up the workspace ${cwd}`)
  await exec.exec('git', ['init'], { cwd })
  await exec.exec(
    'git',
    ['remote', 'add', 'origin', `https://github.com/${github.context.repo.owner}/${github.context.repo.repo}`],
    { cwd },
  )
  const credentials = Buffer.from(`x-access-token:${token}`).toString('base64')
  core.setSecret(credentials)
  await exec.exec(
    'git',
    ['config', '--local', 'http.https://github.com/.extraheader', `AUTHORIZATION: basic ${credentials}`],
    { cwd },
  )

  const errorRefs = []
  for (const ref of refs) {
    const code = await exec.exec('git', ['push', 'origin', '--delete', ref], { cwd, ignoreReturnCode: true })
    if (code !== 0) {
      core.warning(`Failed to delete ${ref}`)
      errorRefs.push(ref)
    }
  }
  return errorRefs
}
