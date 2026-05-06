/**
 * EmailFooterCard
 *
 * Hard-coded footer card displayed in all email previews.
 * Shows standard Voxxy email footer information with styled card design.
 */

interface EmailFooterCardProps {
  organizationEmail?: string;
}

export default function EmailFooterCard({ organizationEmail = '[organizationEmail]' }: EmailFooterCardProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground dark:text-foreground/70 uppercase tracking-wide mb-2">
        Footer
      </label>
      <div className="bg-gradient-to-br from-primary/10 to-pink-500/10 rounded-lg p-4 border border-primary/20">
        <p className="text-foreground/80 text-xs leading-relaxed">
          <span className="block mb-2">Please do not reply to this email.</span>
          <span className="block mb-2">
            For questions, contact{' '}
            <span className="text-primary font-medium">{organizationEmail}</span>
          </span>
          <span className="block mb-2">
            <a href="#" className="text-primary hover:text-primary/70 underline transition-colors">
              Unsubscribe from these emails
            </a>
          </span>
          <span className="block text-foreground/60 text-[10px] mt-3">
            Powered by Voxxy
          </span>
        </p>
      </div>
    </div>
  );
}
