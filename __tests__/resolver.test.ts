/**
 * Unit tests for src/resolver.ts
 */

import { ResolverType, getLatestResolver } from '../src/resolver'
import { expect } from '@jest/globals'

describe('resolver.ts', () => {
  it('should return the latest LTS resolver', async () => {
    const resolver = await getLatestResolver('lts-21.16')

    const [lts, ...version] = resolver.split('-')

    expect(lts).toBe(ResolverType.LTS)
    expect(parseFloat(version.join('-'))).toBeGreaterThanOrEqual(21.16)
  })

  it('should return the latest nightly resolver', async () => {
    const resolver = await getLatestResolver('nightly-2023-11-04')

    const [lts, ...version] = resolver.split('-')

    expect(lts).toBe(ResolverType.Nightly)
    expect(new Date(version.join('-')).getTime()).toBeGreaterThanOrEqual(
      new Date('2023-11-04').getTime()
    )
  })
})
