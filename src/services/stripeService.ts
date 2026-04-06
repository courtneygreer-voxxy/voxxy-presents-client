// Stripe subscription service for producer payments
import { getApiUrl } from '@/config/environments';
import { getAuthToken } from './api';

const API_BASE_URL = getApiUrl() || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface SubscriptionStatus {
  subscribed: boolean;
  subscription_active: boolean;
  requires_payment: boolean;
  status: string | null;
  display_status: string;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export interface BillingPortalResponse {
  url: string;
}

class StripeServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'StripeServiceError';
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new StripeServiceError(
      errorData.error || errorData.message || `Request failed with status ${response.status}`,
      response.status,
      errorData
    );
  }

  return response;
}

export const stripeService = {
  /**
   * Create a Stripe Checkout session for subscription payment
   * Redirects user to Stripe's hosted checkout page
   */
  createCheckoutSession: async (): Promise<CheckoutSessionResponse> => {
    const frontendUrl = window.location.origin;

    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/stripe/create_checkout_session`,
      {
        method: 'POST',
        body: JSON.stringify({
          frontend_url: frontendUrl
        })
      }
    );

    return response.json();
  },

  /**
   * Get the current subscription status for the authenticated user's organization
   */
  getSubscriptionStatus: async (): Promise<SubscriptionStatus> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/stripe/subscription_status`
    );

    return response.json();
  },

  /**
   * Create a billing portal session to manage subscription
   * Returns a URL to redirect the user to Stripe's billing portal
   */
  createBillingPortalSession: async (): Promise<BillingPortalResponse> => {
    const returnUrl = `${window.location.origin}/dashboard`;

    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/stripe/billing_portal?return_url=${encodeURIComponent(returnUrl)}`
    );

    return response.json();
  },

  /**
   * Redirect to Stripe Checkout
   * Creates a checkout session and immediately redirects to Stripe
   */
  redirectToCheckout: async (): Promise<void> => {
    try {
      const { url } = await stripeService.createCheckoutSession();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to redirect to checkout:', error);
      throw error;
    }
  },

  /**
   * Redirect to Stripe Billing Portal
   * Creates a billing portal session and immediately redirects
   */
  redirectToBillingPortal: async (): Promise<void> => {
    try {
      const { url } = await stripeService.createBillingPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to redirect to billing portal:', error);
      throw error;
    }
  }
};

export { StripeServiceError };
