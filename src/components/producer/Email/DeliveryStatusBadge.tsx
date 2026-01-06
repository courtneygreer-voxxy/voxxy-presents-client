import { CheckCircle2, XCircle, Clock, Send, Ban, UserX, Circle } from 'lucide-react';
import type { DeliveryStatus } from '@/types/email';

interface DeliveryStatusBadgeProps {
  status: DeliveryStatus;
  className?: string;
  showIcon?: boolean;
  showTooltip?: boolean;
}

const STATUS_CONFIG: Record<DeliveryStatus, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bgClass: string;
  textClass: string;
  iconClass: string;
  description: string;
}> = {
  pending: {
    label: 'Not Sent',
    icon: Circle,
    bgClass: 'bg-gray-500/10',
    textClass: 'text-gray-400',
    iconClass: 'text-gray-400',
    description: 'Email has not been sent yet'
  },
  queued: {
    label: 'Queued',
    icon: Clock,
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400',
    iconClass: 'text-blue-400',
    description: 'Email is queued for sending'
  },
  sent: {
    label: 'Sent',
    icon: Send,
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-400',
    iconClass: 'text-purple-400',
    description: 'Email has been sent to SendGrid'
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle2,
    bgClass: 'bg-green-500/10',
    textClass: 'text-green-400',
    iconClass: 'text-green-400',
    description: 'Email successfully delivered to recipient'
  },
  bounced: {
    label: 'Bounced',
    icon: XCircle,
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400',
    iconClass: 'text-red-400',
    description: 'Email bounced (hard or soft bounce)'
  },
  dropped: {
    label: 'Dropped',
    icon: Ban,
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400',
    iconClass: 'text-red-400',
    description: 'Email was dropped (e.g., previously unsubscribed)'
  },
  unsubscribed: {
    label: 'Unsubscribed',
    icon: UserX,
    bgClass: 'bg-gray-500/10',
    textClass: 'text-gray-400',
    iconClass: 'text-gray-400',
    description: 'Recipient unsubscribed from emails'
  }
};

export default function DeliveryStatusBadge({
  status,
  className = '',
  showIcon = true,
  showTooltip = true
}: DeliveryStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const badge = (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bgClass} ${config.textClass} ${className}`}
      title={showTooltip ? config.description : undefined}
    >
      {showIcon && <Icon className={`w-3.5 h-3.5 ${config.iconClass}`} />}
      {config.label}
    </span>
  );

  return badge;
}

// Export status config for use in other components
export { STATUS_CONFIG };
