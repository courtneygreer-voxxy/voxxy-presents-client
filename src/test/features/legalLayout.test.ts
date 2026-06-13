import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { readdirSync } from 'fs'

const legalDir = path.resolve(__dirname, '../../pages/legal')
const layoutSource = readFileSync(
  path.resolve(__dirname, '../../components/legal/LegalLayout.tsx'),
  'utf-8',
)

describe('LegalLayout — always forces light mode', () => {
  it('imports and calls useForceTheme to lock to light mode', () => {
    expect(layoutSource).toContain('useForceTheme')
    expect(layoutSource).toContain("useForceTheme('light')")
  })

  it('uses gradient-text for the brand header', () => {
    expect(layoutSource).toContain('gradient-text')
  })

  it('uses backdrop-blur on the sticky nav', () => {
    expect(layoutSource).toContain('backdrop-blur')
  })

  it('does NOT use dark-mode-sensitive token classes for inactive tabs', () => {
    expect(layoutSource).not.toContain('text-muted-foreground')
    expect(layoutSource).not.toContain('text-gray-500')
    expect(layoutSource).not.toContain('text-gray-700')
  })

  it('uses explicit slate color for inactive tabs (light-mode safe)', () => {
    expect(layoutSource).toContain('text-slate-500')
  })

  it('does NOT use voxxy-gradient-page-cool (would shift in dark mode)', () => {
    expect(layoutSource).not.toContain('voxxy-gradient-page-cool')
  })

  it('has explicit white/light nav background', () => {
    expect(layoutSource).toContain('bg-white')
  })
})

describe('Legal pages — no hard-coded gray text classes', () => {
  const legalFiles = readdirSync(legalDir).filter((f) => f.endsWith('.tsx'))

  legalFiles.forEach((file) => {
    it(`${file} has no text-gray-* classes`, () => {
      const src = readFileSync(path.join(legalDir, file), 'utf-8')
      expect(src).not.toMatch(/text-gray-\d+/)
    })
  })
})
