import * as httpm from '@actions/http-client'

const findFirstNormalVersion = (data: { [x: string]: string[] }): string => {
  return data['normal-version'][0]
}

export const getLatestVersion = async (pkg: string): Promise<string> => {
  const http = new httpm.HttpClient('get-resolvers', [], {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })

  const res = await http.get(
    `https://hackage.haskell.org/package/${pkg}/preferred`
  )

  const body: string = await res.readBody()
  const obj = JSON.parse(body)

  return findFirstNormalVersion(obj)
}
