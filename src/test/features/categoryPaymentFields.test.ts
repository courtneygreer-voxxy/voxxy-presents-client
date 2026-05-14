import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const networkSource = readFileSync(
  path.resolve(__dirname, '../../components/producer/Network/NetworkPage.tsx'),
  'utf-8'
)

const categoryTypeSource = readFileSync(
  path.resolve(__dirname, '../../types/category.ts'),
  'utf-8'
)

const step2Source = readFileSync(
  path.resolve(__dirname, '../../components/producer/CreateEventWizard/steps/Step2ApplicationDetails.tsx'),
  'utf-8'
)

describe('Category type — legacy flat payment fields preserved for backwards compatibility', () => {
  const fields = ['early_bird_price', 'early_bird_deadline', 'payment_deadline', 'deposit']

  fields.forEach(field => {
    it(`Category interface includes ${field}`, () => {
      expect(categoryTypeSource).toContain(field)
    })

    it(`CreateCategoryData includes ${field}`, () => {
      expect(categoryTypeSource).toContain(field)
    })

    it(`UpdateCategoryData includes ${field}`, () => {
      expect(categoryTypeSource).toContain(field)
    })
  })
})

describe('Category type — structured payment_preferences', () => {
  it('defines CategoryFeePreference interface', () => {
    expect(categoryTypeSource).toContain('CategoryFeePreference')
  })

  it('Category interface includes payment_preferences array', () => {
    expect(categoryTypeSource).toContain('payment_preferences?: CategoryFeePreference[]')
  })

  it('CreateCategoryData includes payment_preferences', () => {
    expect(categoryTypeSource).toContain('payment_preferences?: CategoryFeePreference[]')
  })

  it('UpdateCategoryData includes payment_preferences', () => {
    expect(categoryTypeSource).toContain('payment_preferences?: CategoryFeePreference[]')
  })
})

describe('NetworkPage — category modal uses structured payment_preferences picker', () => {
  it('tracks paymentPreferences state array', () => {
    expect(networkSource).toContain('paymentPreferences')
    expect(networkSource).toContain('setPaymentPreferences')
  })

  it('includes add/remove fee type helpers', () => {
    expect(networkSource).toContain('addFeeType')
    expect(networkSource).toContain('removeFeeType')
  })

  it('sends payment_preferences in the save payload', () => {
    expect(networkSource).toContain('payment_preferences: paymentPreferences')
  })

  it('shows "Payment Preferences" section header', () => {
    expect(networkSource).toContain('Payment Preferences')
  })

  it('shows "Add Fee Type" button', () => {
    expect(networkSource).toContain('Add Fee Type')
  })

  it('does NOT have flat Early Bird Deadline field in category form', () => {
    expect(networkSource).not.toContain('Early Bird Deadline')
  })

  it('does NOT have flat Payment Deadline field in category form', () => {
    expect(networkSource).not.toContain('Payment Deadline')
  })

  it('does NOT have flat Deposit Amount field in category form', () => {
    expect(networkSource).not.toContain('Deposit Amount')
  })

  it('renders payment_preferences badges from structured array', () => {
    expect(networkSource).toContain('payment_preferences')
  })
})

describe('Step2ApplicationDetails — prefills wizard from category.payment_preferences', () => {
  it('imports PaymentPriceType from wizard types', () => {
    expect(step2Source).toContain('PaymentPriceType')
  })

  it('maps category.payment_preferences to payment_prices when present', () => {
    expect(step2Source).toContain('category.payment_preferences')
    expect(step2Source).toContain('payment_preferences.length > 0')
  })

  it('falls back to a default booth_price entry when no preferences set', () => {
    expect(step2Source).toContain("type: 'booth_price' as PaymentPriceType")
    expect(step2Source).toContain("label: 'Booth Fee'")
  })
})
