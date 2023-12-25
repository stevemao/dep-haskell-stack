/**
 * Unit tests for src/resolver.ts
 */

import { ResolverType, getLatestResolver } from '../src/resolver'
import { expect } from '@jest/globals'

describe('resolver.ts', () => {
  it('should return the latest LTS resolver', async () => {
    const resolver = await getLatestResolver('lts-21.16', true)

    const [lts, ...version] = resolver.split('-')

    expect(lts).toBe(ResolverType.LTS)
    expect(parseFloat(version.join('-'))).toBeGreaterThanOrEqual(21.16)
  })

  it('should return the latest 21.x LTS resolver', async () => {
    const resolver = await getLatestResolver('lts-21.16', false)

    const [lts, ...version] = resolver.split('-')

    expect(lts).toBe(ResolverType.LTS)
    expect(parseFloat(version.join('-'))).toBeGreaterThanOrEqual(21.16)
  })

  it('should return the latest LTS resolver with ghc 9.4.8', async () => {
    const resolver = await getLatestResolver('lts-21.16', false, '9.4.8')

    const [lts, ...version] = resolver.split('-')

    expect(lts).toBe(ResolverType.LTS)
    expect(parseFloat(version.join('-'))).toBeGreaterThanOrEqual(21.16)
  })

  it('should return the latest nightly resolver', async () => {
    const resolver = await getLatestResolver('nightly-2023-11-04', true)

    const [lts, ...version] = resolver.split('-')

    expect(lts).toBe(ResolverType.Nightly)
    expect(new Date(version.join('-')).getTime()).toBeGreaterThanOrEqual(
      new Date('2023-11-04').getTime()
    )
  })

  it('should return the latest nightly resolver with ghc 9.4.8', async () => {
    const resolver = await getLatestResolver(
      'nightly-2023-11-04',
      true,
      '9.4.8'
    )

    const [lts, ...version] = resolver.split('-')

    expect(lts).toBe(ResolverType.Nightly)
    expect(new Date(version.join('-')).getTime()).toBeGreaterThanOrEqual(
      new Date('2023-11-04').getTime()
    )
  })
})
