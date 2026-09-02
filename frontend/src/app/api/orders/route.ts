import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { sendOrderEmails } from '@/lib/email';

const pb = new PocketBase(process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

const toOptionalText = (value: unknown) => {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
};

const toOptionalNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.customer_name || !body?.customer_email || !body?.customer_phone) {
      return NextResponse.json({ error: 'Hiányzó adatok a rendeléshez.' }, { status: 400 });
    }

    const customerFirstName = toOptionalText(body.customer_first_name) ?? '';
    const customerLastName = toOptionalText(body.customer_last_name) ?? '';
    const customerName = toOptionalText(body.customer_name) ?? [customerFirstName, customerLastName].filter(Boolean).join(' ');

    const orderPayload = {
      customer_name: customerName,
      customer_first_name: customerFirstName || undefined,
      customer_last_name: customerLastName || undefined,
      customer_email: toOptionalText(body.customer_email),
      customer_phone: toOptionalText(body.customer_phone),
      delivery_method: body.delivery_method === 'home_delivery' ? 'home_delivery' : 'foxpost',
      payment_method: body.payment_method === 'stripe' ? 'stripe' : 'bank_transfer',
      payment_status: 'pending',
      invoice_required: Boolean(body.invoice_required),
      invoice_company_name: toOptionalText(body.invoice_company_name),
      invoice_tax_number: toOptionalText(body.invoice_tax_number),
      invoice_address: toOptionalText(body.invoice_address),
      invoice_email: toOptionalText(body.invoice_email),
      foxpost_place_id: toOptionalText(body.foxpost_place_id),
      foxpost_place_name: toOptionalText(body.foxpost_place_name),
      foxpost_place_address: toOptionalText(body.foxpost_place_address),
      shipping_address: toOptionalText(body.shipping_address),
      coupon_code: toOptionalText(body.coupon_code)?.toUpperCase(),
      coupon_discount_percent: toOptionalNumber(body.coupon_discount_percent),
      coupon_discount_amount: toOptionalNumber(body.coupon_discount_amount),
      coupon_product_id: toOptionalText(body.coupon_product_id),
      coupon_product_title: toOptionalText(body.coupon_product_title),
      total_price: Number.isFinite(Number(body.total_price)) ? Number(body.total_price) : 0,
      status: 'pending',
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
