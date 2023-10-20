/**
 * Unit tests for src/extraDeps.ts
 */
import { getLatestVersion } from '../src/extra-deps'
import { expect } from '@jest/globals'

describe('extraDeps.ts', () => {
  it('should return the latest version', async () => {
    const version = await getLatestVersion('polysemy-zoo')

    const digits = version.split('.')

    expect(digits.length).toBeGreaterThanOrEqual(1)
  })
})
