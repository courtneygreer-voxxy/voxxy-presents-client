import { CheckCircle2, XCircle, Clock, Send, Ban, UserX, Circle } from 'lucide-react';
import type { DeliveryStatus } from '@/types/email';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DeliveryStatusBadgeProps {
  status: DeliveryStatus;
  className?: string;
  showIcon?: boolean;
  showTooltip?: boolean;
}

const STATUS_CONFIG: Record<DeliveryStatus, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: BadgeVariant;
  description: string;
}> = {
  scheduled: {
    label: 'Scheduled',
    icon: Clock,
    variant: 'tintBlueSoft',
    description: 'Email is scheduled to be sent'
  },
  pending: {
    label: 'Not Sent',
    icon: Circle,
    variant: 'tintMutedSoft',
    description: 'Email has not been sent yet'
  },
  queued: {
    label: 'Queued',
    icon: Clock,
    variant: 'tintBlueSoft',
    description: 'Email is queued for sending'
  },
  sent: {
    label: 'Sent',
    icon: Send,
    variant: 'tintPurpleSoft',
    description: 'Email has been sent to SendGrid'
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle2,
    variant: 'tintGreenSoft',
    description: 'Email successfully delivered to recipient'
  },
  bounced: {
    label: 'Bounced',
    icon: XCircle,
    variant: 'tintRedSoft',
    description: 'Email bounced (hard or soft bounce)'
  },
  dropped: {
    label: 'Dropped',
    icon: Ban,
    variant: 'tintRedSoft',
    description: 'Email was dropped (e.g., previously unsubscribed)'
  },
  unsubscribed: {
    label: 'Unsubscribed',
    icon: UserX,
    variant: 'tintMutedSoft',
    description: 'Recipient unsubscribed from emails'
  }
};

export default function DeliveryStatusBadge({
  status,
  className = '',
  showIcon = true,
  showTooltip = true
}: DeliveryStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['pending'];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn('gap-1.5 px-3 py-1 font-medium', className)}
      title={showTooltip ? config.description : undefined}
    >
      {showIcon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      {config.label}
    </Badge>
  );
}

export { STATUS_CONFIG };
