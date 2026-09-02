import { NextResponse } from 'next/server';
import { sendOrderStatusEmail } from '@/lib/email';
import { stripe } from '@/lib/stripe';
import { updateOrderRecord } from '@/lib/pocketbase';

type StripeSessionLike = {
  payment_status?: string | null;
  status?: string | null;
  payment_intent?: { status?: string | null } | string | null;
};

const isStripeSessionPaid = (session: StripeSessionLike) => {
  const paymentIntentStatus = typeof session.payment_intent === 'object' && session.payment_intent && 'status' in session.payment_intent
    ? String(session.payment_intent.status ?? '')
    : '';

  return session.payment_status === 'paid'
    || session.status === 'complete'
    || paymentIntentStatus === 'succeeded'
    || paymentIntentStatus === 'paid';
};

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

    const isPaid = isStripeSessionPaid(session);

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

export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'A Stripe beállítás nincs konfigurálva.' }, { status: 500 });
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SIGNING_SECRET;

    if (!webhookSecret || !signature) {
      return NextResponse.json({ error: 'A Stripe webhook nincs konfigurálva.' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (orderId) {
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
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Stripe webhook handling failed:', error);
    return NextResponse.json({ error: 'A Stripe webhook feldolgozása sikertelen volt.' }, { status: 400 });
  }
}
