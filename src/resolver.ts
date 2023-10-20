import * as httpm from '@actions/http-client'

interface Data {
  snapshots: string[][]
  totalCount: number
}

const findFirstLTSVersion = (data: Data): string => {
  for (const snapshot of data.snapshots) {
    for (const versions of snapshot) {
      if (versions[0].startsWith('lts')) {
        return versions[0]
      }
    }
  }

  throw Error('No LTS version found')
}

export const getLatestResolver = async (): Promise<string> => {
  const http = new httpm.HttpClient('get-resolvers', [], {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })

  const res = await http.get('https://www.stackage.org/snapshots')

  const body: string = await res.readBody()
  const obj = JSON.parse(body)

  return findFirstLTSVersion(obj)
}
