/**
 * Unit tests for src/resolver.ts
 */

import { getLatestResolver } from '../src/resolver'
import { expect } from '@jest/globals'

describe('resolver.ts', () => {
  it('should return the latest LTS resolver', async () => {
    const resolver = await getLatestResolver('lts-21.16')

    const [lts, ...version] = resolver.split('-')

    expect(lts).toBe('lts')
    expect(parseFloat(version.join('-'))).toBeGreaterThanOrEqual(21.16)
  })

  it('should return the latest nightly resolver', async () => {
    const resolver = await getLatestResolver('nightly-2023-11-04')

    const [lts, ...version] = resolver.split('-')

    expect(lts).toBe('nightly')
    expect(version.join('-')).toBe('2023-11-04')
  })
})
