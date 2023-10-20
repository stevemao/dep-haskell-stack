import { parseDocument, Document, YAMLSeq } from 'yaml'
import { promises as fs } from 'fs'

export const getStackYaml = async (
  stackYamlPath: string
): Promise<Document> => {
  const yaml = await fs.readFile(stackYamlPath, 'utf8')
  const doc = parseDocument(yaml)

  return doc
}

export const updateResolver = (doc: Document, resolver: string): Document => {
  doc.set('resolver', resolver)
  return doc
}

interface Package {
  name: string
  version: string
}

function separateString(inputString: string): Package {
  const lastHyphenIndex = inputString.lastIndexOf('-')
  const name = inputString.substring(0, lastHyphenIndex)
  const version = inputString.substring(lastHyphenIndex + 1)
  return { name, version }
}

export const getExtraDeps = async (doc: Document): Promise<Package[]> => {
  const extraDeps = doc.get('extra-deps') as YAMLSeq

  const json = extraDeps.toJSON() as string[]

  return json.map(separateString)
}

export const setExtraDeps = async (
  doc: Document,
  extraDeps: Package[]
): Promise<Document> => {
  const seq = doc.get('extra-deps') as YAMLSeq
  // eslint-disable-next-line github/array-foreach
  extraDeps.forEach((dep, index) => {
    seq.set(index, `${dep.name}-${dep.version}`)
  })
  doc.set('extra-deps', seq)

  return doc
}

export const saveStackYaml = async (
  doc: Document,
  stackYamlPath: string
): Promise<void> => {
  const yaml = doc.toString()
  return await fs.writeFile(stackYamlPath, yaml)
}
