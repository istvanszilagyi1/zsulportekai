import { NextResponse } from 'next/server';
import { getStripeCheckoutUrl, stripe } from '@/lib/stripe';
import { updateOrderRecord } from '@/lib/pocketbase';

const parseStripeAmount = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value);
  }

  if (typeof value === 'string') {
    const normalized = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(normalized) ? Math.round(normalized) : 0;
  }

  return 0;
};

export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'A Stripe beállítás nincs konfigurálva. Add meg a STRIPE_SECRET_KEY és NEXT_PUBLIC_APP_URL értékeit.' },
        { status: 500 },
      );
    }

    const body = await request.json();
    const orderId = String(body?.orderId || '').trim();
    const amount = parseStripeAmount(body?.amount);
    const customerEmail = String(body?.customerEmail || '').trim();
    const customerName = String(body?.customerName || 'Vásárló').trim() || 'Vásárló';

    if (!orderId || amount <= 0) {
      return NextResponse.json({ error: 'Érvénytelen rendelés vagy összeg a Stripe fizetéshez.' }, { status: 400 });
    }

    const allowedOrigin = getStripeCheckoutUrl();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'huf',
            product_data: {
              name: `Zsül Portékái rendelés #${orderId}`,
              description: `${customerName} megrendelése`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail || undefined,
      payment_method_types: ['card'],
      metadata: {
        orderId,
      },
      success_url: `${allowedOrigin}/order-success?id=${encodeURIComponent(orderId)}&payment=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${allowedOrigin}/checkout?payment_cancelled=1`,
    });

    await updateOrderRecord(orderId, {
      payment_status: 'pending',
      status: 'pending',
      stripe_session_id: session.id,
    });

    return NextResponse.json({ ok: true, url: session.url }, { status: 200 });
  } catch (error) {
    console.error('Stripe checkout creation failed:', error);

    const message = error instanceof Error ? error.message : 'Ismeretlen Stripe hiba';
    const stripeError = typeof error === 'object' && error && 'type' in error ? error : null;

    console.error('Stripe error details:', {
      message,
      type: stripeError && 'type' in stripeError ? stripeError.type : undefined,
      code: stripeError && 'code' in stripeError ? stripeError.code : undefined,
      param: stripeError && 'param' in stripeError ? stripeError.param : undefined,
      raw: stripeError && 'raw' in stripeError ? stripeError.raw : undefined,
    });

    return NextResponse.json({ error: 'A Stripe fizetési session létrehozása sikertelen volt.', details: message }, { status: 500 });
  }
}
