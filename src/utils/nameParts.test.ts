import { describe, it, expect } from 'vitest'
import { splitName, joinName } from './nameParts'

describe('splitName', () => {
  it('splits a simple two-part name', () => {
    expect(splitName('Ada Lovelace')).toEqual({ firstName: 'Ada', lastName: 'Lovelace' })
  })

  it('keeps the entire remainder as the last name', () => {
    expect(splitName('María del Carmen Ruiz')).toEqual({
      firstName: 'María',
      lastName: 'del Carmen Ruiz',
    })
  })

  it('handles a single-token name', () => {
    expect(splitName('Cher')).toEqual({ firstName: 'Cher', lastName: '' })
  })

  it('normalizes surrounding and repeated whitespace', () => {
    expect(splitName('  Ada   Lovelace  ')).toEqual({ firstName: 'Ada', lastName: 'Lovelace' })
  })

  it('returns empty parts for empty, null, and undefined input', () => {
    expect(splitName('')).toEqual({ firstName: '', lastName: '' })
    expect(splitName(null)).toEqual({ firstName: '', lastName: '' })
    expect(splitName(undefined)).toEqual({ firstName: '', lastName: '' })
  })
})

describe('joinName', () => {
  it('joins both parts', () => {
    expect(joinName('Ada', 'Lovelace')).toBe('Ada Lovelace')
  })

  it('omits an empty last name without leaving trailing space', () => {
    expect(joinName('Cher', '')).toBe('Cher')
  })

  it('trims each part', () => {
    expect(joinName('  Ada  ', '  Lovelace  ')).toBe('Ada Lovelace')
  })
})

describe('name round trip', () => {
  // Regression guard: JS `split(' ', 2)` silently dropped everything past the
  // second token, so saving any field in an edit form rewrote the stored name.
  const names = [
    'María del Carmen Ruiz Hernández', // Spanish double surname with particle
    'José Luis García Márquez',
    'Jean-Baptiste Le Roy', // hyphenated given name plus particle
    'Nguyễn Thị Minh Khai', // four tokens with diacritics
    'Ludwig van Beethoven',
    'Ada Lovelace',
    'Cher',
  ]

  it.each(names)('preserves "%s" through split and rejoin', (name) => {
    const { firstName, lastName } = splitName(name)
    expect(joinName(firstName, lastName)).toBe(name)
  })

  it('does not truncate the way split(" ", 2) would', () => {
    const name = 'María del Carmen Ruiz Hernández'
    expect(name.split(' ', 2).join(' ')).toBe('María del')
    expect(joinName(...Object.values(splitName(name)) as [string, string])).toBe(name)
  })
})
