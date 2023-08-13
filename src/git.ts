import * as exec from '@actions/exec'

export const deleteRefs = async (names: string[]) => {
  await exec.exec('git', ['push', 'origin', '--delete', ...names])
}
