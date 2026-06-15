import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const source = readFileSync(
  path.resolve(__dirname, '../../pages/PublicEventDetailPage.tsx'),
  'utf-8',
)

describe('PublicEventDetailPage — powered-by footer', () => {
  it('renders "powered by" (lowercase)', () => {
    expect(source).toContain('<span>powered by</span>')
  })

  it('renders "VOXXY" in the footer span', () => {
    expect(source).toContain('<span className="font-semibold">VOXXY</span>')
  })

  it('does NOT render the old "Voxxy Presents" footer text', () => {
    expect(source).not.toContain('>Voxxy Presents<')
  })
})
