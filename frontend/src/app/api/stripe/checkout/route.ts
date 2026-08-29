import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { getStripeCheckoutUrl, stripe } from '@/lib/stripe';

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

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
    const cleanAmount = typeof body?.amount === 'number' ? body.amount : Number(String(body?.amount ?? 0).replace(/[^\d.-]/g, ''));
    const amount = Number.isFinite(cleanAmount) ? Math.round(cleanAmount) : 0;
    const customerEmail = String(body?.customerEmail || '').trim();
    const customerName = String(body?.customerName || 'Vásárló').trim() || 'Vásárló';

    if (!orderId || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Érvénytelen rendelés vagy összeg a Stripe fizetéshez.' }, { status: 400 });
    }

    if (amount < 175) {
      return NextResponse.json(
        { error: `A Stripe fizetéshez minimum 175 Ft szükséges. A jelenlegi összeg: ${amount} Ft.` },
        { status: 400 },
      );
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
            unit_amount: amount,
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

    await pb.collection('orders').update(orderId, {
      payment_status: 'pending',
      status: 'pending',
      stripe_session_id: session.id,
    });

    return NextResponse.json({ ok: true, url: session.url }, { status: 200 });
  } catch (error) {
    console.error('Stripe checkout creation failed:', error);
    return NextResponse.json({ error: 'A Stripe fizetési session létrehozása sikertelen volt.' }, { status: 500 });
  }
}
