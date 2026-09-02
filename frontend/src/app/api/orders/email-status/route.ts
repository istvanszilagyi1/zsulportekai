import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { sendOrderStatusEmail } from '@/lib/email';

const pb = new PocketBase(process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = String(body?.orderId || '').trim();
    const status = String(body?.status || 'pending');

    if (!orderId) {
      return NextResponse.json({ error: 'Hiányzó rendelés azonosító.' }, { status: 400 });
    }

    const order = await pb.collection('orders').getOne(orderId).catch(() => null);
    if (!order) {
      return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
    }

    const allowedStatuses = ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'refunded'];
    const normalizedStatus = allowedStatuses.includes(status) ? status : 'pending';

    const emailResult = await sendOrderStatusEmail(
      {
        id: String(order.id),
        customer_name: String(order.customer_name || ''),
        customer_first_name: order.customer_first_name ? String(order.customer_first_name) : undefined,
        customer_last_name: order.customer_last_name ? String(order.customer_last_name) : undefined,
        customer_email: String(order.customer_email || ''),
        delivery_method: order.delivery_method === 'home_delivery' ? 'home_delivery' : 'foxpost',
        payment_method: order.payment_method === 'stripe' ? 'stripe' : 'bank_transfer',
        total_price: Number(order.total_price ?? 0),
        items: Array.isArray(order.items) ? order.items : [],
        foxpost_place_name: order.foxpost_place_name ? String(order.foxpost_place_name) : undefined,
        foxpost_place_address: order.foxpost_place_address ? String(order.foxpost_place_address) : undefined,
        shipping_address: order.shipping_address ? String(order.shipping_address) : undefined,
      },
      normalizedStatus as 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'refunded',
    );

    return NextResponse.json({ ok: true, email: emailResult, status: normalizedStatus }, { status: 200 });
  } catch (error) {
    console.error('Status email send failed:', error);
    return NextResponse.json({ error: 'A státusz e-mail küldése sikertelen volt.' }, { status: 500 });
  }
}
