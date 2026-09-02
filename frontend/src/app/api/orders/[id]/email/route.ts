import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { sendTransactionalEmail } from '@/lib/email';

const pb = new PocketBase(process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const to = String(body?.to || '').trim();
    const subject = String(body?.subject || 'Üzenet a rendeléshez').trim();
    const text = String(body?.text || '').trim();
    const replyTo = String(body?.replyTo || body?.reply_to || process.env.EMAIL_REPLY_TO || 'zsulportekai@gmail.com').trim();
    const fromAddress = String(body?.from || process.env.EMAIL_FROM || 'Zsül Portékái <noreply@zsulportekai.hu>').trim();

    if (!to || !text) {
      return NextResponse.json({ error: 'Hiányzó címzett vagy levél szöveg.' }, { status: 400 });
    }

    const emailResult = await sendTransactionalEmail({
      to,
      subject,
      text,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #201d1a;"><p>${text.replace(/\n/g, '<br />')}</p></div>`,
      replyTo,
      from: fromAddress,
    });

    if (!emailResult.sent) {
      throw new Error(emailResult.reason || 'Email delivery failed');
    }

    const order = await pb.collection('orders').getOne(id).catch(() => null);
    const sentAt = new Date().toISOString();

    return NextResponse.json({
      ok: true,
      sentAt,
      orderId: id,
      customer: order ? order.customer_name : null,
      provider: emailResult.provider,
    });
  } catch (error) {
    console.error('Order reply email failed:', error);
    return NextResponse.json({ error: 'A vevőnek küldött e-mail elküldése sikertelen volt.' }, { status: 500 });
  }
}
