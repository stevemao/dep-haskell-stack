import * as httpm from '@actions/http-client'

interface Data {
  snapshots: string[][]
  totalCount: number
}

export enum ResolverType {
  LTS = 'lts',
  Nightly = 'nightly'
}

const findLatestVersion = async (
  resolverType: ResolverType,
  version: Version,
  page = 1
): Promise<string> => {
  const http = new httpm.HttpClient('get-resolvers', [], {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })

  const res = await http.get(`https://www.stackage.org/snapshots?page=${page}`)

  const body: string = await res.readBody()
  const data: Data = JSON.parse(body)

  if (data.snapshots.length === 0) {
    throw Error('No resolvers found')
  }

  for (const snapshot of data.snapshots) {
    for (const versions of snapshot) {
      const major = version.major || ''

      if (versions[0].startsWith(`${resolverType}-${major}`)) {
        if (version.ghc) {
          if (versions[1].includes(`ghc-${version.ghc}`)) {
            return versions[0]
          }
        }

        return versions[0]
      }
    }
  }

  return await findLatestVersion(resolverType, version, page + 1)
}

interface LTSVersion {
  major: string
  resolverType: ResolverType.LTS
}

interface NightlyVersion {
  resolverType: ResolverType.Nightly
}

interface Version {
  major?: string
  ghc?: string
}

export const getLTSVersion = (
  resolver: string
): LTSVersion | NightlyVersion => {
  const isLTS = resolver.startsWith(ResolverType.LTS)
  if (isLTS) {
    const version = resolver.split('-')[1]
    return {
      major: version.split('.')[0],
      resolverType: ResolverType.LTS
    }
  }

  return {
    resolverType: ResolverType.Nightly
  }
}

export const getLatestResolver = async (
  resolver: string,
  bumpMajor: boolean,
  ghc?: string
): Promise<string> => {
  const ltsVersion = getLTSVersion(resolver)

  if (ltsVersion.resolverType === ResolverType.LTS) {
    return await findLatestVersion(ltsVersion.resolverType, {
      major: bumpMajor ? undefined : ltsVersion.major,
      ghc
    })
  }

  return await findLatestVersion(ltsVersion.resolverType, {
    ghc
  })
}
