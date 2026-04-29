import { describe, it, expect } from 'vitest'

describe('Test infrastructure', () => {
  it('vitest runs and assertions work', () => {
    expect(true).toBe(true)
  })

  it('jsdom provides a browser-like environment', () => {
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
    expect(typeof localStorage).toBe('object')
  })
})
