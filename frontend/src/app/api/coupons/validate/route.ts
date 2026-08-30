import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = (searchParams.get('code') ?? '').trim();

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Hiányzó kuponkód.' }, { status: 400 });
    }

    const records = await pb.collection('coupons').getFullList({
      filter: `code = "${code.toUpperCase()}" && active = true`,
      sort: '-created',
    });

    const coupon = records[0];
    if (!coupon) {
      return NextResponse.json({ valid: false, error: 'Érvénytelen vagy inaktív kuponkód.' }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: String(coupon.code || '').toUpperCase(),
        discount_percent: Number(coupon.discount_percent ?? 0),
        description: coupon.description ?? '',
      },
    });
  } catch (error) {
    console.error('Coupon validation failed:', error);
    return NextResponse.json({ valid: false, error: 'A kupon ellenőrzése sikertelen volt.' }, { status: 500 });
  }
}
