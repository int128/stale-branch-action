import * as exec from '@actions/exec'

export const deleteBranches = async (names: string[]) => {
  await exec.exec('git', ['push', 'origin', '--delete', ...names])
}
