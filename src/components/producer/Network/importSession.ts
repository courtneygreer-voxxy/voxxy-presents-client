import { format } from 'date-fns'

export type ImportSession = {
  completedAt: string
  created: number
  updated: number
  tags: string[]
  primaryTag?: string
  listsCreated: string[]
  tagCounts: Record<string, number>
}

const LIKELY_META_TAGS = new Set(['returning', 'vip', 'repeat', 'repeating', 'alumni'])

const STORAGE_KEY_PREFIX = 'voxxy_import_session_'

export function parseTagsFromValue(value: string | undefined): string[] {
  if (!value?.trim()) return []
  return value
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
}

export function discoverTagsFromRows(
  rows: Record<string, string>[],
  bulkTags: string[],
): string[] {
  const tagSet = new Set<string>()
  for (const tag of bulkTags) {
    tagSet.add(tag)
  }
  for (const row of rows) {
    const rowTags = row.tags ?? row.Tags
    for (const tag of parseTagsFromValue(rowTags)) {
      tagSet.add(tag)
    }
  }
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b))
}

export function getPrimaryTag(bulkTags: string | string[] | undefined): string | undefined {
  if (Array.isArray(bulkTags)) {
    const first = bulkTags.find((tag) => tag.trim().length > 0)
    return first?.trim()
  }
  return parseTagsFromValue(bulkTags)[0]
}

export function isLikelyMetaTag(tag: string): boolean {
  return LIKELY_META_TAGS.has(tag.trim().toLowerCase())
}

function tagsForRow(row: Record<string, string>, bulkTags: string[]): string[] {
  const rowTags = row.tags ?? row.Tags
  const fromRow = parseTagsFromValue(rowTags)
  return Array.from(new Set([...bulkTags, ...fromRow]))
}

export function countTagsFromRows(
  rows: Record<string, string>[],
  bulkTags: string[],
): Record<string, number> {
  const discovered = discoverTagsFromRows(rows, bulkTags)
  const counts: Record<string, number> = Object.fromEntries(discovered.map((tag) => [tag, 0]))

  for (const row of rows) {
    const rowTagSet = new Set(tagsForRow(row, bulkTags))
    for (const tag of rowTagSet) {
      if (tag in counts) {
        counts[tag] += 1
      }
    }
  }

  return counts
}

export function defaultListNameForTag(tag: string, date = new Date()): string {
  return `${tag} – imported ${format(date, 'MMM d, yyyy')}`
}

export function saveImportSession(organizationId: number, session: ImportSession): void {
  try {
    sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${organizationId}`, JSON.stringify(session))
  } catch {
    // ignore quota errors
  }
}

export function loadImportSession(organizationId: number): ImportSession | null {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${organizationId}`)
    if (!raw) return null
    const session = JSON.parse(raw) as ImportSession
    return { ...session, tagCounts: session.tagCounts ?? {} }
  } catch {
    return null
  }
}

export function clearImportSession(organizationId: number): void {
  try {
    sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${organizationId}`)
  } catch {
    // ignore
  }
}

export function buildImportSession(params: {
  created: number
  updated: number
  tags: string[]
  primaryTag?: string
  listsCreated?: string[]
  tagCounts?: Record<string, number>
}): ImportSession {
  return {
    completedAt: new Date().toISOString(),
    created: params.created,
    updated: params.updated,
    tags: params.tags,
    primaryTag: params.primaryTag,
    listsCreated: params.listsCreated ?? [],
    tagCounts: params.tagCounts ?? {},
  }
}
