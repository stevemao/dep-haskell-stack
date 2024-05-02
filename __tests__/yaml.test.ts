/**
 * Unit tests for src/yaml.ts
 */

import {
  Package,
  getExtraDeps,
  getResolver,
  getStackYaml,
  saveStackYaml,
  setExtraDeps,
  updateResolver
} from '../src/yaml'
import { expect } from '@jest/globals'

describe('yaml.ts', () => {
  it('should get stack.yaml', async () => {
    const { doc } = await getStackYaml(`${__dirname}/fixtures/stack.yaml`)

    expect(doc.get('resolver')).toBe('lts-21.16')
  })

  it('should get the resolver from stack.yaml', async () => {
    const { doc } = await getStackYaml(`${__dirname}/fixtures/stack.yaml`)

    expect(getResolver(doc)).toBe('lts-21.16')
  })

  it('should update the resolver', async () => {
    const { doc } = await getStackYaml(`${__dirname}/fixtures/stack.yaml`)

    const updated = updateResolver(doc, 'lts-21.17')

    expect(updated.get('resolver')).toBe('lts-21.17')
  })

  it('should get extra deps package info', async () => {
    const { doc } = await getStackYaml(`${__dirname}/fixtures/stack.yaml`)

    const extraDeps = await getExtraDeps(doc)

    expect(extraDeps[0].name).toBe('polysemy-zoo')
  })

  it('should get an empty list of extra deps package info if no extra-deps is defined', async () => {
    const { doc } = await getStackYaml(
      `${__dirname}/fixtures/stackNoExtraDeps.yaml`
    )

    const extraDeps = await getExtraDeps(doc)

    expect(extraDeps).toHaveLength(0)
  })

  it('should set extra deps', async () => {
    const { doc } = await getStackYaml(`${__dirname}/fixtures/stack.yaml`)

    const extraDeps = [
      { name: 'polysemy-zoo', version: '2' },
      { name: 'amazonka', version: '3' },
      { name: 'amazonka-core', version: '3' },
      { name: 'amazonka-sso', version: '3' },
      { name: 'amazonka-sts', version: '3' },
      { name: 'amazonka-apigatewaymanagementapi', version: '3' },
      { name: 'amazonka-s3', version: '3' },
      { name: 'amazonka-ses', version: '3' }
    ]

    const updated = await setExtraDeps(doc, extraDeps)

    const updatedExtraDeps = await getExtraDeps(updated)

    expect(updatedExtraDeps).toStrictEqual(extraDeps)
  })

  it('should not set any extra deps if the stack.yaml file does not contain any', async () => {
    const { doc } = await getStackYaml(
      `${__dirname}/fixtures/stackNoExtraDeps.yaml`
    )
    const extraDeps: Package[] = []
    const updated = await setExtraDeps(doc, extraDeps)
    const updatedExtraDeps = await getExtraDeps(updated)
    expect(updatedExtraDeps).toHaveLength(0)
  })

  it('should not update any extra dep if the list of updated extra deps is empty', async () => {
    const { doc } = await getStackYaml(`${__dirname}/fixtures/stack.yaml`)
    const extraDeps = [
      { name: 'polysemy-zoo', version: '0.8.2.0' },
      { name: 'amazonka', version: '2' },
      { name: 'amazonka-core', version: '2' },
      { name: 'amazonka-sso', version: '2' },
      { name: 'amazonka-sts', version: '2' },
      { name: 'amazonka-apigatewaymanagementapi', version: '2' },
      { name: 'amazonka-s3', version: '2' },
      { name: 'amazonka-ses', version: '2' }
    ]
    const updated = await setExtraDeps(doc, extraDeps)
    const updatedExtraDeps = await getExtraDeps(updated)
    expect(updatedExtraDeps).toStrictEqual(extraDeps)
  })

  it('should save stack.yaml', async () => {
    const { doc } = await getStackYaml(`${__dirname}/fixtures/stack.yaml`)

    const result = `${__dirname}/results/stack.yaml`

    await saveStackYaml(doc, result)

    const { doc: updated } = await getStackYaml(result)

    expect(updated.get('resolver')).toBe('lts-21.16')
  })
})
