/**
 * EmailAuditActionMenu - Status-based action menu for audit entries
 *
 * Different menu items based on delivery status:
 * - delivered: Contact Support
 * - bounced (soft): Retry Send (disabled), Contact Support
 * - bounced (hard): Edit Email & Resend (disabled), Contact Support
 * - unsubscribed: Remove from Network (disabled), Delete Contact (disabled), Contact Support
 * - All others: Contact Support
 */

import { MoreVertical, HelpCircle, RefreshCw, Edit, UserX, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { AuditEntry } from '@/types/email';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface EmailAuditActionMenuProps {
  entry: AuditEntry;
  onContactSupport: (entry: AuditEntry) => void;
}

export function EmailAuditActionMenu({
  entry,
  onContactSupport,
}: EmailAuditActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Determine bounce type from entry data
  const isSoftBounce = entry.status === 'bounced' && entry.bounce_reason?.toLowerCase().includes('soft');
  const isHardBounce = entry.status === 'bounced' && !isSoftBounce;

  // Get menu items based on status
  const getMenuItems = () => {
    const items = [];

    switch (entry.status) {
      case 'bounced':
        if (isSoftBounce) {
          items.push({
            icon: RefreshCw,
            label: 'Retry Send',
            disabled: true,
            disabledReason: 'Coming Soon',
            onClick: () => console.log('Retry send:', entry),
          });
        } else {
          items.push({
            icon: Edit,
            label: 'Edit Email & Resend',
            disabled: true,
            disabledReason: 'Coming Soon',
            onClick: () => console.log('Edit and resend:', entry),
          });
        }
        break;

      case 'unsubscribed':
        items.push(
          {
            icon: UserX,
            label: 'Remove from Network',
            disabled: true,
            disabledReason: 'Coming Soon',
            onClick: () => console.log('Remove from network:', entry),
          },
          {
            icon: Trash2,
            label: 'Delete Contact',
            disabled: true,
            disabledReason: 'Coming Soon',
            onClick: () => console.log('Delete contact:', entry),
          }
        );
        break;

      case 'dropped':
        items.push({
          icon: Edit,
          label: 'Edit Email & Resend',
          disabled: true,
          disabledReason: 'Coming Soon',
          onClick: () => console.log('Edit and resend:', entry),
        });
        break;
    }

    // Only show Contact Support for undelivered emails (bounced or dropped)
    const isUndelivered = entry.status === 'bounced' || entry.status === 'dropped';

    if (isUndelivered) {
      if (items.length > 0) {
        items.push({ separator: true });
      }

      items.push({
        icon: HelpCircle,
        label: 'Contact Voxxy Support',
        disabled: false,
        onClick: () => {
          setIsOpen(false);
          onContactSupport(entry);
        },
      });
    }

    return items;
  };

  const menuItems = getMenuItems();

  // Don't show menu button if no items (for delivered, scheduled, etc.)
  if (menuItems.length === 0) {
    return <span className="text-white/40 text-xs">-</span>;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-white/10"
        >
          <MoreVertical className="w-4 h-4 text-white/60" />
          <span className="sr-only">Open actions menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {menuItems.map((item, index) => {
          if ('separator' in item) {
            return <DropdownMenuSeparator key={`separator-${index}`} />;
          }

          const Icon = item.icon;
          return (
            <DropdownMenuItem
              key={item.label}
              disabled={item.disabled}
              onClick={item.onClick}
              className={item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <Icon className="w-4 h-4 mr-2" />
              <span className="flex-1">{item.label}</span>
              {item.disabled && item.disabledReason && (
                <span className="text-xs text-muted-foreground ml-2">
                  {item.disabledReason}
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
