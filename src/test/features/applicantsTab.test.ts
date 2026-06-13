import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const source = readFileSync(
  path.resolve(__dirname, '../../components/producer/ApplicantsTab.tsx'),
  'utf-8',
)

describe('ApplicantsTab — source-level checks', () => {
  it('uses Promise.all for concurrent submission fetching (no sequential for-loop)', () => {
    expect(source).toContain('Promise.all(')
    // The old sequential for-loop anti-pattern should be gone
    expect(source).not.toContain('for (const app of applications)')
  })

  it('renders the view mode toggle with Focused and Table options', () => {
    expect(source).toContain("viewMode === 'focused'")
    expect(source).toContain("viewMode === 'table'")
    expect(source).toContain('Focused')
    expect(source).toContain('Table')
  })

  it('uses TABLE_PAGE_SIZE constant of 100', () => {
    expect(source).toContain('TABLE_PAGE_SIZE = 100')
  })

  it('select-all banner offers to select beyond current page', () => {
    expect(source).toContain('selectAllPages')
    expect(source).toContain('allPagesSelected')
  })

  it('has a cross-page select with allPagesSelected state', () => {
    expect(source).toContain('const [allPagesSelected')
  })

  it('sidebar tab label is "Applicants" not "Vendors"', () => {
    const dashSource = readFileSync(path.resolve(__dirname, '../../pages/Dashboard.tsx'), 'utf-8')
    expect(dashSource).toContain("label: 'Applicants'")
    expect(dashSource).not.toContain("label: 'Vendors'")
  })
})

describe('ApplicantsTab — category change modal', () => {
  it('contains sendCategoryEmail toggle state', () => {
    expect(source).toContain('sendCategoryEmail')
    expect(source).toContain('setSendCategoryEmail')
  })

  it('shows "Notify applicant by email" toggle in the modal', () => {
    expect(source).toContain('Notify applicant by email')
  })

  it('button label reflects email toggle state', () => {
    expect(source).toContain('Reassign & Notify')
    expect(source).toContain('Reassign Category')
  })

  it('does NOT open a second EmailNotificationDialog for category changes', () => {
    // The old flow called handleEmailNotification after the API response.
    // The new flow sends email directly in handleUpdateCategory.
    const categoryUpdateFn = source.slice(
      source.indexOf('const handleUpdateCategory'),
      source.indexOf('const handleUpdateStatus'),
    )
    expect(categoryUpdateFn).not.toContain('handleEmailNotification')
    expect(categoryUpdateFn).toContain('sendCategoryChangeNotification')
  })
})
