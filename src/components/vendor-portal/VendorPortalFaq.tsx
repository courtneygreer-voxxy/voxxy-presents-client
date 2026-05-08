import type { EventDetails } from '@/types/eventPortal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CircleHelp } from 'lucide-react';
import { VendorPortalSection } from '@/components/vendor-portal/VendorPortalSection';

type FormatDateFn = (dateString: string | null) => string;

type FaqDefinition = {
  id: string;
  question: string;
  when?: (event: EventDetails) => boolean;
  answer: string | ((event: EventDetails, formatDate: FormatDateFn) => string);
};

const FAQ_DEFINITIONS: FaqDefinition[] = [
  {
    id: 'what-is-portal',
    question: 'What is this portal?',
    answer:
      'This is your home base for the event: dates and location, booth fees and payment (when applicable), and notes from the organizer. Sign in with the same email you used on your application.',
  },
  {
    id: 'application-status',
    question: 'How do I check my application or payment status?',
    answer:
      'The organizer may email you directly with decisions or requests. On this page you can confirm deadlines, your category, and whether a payment link is available. For questions about your specific application, contact the organizer.',
  },
  {
    id: 'application-deadline',
    question: 'When is the application deadline?',
    answer: (ev, formatDate) =>
      ev.application_deadline
        ? `Applications should be submitted by ${formatDate(ev.application_deadline)} unless the organizer tells you otherwise.`
        : "If an application deadline appears under Event details on this page, use that date. Otherwise follow the timeline in your emails from the organizer.",
  },
  {
    id: 'payment-deadline',
    question: 'When is payment due?',
    answer: (ev, formatDate) =>
      ev.payment_deadline
        ? `The payment deadline shown on this portal is ${formatDate(ev.payment_deadline)}. If you have a payment link on your category, complete checkout before that date unless the organizer gives different instructions.`
        : 'When payment is required, complete it before any deadline shown under Event details. If your category includes a payment link, you’ll find it in Your booth & payment below.',
  },
  {
    id: 'install-times',
    question: 'When is load-in or booth setup?',
    answer:
      'Load-in and setup depend on your category. Check the notes under your category in Your booth & payment, and watch for organizer announcements below. If you’re unsure, reach out to the organizer.',
  },
  {
    id: 'contact-organizer',
    question: 'Who do I contact with questions?',
    answer: ev => {
      const name = ev.organization?.name?.trim();
      const email = ev.organization?.email?.trim();
      if (name && email) {
        return `${name} runs this event. Reach them at ${email}.`;
      }
      if (name) {
        return `${name} runs this event. Use the contact information from your confirmation emails to reach the organizer.`;
      }
      return 'The event organizer manages vendor communication. Use the contact information from your confirmation emails, or any links the organizer shared with you.';
    },
  },
];

function resolveAnswer(
  def: FaqDefinition,
  event: EventDetails,
  formatDate: FormatDateFn
): string {
  return typeof def.answer === 'function' ? def.answer(event, formatDate) : def.answer;
}

export interface VendorPortalFaqProps {
  event: EventDetails;
  formatDate: FormatDateFn;
}

export function VendorPortalFaq({ event, formatDate }: VendorPortalFaqProps) {
  const items = FAQ_DEFINITIONS.filter(def => (def.when ? def.when(event) : true));

  return (
    <VendorPortalSection
      title="Frequently asked questions"
      description="Quick answers about deadlines, payment, and who to contact—expand any row for details."
      icon={CircleHelp}
    >
      <Accordion
        type="single"
        collapsible
        className="w-full divide-y divide-purple-200/40 rounded-2xl border border-purple-200/35 bg-violet-50/40 px-2 dark:divide-purple-500/15 dark:border-purple-500/20 dark:bg-purple-950/25 md:px-3"
      >
        {items.map(def => (
          <AccordionItem key={def.id} value={def.id} className="border-0">
            <AccordionTrigger className="min-h-[3rem] py-4 text-left text-sm font-medium text-foreground hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 focus-visible:ring-offset-2 md:py-5 md:text-base [&[data-state=open]]:text-purple-950 dark:[&[data-state=open]]:text-purple-100">
              {def.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground md:text-base">
              {resolveAnswer(def, event, formatDate)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </VendorPortalSection>
  );
}
