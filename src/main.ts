import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { getLatestResolver } from './resolver'
import {
  getExtraDeps,
  getStackYaml,
  saveStackYaml,
  setExtraDeps,
  updateResolver
} from './yaml'
import { getLatestVersion } from './extra-deps'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const stackYaml: string = core.getInput('stack-yaml')
    const stackYamlLock = `${stackYaml}.lock`
    core.debug(`stack-yaml: ${stackYaml}`)
    core.debug(`stack-yaml-lock: ${stackYamlLock}`)

    core.debug('Getting latest resolver')
    const resolver = await getLatestResolver()
    core.debug(`Latest resolver: ${resolver}`)

    core.debug('Get the stack.yaml file')
    const doc = await getStackYaml(stackYaml)
    const updatedResolver = updateResolver(doc, resolver)
    core.debug(`Updated resolver: ${updatedResolver}`)

    core.debug('get the extra-deps')
    const extraDeps = await getExtraDeps(doc)
    const updatedExtraDeps = await Promise.all(
      extraDeps.map(async dep => {
        core.debug(`extra-deps: ${dep.name} ${dep.version}`)

        core.debug('get latest version')
        const latestVersion = await getLatestVersion(dep.name)
        return { name: dep.name, version: latestVersion }
      })
    )

    core.debug('set the extra-deps')
    const updated = await setExtraDeps(doc, updatedExtraDeps)
    core.debug('write the stack.yaml file')
    await saveStackYaml(updated, stackYaml)

    core.debug('regenerate the stack.yaml.lock file')
    await exec.exec('stack', [
      'build',
      '--dry-run',
      '--stack-yaml',
      stackYaml,
      '--dependencies-only'
    ])

    // Set outputs for other workflow steps to use
    core.setOutput('resolver', resolver)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(String(error))
    }
  }
}
