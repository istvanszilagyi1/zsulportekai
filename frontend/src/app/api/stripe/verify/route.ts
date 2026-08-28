import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { stripe } from '@/lib/stripe';

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

export async function GET(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'A Stripe beállítás nincs konfigurálva.' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');
    const sessionId = searchParams.get('session_id');

    if (!orderId || !sessionId) {
      return NextResponse.json({ error: 'Hiányzó order_id vagy session_id.' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    const isPaid = session.payment_status === 'paid' || session.status === 'complete';

    if (isPaid) {
      await pb.collection('orders').update(orderId, {
        payment_status: 'paid',
        status: 'paid',
        stripe_session_id: session.id,
      });
    }

    return NextResponse.json({ ok: true, paid: isPaid, sessionId: session.id, orderId }, { status: 200 });
  } catch (error) {
    console.error('Stripe verification failed:', error);
    return NextResponse.json({ error: 'A Stripe fizetés ellenőrzése sikertelen volt.' }, { status: 500 });
  }
}
