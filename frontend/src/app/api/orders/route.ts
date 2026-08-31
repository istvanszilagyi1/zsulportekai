import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { sendOrderEmails } from '@/lib/email';

const pb = new PocketBase(process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.customer_name || !body?.customer_email || !body?.customer_phone) {
      return NextResponse.json({ error: 'Hiányzó adatok a rendeléshez.' }, { status: 400 });
    }

    const customerFirstName = body.customer_first_name ? String(body.customer_first_name).trim() : '';
    const customerLastName = body.customer_last_name ? String(body.customer_last_name).trim() : '';
    const customerName = String(body.customer_name ?? [customerFirstName, customerLastName].filter(Boolean).join(' ')).trim();

    const orderPayload = {
      customer_name: customerName,
      customer_first_name: customerFirstName,
      customer_last_name: customerLastName,
      customer_email: String(body.customer_email).trim(),
      customer_phone: String(body.customer_phone).trim(),
      delivery_method: body.delivery_method === 'home_delivery' ? 'home_delivery' : 'foxpost',
      payment_method: body.payment_method === 'stripe' ? 'stripe' : 'bank_transfer',
      payment_status: body.payment_status === 'paid' ? 'paid' : 'pending',
      invoice_required: Boolean(body.invoice_required),
      invoice_company_name: body.invoice_company_name ? String(body.invoice_company_name).trim() : undefined,
      invoice_tax_number: body.invoice_tax_number ? String(body.invoice_tax_number).trim() : undefined,
      invoice_address: body.invoice_address ? String(body.invoice_address).trim() : undefined,
      invoice_email: body.invoice_email ? String(body.invoice_email).trim() : undefined,
      foxpost_place_id: body.foxpost_place_id ? String(body.foxpost_place_id).trim() : undefined,
      foxpost_place_name: body.foxpost_place_name ? String(body.foxpost_place_name).trim() : undefined,
      foxpost_place_address: body.foxpost_place_address ? String(body.foxpost_place_address).trim() : undefined,
      shipping_address: body.shipping_address ? String(body.shipping_address).trim() : undefined,
      total_price: Number(body.total_price ?? 0),
      status: body.status === 'paid' ? 'paid' : 'pending',
      items: Array.isArray(body.items) ? body.items : [],
    };

    const createdOrder = await pb.collection('orders').create(orderPayload as Record<string, unknown>);

    const emailPayload = {
      id: String(createdOrder.id),
      customer_name: orderPayload.customer_name,
      customer_first_name: orderPayload.customer_first_name,
      customer_last_name: orderPayload.customer_last_name,
      customer_email: orderPayload.customer_email,
      delivery_method: orderPayload.delivery_method as 'foxpost' | 'home_delivery',
      payment_method: orderPayload.payment_method as 'bank_transfer' | 'stripe',
      total_price: orderPayload.total_price,
      items: orderPayload.items,
      foxpost_place_name: orderPayload.foxpost_place_name,
      foxpost_place_address: orderPayload.foxpost_place_address,
      shipping_address: orderPayload.shipping_address,
    };

    await sendOrderEmails(emailPayload);

    return NextResponse.json({ ok: true, order: createdOrder }, { status: 201 });
  } catch (error) {
    console.error('Order creation failed:', error);
    return NextResponse.json({ error: 'A rendelés mentése sikertelen volt.' }, { status: 500 });
  }
}
