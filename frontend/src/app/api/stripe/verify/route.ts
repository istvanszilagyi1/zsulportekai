import { NextResponse } from 'next/server';
import { sendOrderStatusEmail } from '@/lib/email';
import { stripe } from '@/lib/stripe';
import { updateOrderRecord } from '@/lib/pocketbase';

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
      const order = await updateOrderRecord(orderId, {
        payment_status: 'paid',
        status: 'paid',
        stripe_session_id: session.id,
      });

      if (order) {
        await sendOrderStatusEmail(
          {
            id: String(order.id),
            customer_name: order.customer_name,
            customer_first_name: order.customer_first_name,
            customer_last_name: order.customer_last_name,
            customer_email: order.customer_email,
            delivery_method: order.delivery_method,
            payment_method: order.payment_method,
            total_price: Number(order.total_price ?? 0),
            items: Array.isArray(order.items) ? order.items : [],
            foxpost_place_name: order.foxpost_place_name,
            foxpost_place_address: order.foxpost_place_address,
            shipping_address: order.shipping_address,
          },
          'paid',
        );
      }
    }

    return NextResponse.json({ ok: true, paid: isPaid, sessionId: session.id, orderId }, { status: 200 });
  } catch (error) {
    console.error('Stripe verification failed:', error);
    return NextResponse.json({ error: 'A Stripe fizetés ellenőrzése sikertelen volt.' }, { status: 500 });
  }
}
