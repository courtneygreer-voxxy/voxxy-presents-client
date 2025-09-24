import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';

interface TrackedButtonProps extends ButtonProps {
  trackingData: {
    button_text: string;
    button_location: string;
    page_name: string;
    is_primary_cta?: boolean;
  };
  children: React.ReactNode;
}

export const TrackedButton: React.FC<TrackedButtonProps> = ({
  trackingData,
  onClick,
  children,
  ...buttonProps
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Track the CTA click
    analytics.trackCTAClick({
      button_text: trackingData.button_text,
      button_location: trackingData.button_location,
      page_name: trackingData.page_name,
      is_primary_cta: trackingData.is_primary_cta ?? false,
    });

    // Call original onClick if provided
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Button {...buttonProps} onClick={handleClick}>
      {children}
    </Button>
  );
};