import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2026-08-26.dahlia' }) : null;

export const isStripeConfigured = Boolean(stripe);

export const getStripeCheckoutUrl = () => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return appUrl.replace(/\/+$/, '');
};
