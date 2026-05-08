import { useState } from 'react';
import { Plus, X, Zap, DollarSign, CreditCard, Smartphone, Ticket, Banknote, CircleDot } from 'lucide-react';
import {
  WizardStepProps,
  ApplicationRow,
  PaymentPriceEntry,
  PaymentPriceType,
  PaymentEngine,
  PaymentEngineConfig,
  CurrencyCode,
  SUPPORTED_CURRENCIES,
  PAYMENT_PRICE_TYPES,
  PAYMENT_ENGINES,
} from '../types';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { isDevOrStaging } from '@/config/environments';
import { DebugPanel } from '../../DebugPanel';

interface Step3Props extends WizardStepProps {
  organizationId: number;
  standalone?: boolean;
}

const ENGINE_ICONS: Record<string, React.ReactNode> = {
  ticket: <Ticket className="w-4 h-4" />,
  'credit-card': <CreditCard className="w-4 h-4" />,
  'dollar-sign': <DollarSign className="w-4 h-4" />,
  smartphone: <Smartphone className="w-4 h-4" />,
  zap: <Zap className="w-4 h-4" />,
  banknote: <Banknote className="w-4 h-4" />,
  circle: <CircleDot className="w-4 h-4" />,
};

export default function Step3PaymentConfig({
  wizardState,
  updateWizardState,
  errors,
  setErrors,
  isAdmin,
  organizationId,
  standalone = false,
}: Step3Props) {
  const { applicationDetails, paymentConfiguration } = wizardState;
  const [openFeeDropdown, setOpenFeeDropdown] = useState<string | null>(null);

  const currencySymbol = SUPPORTED_CURRENCIES.find(c => c.code === paymentConfiguration.currency)?.symbol || '$';

  // ─── Update Helpers ──────────────────────────────────────────────────

  const updatePaymentConfig = (updates: Partial<typeof paymentConfiguration>) => {
    updateWizardState({
      paymentConfiguration: { ...paymentConfiguration, ...updates },
    });
  };

  const updateApplication = (appId: string, updates: Partial<ApplicationRow>) => {
    const updatedApps = applicationDetails.applications.map(app =>
      app.id === appId ? { ...app, ...updates } : app
    );
    updateWizardState({
      applicationDetails: { applications: updatedApps },
    });

    // Clear related errors
    Object.keys(errors).forEach(key => {
      if (key.includes(appId)) {
        const newErrors = { ...errors };
        delete newErrors[key];
        setErrors(newErrors);
      }
    });
  };

  // ─── Payment Price Handlers ──────────────────────────────────────────

  const addPaymentPrice = (appId: string, type: PaymentPriceType) => {
    const app = applicationDetails.applications.find(a => a.id === appId);
    if (!app) return;

    const priceType = PAYMENT_PRICE_TYPES.find(p => p.value === type);
    const newEntry: PaymentPriceEntry = {
      type,
      label: priceType?.label || type,
      amount: 0,
      is_percentage: priceType?.isPercentage || false,
    };

    updateApplication(appId, {
      payment_prices: [...app.payment_prices, newEntry],
    });
  };

  const removePaymentPrice = (appId: string, index: number) => {
    const app = applicationDetails.applications.find(a => a.id === appId);
    if (!app) return;

    const updated = app.payment_prices.filter((_, i) => i !== index);
    // Also update the legacy booth_price field
    const boothEntry = updated.find(p => p.type === 'booth_price');
    updateApplication(appId, {
      payment_prices: updated,
      booth_price: boothEntry?.amount || 0,
    });
  };

  const updatePaymentPrice = (appId: string, index: number, updates: Partial<PaymentPriceEntry>) => {
    const app = applicationDetails.applications.find(a => a.id === appId);
    if (!app) return;

    const updated = app.payment_prices.map((entry, i) =>
      i === index ? { ...entry, ...updates } : entry
    );
    // Sync legacy booth_price
    const boothEntry = updated.find(p => p.type === 'booth_price');
    updateApplication(appId, {
      payment_prices: updated,
      booth_price: boothEntry?.amount || app.booth_price,
    });
  };

  // ─── Event-Level Payment Engine Handlers ───────────────────────────

  const toggleEngine = (engine: PaymentEngine) => {
    const existing = (paymentConfiguration.payment_engines || []).find(e => e.engine === engine);
    if (existing) {
      updatePaymentConfig({
        payment_engines: (paymentConfiguration.payment_engines || []).filter(e => e.engine !== engine),
      });
    } else {
      const engineDef = PAYMENT_ENGINES.find(e => e.value === engine);
      const newConfig: PaymentEngineConfig = {
        engine,
        label: engineDef?.label || engine,
        collect_app_code: false,
      };
      updatePaymentConfig({
        payment_engines: [...(paymentConfiguration.payment_engines || []), newConfig],
      });
    }
  };

  // ─── Available Price Types (with limits) ────────────────────────────
  // Max 3 early birds, max 1 of each other type per category

  const getAvailablePriceTypes = (appId: string) => {
    const app = applicationDetails.applications.find(a => a.id === appId);
    const existing = app?.payment_prices || [];

    return PAYMENT_PRICE_TYPES.filter(pt => {
      if (pt.value === 'custom') return false;

      const count = existing.filter(p => p.type === pt.value).length;
      if (pt.value === 'early_bird_price') return count < 3;
      return count < 1;
    });
  };

  // ─── Dev Prefill ─────────────────────────────────────────────────────

  const handlePrefill = () => {
    const eventDate = wizardState.eventDetails.event_date
      ? new Date(wizardState.eventDetails.event_date)
      : new Date();
    const paymentDeadline = new Date(eventDate);
    paymentDeadline.setDate(eventDate.getDate() - 7);
    const today = new Date();
    if (paymentDeadline < today) {
      paymentDeadline.setDate(today.getDate() + 3);
    }

    const earlyBirdDeadline = new Date(eventDate);
    earlyBirdDeadline.setDate(eventDate.getDate() - 21);
    if (earlyBirdDeadline < today) {
      earlyBirdDeadline.setDate(today.getDate() + 7);
    }

    // Update payment config with engines at event level
    updatePaymentConfig({
      currency: 'USD',
      payment_deadline: paymentDeadline.toISOString().split('T')[0],
      payment_engines: [
        { engine: 'eventbrite', label: 'Eventbrite', collect_app_code: false },
        { engine: 'venmo', label: 'Venmo', collect_app_code: false },
      ],
    });

    // Update each application with sample payment data
    const updatedApps = applicationDetails.applications.map((app, idx) => ({
      ...app,
      booth_price: [350, 200, 500][idx] || 200,
      payment_link: 'https://www.eventbrite.com/e/sample-event',
      payment_prices: [
        { type: 'booth_price' as const, label: 'Booth Fee', amount: [350, 200, 500][idx] || 200, is_percentage: false },
        ...(idx === 0 ? [{ type: 'early_bird_price' as const, label: 'Early Bird Rate', amount: 275, is_percentage: false, early_bird_deadline: earlyBirdDeadline.toISOString().split('T')[0] }] : []),
        ...(idx === 1 ? [{ type: 'percentage_of_sales' as const, label: 'Commission on Sales', amount: 10, is_percentage: true, description: '10% of all art sales' }] : []),
      ],
      payment_engines: [],
    }));

    updateWizardState({
      applicationDetails: { applications: updatedApps },
    });

    setErrors({});
  };

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* DEV: Prefill Button */}
      {!standalone && isDevOrStaging() && (
        <div className="rounded-lg border border-amber-400/60 bg-amber-50 p-3 dark:border-yellow-500/35 dark:bg-yellow-500/10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-700 dark:text-yellow-400 shrink-0" />
              <span className="text-xs font-medium text-amber-950 dark:text-yellow-200">Dev Mode</span>
            </div>
            <button
              onClick={handlePrefill}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors border border-amber-600/40 bg-amber-100 text-amber-950 hover:bg-amber-200/90 dark:border-yellow-500/40 dark:bg-yellow-500/20 dark:text-yellow-100 dark:hover:bg-yellow-500/30"
            >
              Prefill Payment Data
            </button>
          </div>
        </div>
      )}

      {/* Event-Level Settings */}
      <div className="space-y-4">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">Payment Configuration</h2>
          <p className="text-foreground/60 text-xs mt-0.5">
            Set the currency, payment methods, and pricing for each applicant category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Currency Selector */}
          <div>
            <label className="block text-xs text-foreground/80 font-medium mb-1.5">
              Event Currency
            </label>
            <select
              value={paymentConfiguration.currency}
              onChange={(e) => updatePaymentConfig({ currency: e.target.value as CurrencyCode })}
              className="w-full px-3 py-2 text-sm rounded-lg bg-background/10 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            >
              {SUPPORTED_CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.label} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Deadline */}
          <div>
            <label className="block text-xs text-foreground/80 font-medium mb-1.5">
              Payment Deadline <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={paymentConfiguration.payment_deadline || ''}
              onChange={(e) => {
                const newDeadline = e.target.value;
                updatePaymentConfig({ payment_deadline: newDeadline });
                if (newDeadline) {
                  const d = new Date(newDeadline);
                  d.setDate(d.getDate() - 1);
                  const earlyBirdDefault = d.toISOString().split('T')[0];
                  applicationDetails.applications.forEach((app) => {
                    app.payment_prices.forEach((entry, idx) => {
                      if (entry.type === 'early_bird_price' && !entry.early_bird_deadline) {
                        updatePaymentPrice(app.id, idx, { early_bird_deadline: earlyBirdDefault });
                      }
                    });
                  });
                }
              }}
              className={`w-full px-3 py-2 text-sm rounded-lg bg-background/10 border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                errors.payment_deadline ? 'border-red-500' : 'border-border'
              }`}
            />
            {errors.payment_deadline && (
              <p className="mt-1 text-xs text-red-400">{errors.payment_deadline}</p>
            )}
          </div>
        </div>

        {/* Payment Methods (Event-Level) */}
        <div className="space-y-3 pt-2">
          <label className="text-xs text-foreground/80 font-medium">Payment Methods</label>
          <p className="text-xs text-foreground/50 -mt-2">
            How will applicants pay? Select one or more payment methods for this event.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {PAYMENT_ENGINES.map(engine => {
              const isSelected = (paymentConfiguration.payment_engines || []).some(e => e.engine === engine.value);
              return (
                <button
                  key={engine.value}
                  type="button"
                  onClick={() => toggleEngine(engine.value)}
                  className={`
                    px-3 py-2.5 rounded-lg border-2 transition-all text-left flex items-center gap-2
                    ${isSelected
                      ? 'border-primary bg-primary/20 shadow-lg shadow-primary/10'
                      : 'border-border bg-background/5 hover:border-border hover:bg-background/10'
                    }
                  `}
                >
                  <span className={`${isSelected ? 'text-primary' : 'text-foreground/60'}`}>
                    {ENGINE_ICONS[engine.icon] || <CircleDot className="w-4 h-4" />}
                  </span>
                  <span className={`text-xs font-medium ${isSelected ? 'text-foreground' : 'text-foreground/70'}`}>
                    {engine.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* No categories message */}
      {applicationDetails.applications.length === 0 && (
        <div className="bg-background/5 rounded-xl p-8 border border-border text-center">
          <p className="text-sm text-foreground/60">No applicant categories selected yet.</p>
          {!standalone && <p className="text-xs text-foreground/40 mt-1">Go back to Step 2 to select categories first.</p>}
        </div>
      )}

      {/* Per-Category Payment Config */}
      {applicationDetails.applications.map((app) => (
        <div
          key={app.id}
          className="bg-background/5 rounded-xl p-5 border border-border space-y-4 overflow-visible"
        >
          {/* Category Header */}
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <CategoryBadge
              category={{
                id: app.category_id || 0,
                organization_id: organizationId,
                name: app.category_name || app.name,
                color: app.category_color,
                icon: app.category_icon,
                created_at: '',
                updated_at: '',
              }}
              size="md"
            />
          </div>

          {/* Payment Types Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-foreground/80 font-medium">Fee Types</label>
              {/* Add Payment Type Dropdown — click-based, allows multiples */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenFeeDropdown(openFeeDropdown === app.id ? null : app.id)}
                  className="px-3 py-1.5 text-xs rounded-lg voxxy-btn-solid transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Fee Type
                </button>
                {openFeeDropdown === app.id && (
                  <>
                    <div className="fixed inset-0 z-[90]" onClick={() => setOpenFeeDropdown(null)} />
                    <div className="absolute right-0 top-full mt-1 w-64 bg-card border border-border rounded-lg shadow-xl z-[91] overflow-hidden">
                      {getAvailablePriceTypes(app.id).length === 0 ? (
                        <div className="px-4 py-3 text-xs text-foreground/50">
                          All fee types have been added.
                        </div>
                      ) : (
                        getAvailablePriceTypes(app.id).map(pt => (
                          <button
                            key={pt.value}
                            type="button"
                            onClick={() => { addPaymentPrice(app.id, pt.value); setOpenFeeDropdown(null); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-background/10 transition-colors"
                          >
                            <p className="text-sm font-medium text-foreground">{pt.label}</p>
                            <p className="text-xs text-foreground/50">{pt.description}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment Price Entries */}
            {app.payment_prices.length === 0 && (
              <div className="py-4 text-center border border-dashed border-border rounded-lg">
                <p className="text-xs text-foreground/50">No fee types configured. Click "Add Fee Type" above.</p>
              </div>
            )}

            {app.payment_prices.map((entry, index) => (
              <div
                key={`${entry.type}-${index}`}
                className="bg-background/5 rounded-lg p-3 border border-border space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-foreground/60" />
                    <span className="text-sm font-medium text-foreground">{entry.label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePaymentPrice(app.id, index)}
                    className="p-1 rounded hover:bg-background/20 text-foreground/50 hover:text-red-400 transition-colors"
                    title="Remove fee type"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-3 items-start">
                  {/* Amount Input */}
                  <div className="flex-1">
                    <label className="block text-xs text-foreground/60 mb-1">
                      {entry.is_percentage ? 'Percentage' : 'Amount'} *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60 text-sm">
                        {entry.is_percentage ? '' : currencySymbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step={entry.is_percentage ? '0.1' : '0.01'}
                        max={entry.is_percentage ? 100 : undefined}
                        value={entry.amount || ''}
                        onChange={(e) => updatePaymentPrice(app.id, index, { amount: parseFloat(e.target.value) || 0 })}
                        placeholder={entry.is_percentage ? '10' : '150.00'}
                        className={`w-full ${entry.is_percentage ? 'px-3' : 'pl-8 pr-3'} py-2 text-sm rounded-lg bg-background/10 border ${
                          errors[`payment_${app.id}_${index}`] ? 'border-red-500' : 'border-border'
                        } text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                      />
                      {entry.is_percentage && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 text-sm">%</span>
                      )}
                    </div>
                    {errors[`payment_${app.id}_${index}`] && (
                      <p className="mt-1 text-xs text-red-500">{errors[`payment_${app.id}_${index}`]}</p>
                    )}
                  </div>

                  {/* Early Bird Deadline (only for early_bird_price) */}
                  {entry.type === 'early_bird_price' && (
                    <div className="flex-1">
                      <label className="block text-xs text-foreground/60 mb-1">
                        Early Bird Deadline *
                      </label>
                      <input
                        type="date"
                        value={entry.early_bird_deadline || ''}
                        onChange={(e) => updatePaymentPrice(app.id, index, { early_bird_deadline: e.target.value })}
                        className={`w-full px-3 py-2 text-sm rounded-lg bg-background/10 border ${
                          errors[`payment_${app.id}_${index}_deadline`] ? 'border-red-500' : 'border-border'
                        } text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                      />
                      {errors[`payment_${app.id}_${index}_deadline`] && (
                        <p className="mt-1 text-xs text-red-500">{errors[`payment_${app.id}_${index}_deadline`]}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Description for percentage types */}
                {entry.is_percentage && (
                  <div>
                    <input
                      type="text"
                      value={entry.description || ''}
                      onChange={(e) => updatePaymentPrice(app.id, index, { description: e.target.value })}
                      placeholder="e.g., 10% commission on all sales"
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-background/10 border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Payment Link (per-category) */}
          <div>
            <label className="block text-xs text-foreground/80 font-medium mb-1.5">
              Payment Link
            </label>
            <input
              type="url"
              value={app.payment_link || ''}
              onChange={(e) => updateApplication(app.id, { payment_link: e.target.value })}
              placeholder="https://eventbrite.com/e/your-event or payment URL"
              className="w-full px-3 py-2 text-sm rounded-lg bg-background/10 border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Validation Error for category */}
          {errors[`payment_category_${app.id}`] && (
            <p className="text-xs text-red-500">{errors[`payment_category_${app.id}`]}</p>
          )}
        </div>
      ))}

      {/* Debug Panel */}
      <DebugPanel
        title="Step 3: Payment Configuration"
        data={{
          paymentConfiguration,
          applications: applicationDetails.applications.map(app => ({
            name: app.name,
            payment_prices: app.payment_prices,
            payment_link: app.payment_link,
          })),
          errors,
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
}
