import { globalCatalog } from './global'
import { authCatalog } from './auth'
import { networkCatalog } from './network'
import { emailCatalog } from './email'

export type MessageParams = Record<string, string | number>

export type CatalogKey =
  | keyof typeof globalCatalog
  | keyof typeof authCatalog
  | keyof typeof networkCatalog
  | keyof typeof emailCatalog

const catalog: Record<string, string | ((params: MessageParams) => string)> = {
  ...globalCatalog,
  ...authCatalog,
  ...networkCatalog,
  ...emailCatalog,
}

export function getMessage(
  key: string,
  params: MessageParams = {}
): string {
  const entry = catalog[key]
  if (!entry) {
    console.warn(`[errors] Missing catalog key: ${key}`)
    return key
  }
  return typeof entry === 'function' ? entry(params) : entry
}
