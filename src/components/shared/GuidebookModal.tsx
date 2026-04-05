import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Users, Tag, Mail, Calendar, BookOpen } from 'lucide-react';

// --- Page content ---

interface GuidePage {
  section: string;
  title: string;
  content: React.ReactNode;
}

const GUIDE_PAGES: GuidePage[] = [
  // ── Welcome ──
  {
    section: 'Welcome',
    title: 'Welcome to Voxxy Presents',
    content: (
      <div className="space-y-3">
        <p>
          Voxxy Presents helps you manage vendor markets and fairs from one
          dashboard. This guide walks you through the key features so you can
          get up and running quickly.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Users, label: 'Network', desc: 'Import & organize vendors' },
            { icon: Tag, label: 'Categories', desc: 'Group vendors by type' },
            { icon: Mail, label: 'Emails', desc: 'Automated communications' },
            { icon: Calendar, label: 'Events', desc: 'Create & manage markets' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/5 border border-white/10">
              <Icon className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">{label}</p>
                <p className="text-[11px] text-white/50">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-white/50 text-[11px] italic">
          Use the arrows below to navigate, or click a section on the left.
        </p>
      </div>
    ),
  },

  // ── Network: Import Contacts ──
  {
    section: 'Network',
    title: 'Importing Contacts',
    content: (
      <div className="space-y-3">
        <p>
          The <strong>Network</strong> tab is your vendor database. Start by
          importing your existing contacts.
        </p>
        <ol className="space-y-2 text-white/80">
          <li className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] flex items-center justify-center font-bold">1</span>
            <span>Go to the <strong>Network</strong> tab in the sidebar.</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] flex items-center justify-center font-bold">2</span>
            <span>Click <strong>Import CSV</strong> to upload a spreadsheet of vendors.</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] flex items-center justify-center font-bold">3</span>
            <span>Map your columns (name, email, phone, category) and confirm.</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] flex items-center justify-center font-bold">4</span>
            <span>You can also click <strong>Add Contact</strong> to add vendors one at a time.</span>
          </li>
        </ol>
        <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-[11px] text-blue-300">
            <strong>Tip:</strong> If you're migrating from a Google Sheet, export
            it as CSV first — the importer handles most common column names
            automatically.
          </p>
        </div>
      </div>
    ),
  },

  // ── Network: Edit & Manage Contacts ──
  {
    section: 'Network',
    title: 'Editing & Managing Contacts',
    content: (
      <div className="space-y-3">
        <p>
          Click any contact row to view their details. From there you can:
        </p>
        <ul className="space-y-1.5">
          {[
            'Update name, email, phone, or business name',
            'Assign or change their vendor category',
            'Add notes or tags for internal organization',
            'View their event history and application status',
          ].map((item, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
              <span className="text-white/80">{item}</span>
            </li>
          ))}
        </ul>
        <p>
          Use the <strong>search bar</strong> at the top to quickly find a
          contact by name, email, or business. Filters let you narrow by
          category, tags, or status.
        </p>
      </div>
    ),
  },

  // ── Network: Lists ──
  {
    section: 'Network',
    title: 'Creating Lists',
    content: (
      <div className="space-y-3">
        <p>
          Lists let you group contacts for targeted outreach. There are two
          types:
        </p>
        <div className="space-y-2">
          <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs font-semibold text-purple-300 mb-1">Smart Lists</p>
            <p className="text-[11px] text-white/60">
              Auto-update based on rules you set (e.g. "all contacts tagged
              'returning vendor'"). Members update automatically as contacts
              change.
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs font-semibold text-blue-300 mb-1">Manual Lists</p>
            <p className="text-[11px] text-white/60">
              Hand-pick specific contacts. Great for VIP vendors, priority
              invites, or custom groups that don't follow a pattern.
            </p>
          </div>
        </div>
        <p className="text-white/80">
          To create a list, go to <strong>Network → Lists</strong> tab and click
          <strong> New List</strong>.
        </p>
      </div>
    ),
  },

  // ── Categories: Overview ──
  {
    section: 'Categories',
    title: 'What Are Categories?',
    content: (
      <div className="space-y-3">
        <p>
          Categories define the types of vendors at your events — like "Food
          Vendor", "Artisan", "Jewelry", or "Live Music".
        </p>
        <p>They are used in three key places:</p>
        <div className="space-y-2">
          <div className="flex gap-2 items-start p-2.5 rounded-lg bg-white/5 border border-white/10">
            <Calendar className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-white">Event Creation</p>
              <p className="text-[11px] text-white/60">
                When setting up an event, you choose which categories are
                accepting applications. Each category gets its own booth price
                and application link.
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-start p-2.5 rounded-lg bg-white/5 border border-white/10">
            <Users className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-white">Contact Assignments</p>
              <p className="text-[11px] text-white/60">
                Assign a category to any contact in your network. This helps
                you filter and find vendors by type.
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-start p-2.5 rounded-lg bg-white/5 border border-white/10">
            <Mail className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-white">Targeted Emails</p>
              <p className="text-[11px] text-white/60">
                Send category-specific emails — for example, "Food Vendor
                Setup Instructions" that only food vendors receive.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // ── Categories: Creating ──
  {
    section: 'Categories',
    title: 'Creating & Managing Categories',
    content: (
      <div className="space-y-3">
        <ol className="space-y-2 text-white/80">
          <li className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] flex items-center justify-center font-bold">1</span>
            <span>Go to <strong>Network → Categories</strong> tab.</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] flex items-center justify-center font-bold">2</span>
            <span>Click <strong>Add Category</strong> and enter a name (e.g. "Food Vendor").</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] flex items-center justify-center font-bold">3</span>
            <span>Optionally pick a color and icon to make it easy to spot.</span>
          </li>
        </ol>
        <p>
          Once created, categories appear automatically in the event creation
          wizard, in the contact editor, and in email targeting options.
        </p>
        <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-[11px] text-blue-300">
            <strong>Tip:</strong> Keep category names short and consistent. They
            appear on public application forms, so "Food & Beverage" reads better
            than "food_vendors_category_1".
          </p>
        </div>
      </div>
    ),
  },

  // ── Emails: Overview ──
  {
    section: 'Emails',
    title: 'How Email Automation Works',
    content: (
      <div className="space-y-3">
        <p>
          Each event comes with a full <strong>email sequence</strong> — a set
          of automated emails that send at the right time throughout your
          event lifecycle.
        </p>
        <p className="text-white/70">
          Emails are organized into five groups:
        </p>
        <div className="space-y-1.5">
          {[
            { label: 'Event Announcements', desc: 'Invitations and application opens', color: 'text-purple-300' },
            { label: 'Application Updates', desc: 'Approvals, rejections, waitlist notices', color: 'text-pink-300' },
            { label: 'Payment Reminders', desc: 'Booth fees, deadlines, and overdue alerts', color: 'text-blue-300' },
            { label: 'Event Countdown', desc: 'Setup instructions and final reminders', color: 'text-green-300' },
            { label: 'Post-Event', desc: 'Thank you notes and follow-ups', color: 'text-yellow-300' },
          ].map(({ label, desc, color }) => (
            <div key={label} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5">
              <span className={`text-xs font-semibold ${color}`}>{label}</span>
              <span className="text-[11px] text-white/40">— {desc}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  // ── Emails: Types ──
  {
    section: 'Emails',
    title: 'Email Types & Triggers',
    content: (
      <div className="space-y-3">
        <p>Every email has a <strong>trigger</strong> that determines when it sends:</p>
        <div className="space-y-2">
          <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs font-semibold text-green-300 mb-1">Event-Based (Instant)</p>
            <p className="text-[11px] text-white/60">
              Send immediately when something happens — a vendor applies, gets
              approved, makes a payment, or you post a bulletin.
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs font-semibold text-blue-300 mb-1">Time-Based (Scheduled)</p>
            <p className="text-[11px] text-white/60">
              Send on a specific date — like 7 days before the event, on the
              payment deadline, or 3 days after the event. All scheduled
              emails send at 8:00 AM Eastern.
            </p>
          </div>
        </div>
        <p className="text-white/80">
          You can <strong>pause</strong> any email to temporarily stop it,
          <strong> resume</strong> it later, or <strong>send it now</strong>{' '}
          manually (once your event is live).
        </p>
      </div>
    ),
  },

  // ── Emails: Category vs Universal ──
  {
    section: 'Emails',
    title: 'Category vs. Universal Emails',
    content: (
      <div className="space-y-3">
        <p>Emails can target all vendors or just specific categories:</p>
        <div className="space-y-2">
          <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <p className="text-xs font-semibold text-purple-300 mb-1">Universal Emails</p>
            <p className="text-[11px] text-white/60">
              Sent to <em>every</em> vendor regardless of category. Use these
              for event-wide announcements, general reminders, and post-event
              follow-ups.
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs font-semibold text-blue-300 mb-1">Category-Specific Emails</p>
            <p className="text-[11px] text-white/60">
              Sent only to vendors in a particular category. Perfect for
              tailored setup instructions, category-specific pricing, or
              booth assignment details.
            </p>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-[11px] text-yellow-300">
            <strong>Note:</strong> Invitation and announcement emails are always
            universal — category targeting becomes available for emails sent
            after a vendor applies.
          </p>
        </div>
      </div>
    ),
  },

  // ── Emails: Variables ──
  {
    section: 'Emails',
    title: 'Using Personalization Tags',
    content: (
      <div className="space-y-3">
        <p>
          Make emails personal by inserting <strong>tags</strong> that auto-fill
          with each vendor's info when sent.
        </p>
        <p className="text-white/70">
          In the email editor, click any tag in the sidebar to insert it.
          Tags use bracket format:
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { tag: '[firstName]', desc: 'Vendor first name' },
            { tag: '[businessName]', desc: 'Business name' },
            { tag: '[eventName]', desc: 'Your event title' },
            { tag: '[eventDate]', desc: 'Event date' },
            { tag: '[vendorCategory]', desc: 'Their category' },
            { tag: '[paymentLink]', desc: 'Payment URL' },
            { tag: '[boothPrice]', desc: 'Booth cost' },
            { tag: '[installDate]', desc: 'Setup date' },
          ].map(({ tag, desc }) => (
            <div key={tag} className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/5">
              <code className="text-[10px] text-purple-300 font-mono">{tag}</code>
              <span className="text-[10px] text-white/40">{desc}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-white/50">
          The editor shows a live preview so you can see exactly how the email
          will look before sending.
        </p>
      </div>
    ),
  },

  // ── Events: Overview ──
  {
    section: 'Events',
    title: 'Creating an Event',
    content: (
      <div className="space-y-3">
        <p>
          Events are the core of Voxxy Presents. Each event represents a
          vendor market or fair you're organizing.
        </p>
        <ol className="space-y-2 text-white/80">
          <li className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] flex items-center justify-center font-bold">1</span>
            <span>Click <strong>Create New Event</strong> from the Events page.</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] flex items-center justify-center font-bold">2</span>
            <span>Fill in event details: name, date, venue, location, and description.</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] flex items-center justify-center font-bold">3</span>
            <span>Set up application categories — choose which vendor types you'll accept and set booth prices.</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] flex items-center justify-center font-bold">4</span>
            <span>Your event starts as a <strong>Draft</strong>. Go live when you're ready to start accepting applications.</span>
          </li>
        </ol>
      </div>
    ),
  },

  // ── Events: Command Center ──
  {
    section: 'Events',
    title: 'Managing Your Event',
    content: (
      <div className="space-y-3">
        <p>
          Once created, click <strong>Command Center</strong> to manage every
          aspect of your event from one place.
        </p>
        <div className="space-y-2">
          {[
            {
              tab: 'Home',
              desc: 'Event overview, quick stats, and Go Live controls. This is where you publish your event and send out initial invitations.',
            },
            {
              tab: 'Vendors',
              desc: 'Review applications, approve or decline vendors, update payment status, and change vendor categories.',
            },
            {
              tab: 'Mail',
              desc: 'Your email automation hub. View all scheduled emails, open the sequence editor, check the audit log for delivery tracking.',
            },
            {
              tab: 'Settings',
              desc: 'Edit event details, manage application categories, access shareable links, and export data.',
            },
          ].map(({ tab, desc }) => (
            <div key={tab} className="p-2.5 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs font-semibold text-white mb-0.5">{tab}</p>
              <p className="text-[11px] text-white/60">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  // ── Events: Email Sequence ──
  {
    section: 'Events',
    title: 'Your Event Email Sequence',
    content: (
      <div className="space-y-3">
        <p>
          Every event generates a full <strong>email sequence</strong> automatically.
          Open the <strong>Sequence Editor</strong> from the Mail tab to see all
          emails organized by category.
        </p>
        <p className="text-white/70">From the sequence editor you can:</p>
        <ul className="space-y-1.5">
          {[
            'Preview and edit any email in the sequence',
            'Pause emails you don\'t need right now',
            'Create new custom emails for specific situations',
            'Delete emails that don\'t apply to your event',
            'Send test emails to yourself before going live',
          ].map((item, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
              <span className="text-white/80">{item}</span>
            </li>
          ))}
        </ul>
        <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-[11px] text-blue-300">
            <strong>Tip:</strong> Check the <strong>Audit Log</strong> after
            sending to track deliveries, bounces, and opens. You can retry
            failed sends with one click.
          </p>
        </div>
      </div>
    ),
  },

  // ── Events: Bulletins ──
  {
    section: 'Events',
    title: 'Bulletins & Updates',
    content: (
      <div className="space-y-3">
        <p>
          Need to send a quick update to all your vendors? Use <strong>Bulletins</strong>.
        </p>
        <p className="text-white/70">
          Bulletins are one-off announcements you post from the Command Center.
          When you post a bulletin, vendors with "bulletin" email notifications
          enabled receive it automatically.
        </p>
        <p className="text-white/70">
          Common uses:
        </p>
        <ul className="space-y-1.5">
          {[
            'Weather updates or schedule changes',
            'Parking and load-in instructions',
            'Last-minute vendor spot openings',
            'Post-event thank you messages',
          ].map((item, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
              <span className="text-white/80">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
];

// --- Section navigation ---

const SECTIONS = ['Welcome', 'Network', 'Categories', 'Emails', 'Events'] as const;

const SECTION_ICONS: Record<string, React.ElementType> = {
  Welcome: BookOpen,
  Network: Users,
  Categories: Tag,
  Emails: Mail,
  Events: Calendar,
};

// --- Component ---

interface GuidebookModalProps {
  open: boolean;
  onClose: () => void;
}

export function GuidebookModal({ open, onClose }: GuidebookModalProps) {
  const [pageIndex, setPageIndex] = useState(0);

  if (!open) return null;

  const page = GUIDE_PAGES[pageIndex];
  const isFirst = pageIndex === 0;
  const isLast = pageIndex === GUIDE_PAGES.length - 1;

  // Build section → first page index map
  const sectionStartIndex: Record<string, number> = {};
  GUIDE_PAGES.forEach((p, i) => {
    if (!(p.section in sectionStartIndex)) {
      sectionStartIndex[p.section] = i;
    }
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-[680px] max-w-[95vw] max-h-[85vh] bg-gray-900 border border-white/15 rounded-2xl shadow-2xl shadow-purple-500/10 flex overflow-hidden">
        {/* Left sidebar - section nav */}
        <div className="hidden sm:flex flex-col w-44 bg-white/5 border-r border-white/10 py-4">
          <div className="px-4 mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white tracking-wide">GUIDE</span>
            </div>
          </div>
          <nav className="flex-1 space-y-0.5 px-2">
            {SECTIONS.map((section) => {
              const Icon = SECTION_ICONS[section];
              const isActiveSection = page.section === section;
              return (
                <button
                  key={section}
                  onClick={() => setPageIndex(sectionStartIndex[section])}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActiveSection
                      ? 'bg-purple-600/30 text-purple-300'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {section}
                </button>
              );
            })}
          </nav>
          <div className="px-4 pt-3 border-t border-white/10">
            <p className="text-[10px] text-white/30 text-center">
              {pageIndex + 1} / {GUIDE_PAGES.length}
            </p>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div>
              <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider mb-0.5">
                {page.section}
              </p>
              <h2 className="text-base font-bold text-white">{page.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close guide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-white/80 leading-relaxed">
            {page.content}
          </div>

          {/* Footer nav */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
            <button
              onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
              disabled={isFirst}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-white/5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>

            {/* Mobile section label */}
            <span className="sm:hidden text-[10px] text-white/30">
              {pageIndex + 1} / {GUIDE_PAGES.length}
            </span>

            {/* Progress dots (desktop) */}
            <div className="hidden sm:flex items-center gap-1">
              {GUIDE_PAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPageIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === pageIndex ? 'bg-purple-400' : 'bg-white/15 hover:bg-white/30'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                if (isLast) {
                  onClose();
                } else {
                  setPageIndex(pageIndex + 1);
                }
              }}
              className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
            >
              {isLast ? 'Done' : 'Next'}
              {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
