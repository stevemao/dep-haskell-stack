import * as httpm from '@actions/http-client'

interface Data {
  snapshots: string[][]
  totalCount: number
}

const findLatestVersion = (data: Data, lts: string): string => {
  for (const snapshot of data.snapshots) {
    for (const versions of snapshot) {
      if (versions[0].startsWith(lts)) {
        return versions[0]
      }
    }
  }

  throw Error('No LTS version found')
}

export const isLTS = (resolver: string): boolean => {
  return resolver.startsWith('lts')
}

export const getLatestResolver = async (resolver: string): Promise<string> => {
  const http = new httpm.HttpClient('get-resolvers', [], {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })

  const res = await http.get('https://www.stackage.org/snapshots')

  const body: string = await res.readBody()
  const obj = JSON.parse(body)

  if (isLTS(resolver)) {
    return findLatestVersion(obj, 'lts')
  }

  return findLatestVersion(obj, 'nightly')
}
