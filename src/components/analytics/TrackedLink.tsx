import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { analytics } from '@/lib/analytics';

interface TrackedLinkProps extends LinkProps {
  trackingData: {
    link_text: string;
    destination_page: string;
    current_page: string;
    link_position: 'header' | 'footer' | 'inline' | 'hero' | 'cta_section' | 'features_section';
  };
  children: React.ReactNode;
}

export const TrackedLink: React.FC<TrackedLinkProps> = ({
  trackingData,
  onClick,
  children,
  ...linkProps
}) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Track the navigation
    analytics.trackNavigation(trackingData);

    // Call original onClick if provided
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Link {...linkProps} onClick={handleClick}>
      {children}
    </Link>
  );
};

// Component for external links
interface TrackedExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  trackingData: {
    destination: string;
    link_context: string;
    page_name: string;
  };
  children: React.ReactNode;
}

export const TrackedExternalLink: React.FC<TrackedExternalLinkProps> = ({
  trackingData,
  onClick,
  children,
  ...anchorProps
}) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Track external link click
    analytics.trackExternalClick(
      trackingData.destination,
      trackingData.link_context,
      trackingData.page_name
    );

    // Call original onClick if provided
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <a {...anchorProps} onClick={handleClick}>
      {children}
    </a>
  );
};

// Component for email links
interface TrackedEmailLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  email: string;
  pageName: string;
  children: React.ReactNode;
}

export const TrackedEmailLink: React.FC<TrackedEmailLinkProps> = ({
  email,
  pageName,
  onClick,
  children,
  ...anchorProps
}) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Track email click
    analytics.trackEmailClick(email, pageName);

    // Call original onClick if provided
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <a {...anchorProps} href={`mailto:${email}`} onClick={handleClick}>
      {children}
    </a>
  );
};