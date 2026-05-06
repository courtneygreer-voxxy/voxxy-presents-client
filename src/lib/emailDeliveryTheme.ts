export const EMAIL_HISTORY_ICON_CLASS = 'text-foreground/40 dark:text-foreground/30';
export const EMAIL_HISTORY_SUBJECT_CLASS = 'text-foreground/80 dark:text-foreground/70';
export const EMAIL_HISTORY_META_CLASS = 'text-foreground/55 dark:text-foreground/40';
export const EMAIL_HISTORY_RETRY_CLASS =
  'text-violet-700 hover:text-violet-800 dark:text-primary dark:hover:text-primary';

const EMAIL_DELIVERY_STATUS_CLASS_MAP: Record<string, string> = {
  delivered: 'text-emerald-700 dark:text-green-400',
  bounced: 'text-red-700 dark:text-red-400',
  dropped: 'text-orange-700 dark:text-orange-400',
  unsubscribed: 'text-yellow-800 dark:text-yellow-400',
};

export function getEmailDeliveryStatusTextClass(status?: string): string {
  if (!status) return 'text-foreground/50 dark:text-foreground/40';
  return EMAIL_DELIVERY_STATUS_CLASS_MAP[status] || 'text-foreground/50 dark:text-foreground/40';
}
