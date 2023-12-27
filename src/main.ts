import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { getLatestResolver } from './resolver'
import {
  getExtraDeps,
  getResolver,
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
    core.debug(`stack-yaml: ${stackYaml}`)

    const bumpMajor: boolean =
      core.getInput('resolver-major').toLowerCase() === 'true'
    core.debug(`resolver-major: ${bumpMajor}`)

    const ghc: string | undefined = core.getInput('ghc')
    core.debug(`ghc: ${ghc}`)

    core.debug('Geting the stack.yaml file')
    const { doc, originalDoc } = await getStackYaml(stackYaml)
    core.debug(`stack.yaml: ${doc}`)

    const previousResolver = getResolver(doc)

    core.debug('Getting latest resolver')
    const newResolver = await getLatestResolver(
      previousResolver,
      bumpMajor,
      ghc
    )
    core.debug(`Latest resolver: ${newResolver}`)

    core.debug('Updating the resolver')
    const updatedResolver = updateResolver(doc, newResolver)
    core.debug(`Updated resolver: ${updatedResolver}`)

    core.debug('Getting the extra-deps')
    const extraDeps = await getExtraDeps(doc)
    core.debug(`extra-deps: ${JSON.stringify(extraDeps)}`)

    core.debug('Getting the latest versions of the extra-deps')
    const updatedExtraDeps = await Promise.all(
      extraDeps.map(async dep => {
        core.debug(`Current version: ${dep.name}@${dep.version}`)

        core.debug('Getting the latest version')
        const latestVersion = await getLatestVersion(dep.name)
        core.debug(`Latest version: ${dep.name}@${latestVersion}`)
        return { name: dep.name, version: latestVersion }
      })
    )
    core.debug(
      `Latest versions of the extra-deps: ${JSON.stringify(updatedExtraDeps)}`
    )

    core.debug('Setting the extra-deps')
    const updated = await setExtraDeps(doc, updatedExtraDeps)
    core.debug(`extra-deps: ${updated}`)

    core.debug('Writing the stack.yaml file')
    await saveStackYaml(updated, stackYaml)

    try {
      core.debug('Regenerating the stack.yaml.lock file')
      await exec.exec('stack', [
        'build',
        '--dry-run',
        '--stack-yaml',
        stackYaml,
        '--dependencies-only'
      ])

      // Set outputs for other workflow steps to use
      core.setOutput('previous-resolver', previousResolver)
      core.setOutput('new-resolver', newResolver)
      core.setOutput('previous-extra-deps', extraDeps)
      core.setOutput('new-extra-deps', updatedExtraDeps)
    } catch (e) {
      core.info(
        'Cannot regenerate stack.yaml.lock file, new dependencies are not compatible. Reverting the stack.yaml file...'
      )

      await saveStackYaml(originalDoc, stackYaml)
      await exec.exec('stack', [
        'build',
        '--dry-run',
        '--stack-yaml',
        stackYaml,
        '--dependencies-only'
      ])

      core.warning(String(e))
      core.setOutput('previous-resolver', previousResolver)
      core.setOutput('new-resolver', previousResolver)
      core.setOutput('previous-extra-deps', extraDeps)
      core.setOutput('new-extra-deps', extraDeps)
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(String(error))
    }
  }
}
