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

describe('ApplicantsTab — status filter logic', () => {
  it('Paid filter checks payment_status, not applicant.status', () => {
    // The 'paid' filter must branch on payment_status — not status === 'paid'
    expect(source).toContain("statusFilter === 'paid'")
    expect(source).toContain("applicant.payment_status !== 'paid'")
    expect(source).toContain("applicant.payment_status !== 'confirmed'")
  })

  it('Paid filter handles both payment_status values (paid and legacy confirmed)', () => {
    const filterBlock = source.slice(
      source.indexOf("statusFilter === 'paid'"),
      source.indexOf("} else if (applicant.status !== statusFilter)"),
    )
    expect(filterBlock).toContain("payment_status !== 'paid'")
    expect(filterBlock).toContain("payment_status !== 'confirmed'")
  })

  it('Opted Out filter covers both opted_out and cancelled statuses', () => {
    expect(source).toContain("statusFilter === 'opted_out'")
    expect(source).toContain("applicant.status !== 'opted_out' && applicant.status !== 'cancelled'")
  })

  it('STATUS_FILTER_OPTIONS has paid not confirmed as a filter value', () => {
    expect(source).toContain("value: 'paid', label: 'Paid'")
    // confirmed should not be a filter option value anymore
    expect(source).not.toContain("value: 'confirmed', label: 'Paid'")
  })

  it('StatusFilter type includes paid and does not rely on confirmed for filtering', () => {
    const typeBlock = source.slice(
      source.indexOf('type StatusFilter'),
      source.indexOf('const STATUS_FILTER_OPTIONS'),
    )
    expect(typeBlock).toContain("'paid'")
    expect(typeBlock).not.toContain("'confirmed'")
  })

  it('Invited filter auto-enables showInvited when selected', () => {
    expect(source).toContain("if (newStatus === 'invited') setShowInvited(true)")
  })
})

describe('ApplicantsTab — status badge display', () => {
  it('legacy status=confirmed displays as Approved (not raw string)', () => {
    // confirmed case must fall through to approved or have its own return
    const badgeBlock = source.slice(
      source.indexOf('const getStatusBadge'),
      source.indexOf('const getPaymentBadge'),
    )
    // confirmed should be handled (not absent), and map to Approved label
    expect(badgeBlock).toContain("case 'confirmed'")
    expect(badgeBlock).not.toContain("label: 'confirmed'")
  })

  it('Approved and legacy confirmed share the Approved badge', () => {
    const badgeBlock = source.slice(
      source.indexOf('const getStatusBadge'),
      source.indexOf('const getPaymentBadge'),
    )
    // The two cases should be adjacent with no return between them
    const approvedIdx = badgeBlock.indexOf("case 'approved'")
    const confirmedIdx = badgeBlock.indexOf("case 'confirmed'")
    // confirmed must appear near approved (within 100 chars)
    expect(Math.abs(approvedIdx - confirmedIdx)).toBeLessThan(100)
  })

  it('pending status displays as New', () => {
    expect(source).toContain("case 'pending'")
    expect(source).toContain("label: 'New'")
  })

  it('rejected status displays as Declined', () => {
    expect(source).toContain("case 'rejected'")
    expect(source).toContain("label: 'Declined'")
  })
})

describe('ApplicantsTab — ticket code', () => {
  it('Applicant interface includes ticket_code field', () => {
    const interfaceBlock = source.slice(
      source.indexOf('interface Applicant'),
      source.indexOf('interface ApplicantsTabProps'),
    )
    expect(interfaceBlock).toContain('ticket_code')
  })

  it('ticket_code is mapped from API submission data', () => {
    expect(source).toContain('ticket_code: submission.ticket_code')
  })

  it('detail panel uses ticket_code with application_code as fallback', () => {
    // The copy button and display should prefer ticket_code, falling back to application_code
    expect(source).toContain('selectedApplicant.ticket_code || selectedApplicant.application_code')
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
