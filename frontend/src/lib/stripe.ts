import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_LIVE_SECRET_KEY;
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SIGNING_SECRET;

export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2026-08-26.dahlia' }) : null;

export const isStripeConfigured = Boolean(stripe);
export const stripePublishableKeyValue = stripePublishableKey || null;
export const stripeWebhookSecretValue = stripeWebhookSecret || null;

export const getStripeCheckoutUrl = () => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return appUrl.replace(/\/+$/, '');
};
