import { Pencil, Calendar, MapPin, Clock, DollarSign, Mail, Users, Tag } from 'lucide-react';
import { WizardStepProps, SUPPORTED_CURRENCIES, PAYMENT_ENGINES } from '../types';
import { CategoryBadge } from '@/components/shared/CategoryBadge';

interface Step6Props extends WizardStepProps {
  onStepClick: (step: number) => void;
}

export default function Step6ReviewDetails({ wizardState, onStepClick }: Step6Props) {
  const { eventDetails, applicationDetails, paymentConfiguration, automaticMessages, inviteList } = wizardState;

  const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === paymentConfiguration.currency);
  const currencySymbol = currencyInfo?.symbol || '$';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not set';
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    try {
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const SectionHeader = ({ title, step, icon: Icon }: { title: string; step: number; icon: React.ElementType }) => (
    <div className="flex items-center justify-between pb-2 border-b border-border mb-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <button
        type="button"
        onClick={() => onStepClick(step)}
        className="flex items-center gap-1 px-2 py-1 text-xs rounded-md text-foreground/60 hover:text-foreground hover:bg-background/10 transition-all"
        title={`Edit ${title}`}
      >
        <Pencil className="w-3 h-3" />
        Edit
      </button>
    </div>
  );

  const DetailRow = ({ label, value }: { label: string; value?: string | null }) => {
    if (!value) return null;
    return (
      <div className="flex justify-between py-1">
        <span className="text-xs text-foreground/60">{label}</span>
        <span className="text-xs text-foreground font-medium text-right max-w-[60%]">{value}</span>
      </div>
    );
  };

  const totalContacts = inviteList.invitedContactIds.length;
  const hasLists = inviteList.selectedListIds.length > 0;

  return (
    <div className="space-y-4">
      <div className="bg-background/5 backdrop-blur-sm rounded-xl p-5 border border-border">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">Review Event Details</h2>
          <p className="text-foreground/60 text-xs mt-0.5">
            Review all details before creating your event. Click "Edit" on any section to make changes.
          </p>
        </div>

        {/* Section 1: Event Details */}
        <div className="mb-5">
          <SectionHeader title="Event Details" step={1} icon={Calendar} />
          <DetailRow label="Event Name" value={eventDetails.title} />
          {eventDetails.description && <DetailRow label="Description" value={eventDetails.description} />}
          <DetailRow label="Event Date" value={formatDate(eventDetails.event_date)} />
          {eventDetails.event_end_date && <DetailRow label="End Date" value={formatDate(eventDetails.event_end_date)} />}
          {(eventDetails.start_time || eventDetails.end_time) && (
            <DetailRow
              label="Time"
              value={[formatTime(eventDetails.start_time), formatTime(eventDetails.end_time)].filter(Boolean).join(' - ')}
            />
          )}
          {eventDetails.venue && <DetailRow label="Venue" value={eventDetails.venue} />}
          <DetailRow label="Location" value={eventDetails.location} />
          {eventDetails.age_restriction && <DetailRow label="Age Restriction" value={eventDetails.age_restriction} />}
          {eventDetails.ticket_link && <DetailRow label="Ticket Link" value={eventDetails.ticket_link} />}
          <DetailRow label="Application Deadline" value={formatDate(eventDetails.application_deadline)} />
        </div>

        {/* Section 2: Applicant Categories */}
        <div className="mb-5">
          <SectionHeader title="Applicant Categories" step={2} icon={Tag} />
          {applicationDetails.applications.length === 0 ? (
            <p className="text-xs text-foreground/50 italic">No categories selected</p>
          ) : (
            <div className="space-y-2">
              {applicationDetails.applications.map(app => (
                <div key={app.id} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                  <CategoryBadge
                    category={{
                      id: app.category_id || 0,
                      organization_id: 0,
                      name: app.category_name || app.name,
                      color: app.category_color,
                      icon: app.category_icon,
                      created_at: '',
                      updated_at: '',
                    }}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    {app.description && (
                      <p className="text-xs text-foreground/60 truncate">{app.description}</p>
                    )}
                    {(app.install_date || app.install_start_time) && (
                      <p className="text-xs text-foreground/50">
                        Install: {formatDate(app.install_date)}
                        {app.install_start_time && ` ${formatTime(app.install_start_time)}`}
                        {app.install_end_time && ` - ${formatTime(app.install_end_time)}`}
                      </p>
                    )}
                    {app.application_tags && app.application_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {app.application_tags.map((tag, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Payment Configuration */}
        <div className="mb-5">
          <SectionHeader title="Payment Configuration" step={3} icon={DollarSign} />
          <DetailRow label="Currency" value={`${currencyInfo?.symbol} ${currencyInfo?.label} (${paymentConfiguration.currency})`} />
          <DetailRow label="Payment Deadline" value={formatDate(paymentConfiguration.payment_deadline)} />

          {/* Event-Level Payment Methods */}
          {(paymentConfiguration.payment_engines || []).length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-foreground/60">Payment Methods: </span>
              <span className="text-xs text-foreground font-medium">
                {(paymentConfiguration.payment_engines || []).map(e => {
                  const engineDef = PAYMENT_ENGINES.find(eng => eng.value === e.engine);
                  return engineDef?.label || e.engine;
                }).join(', ')}
              </span>
            </div>
          )}

          {applicationDetails.applications.length > 0 && (
            <div className="mt-3 space-y-3">
              {applicationDetails.applications.map(app => (
                <div key={app.id} className="bg-background/5 rounded-lg p-3 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: app.category_color || '#9054e3' }}
                    />
                    <span className="text-xs font-medium text-foreground">{app.category_name || app.name}</span>
                  </div>

                  {/* Payment Prices */}
                  {app.payment_prices.length > 0 ? (
                    <div className="space-y-1">
                      {app.payment_prices.map((price, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-foreground/60">{price.label}</span>
                          <span className="text-foreground font-medium">
                            {price.is_percentage ? `${price.amount}%` : `${currencySymbol}${Number(price.amount || 0).toFixed(2)}`}
                            {price.early_bird_deadline && (
                              <span className="text-foreground/40 ml-1">(by {formatDate(price.early_bird_deadline)})</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-foreground/40 italic">No fees configured</p>
                  )}

                  {/* Payment Link */}
                  {app.payment_link && (
                    <div className="mt-1 text-xs text-foreground/50 truncate">
                      Payment link: {app.payment_link}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Email Configuration */}
        <div className="mb-5">
          <SectionHeader title="Email Configuration" step={4} icon={Mail} />
          <DetailRow
            label="Event-Wide Template"
            value={automaticMessages.email_campaign_template_id ? `Template #${automaticMessages.email_campaign_template_id}` : 'Default'}
          />
          <DetailRow
            label="Category Strategy"
            value={
              automaticMessages.use_universal_category_template
                ? 'Universal (same for all categories)'
                : automaticMessages.use_category_templates
                  ? 'Category-specific (different per category)'
                  : 'Default'
            }
          />
        </div>

        {/* Section 5: Invite List */}
        <div>
          <SectionHeader title="Invite List" step={5} icon={Users} />
          {totalContacts > 0 ? (
            <DetailRow label="Contacts Selected" value={`${totalContacts} contacts`} />
          ) : hasLists ? (
            <DetailRow label="Contact Lists" value={`${inviteList.selectedListIds.length} list(s) selected`} />
          ) : (
            <p className="text-xs text-foreground/50 italic">
              No contacts selected yet. You can invite contacts after creating the event.
            </p>
          )}
          {inviteList.excludedContactIds.length > 0 && (
            <DetailRow label="Excluded" value={`${inviteList.excludedContactIds.length} contacts excluded`} />
          )}
        </div>
      </div>
    </div>
  );
}
