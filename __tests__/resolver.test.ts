/**
 * Unit tests for src/resolver.ts
 */

import { getLatestResolver } from '../src/resolver'
import { expect } from '@jest/globals'

describe('resolver.ts', () => {
  it('should return the latest resolver', async () => {
    const resolver = await getLatestResolver()

    const [lts, version] = resolver.split('-')

    expect(lts).toBe('lts')
    expect(parseFloat(version)).toBeGreaterThanOrEqual(21.16)
  })
})
