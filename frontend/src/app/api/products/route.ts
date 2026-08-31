import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

const pb = new PocketBase(
  process.env.POCKETBASE_URL ||
    process.env.NEXT_PUBLIC_POCKETBASE_URL ||
    process.env.NEXT_PUBLIC_POCKETBASE_PUBLIC_URL ||
    'http://127.0.0.1:8090',
);

export async function GET() {
  try {
    const records = await pb.collection('products').getFullList({ sort: '-created' });

    return NextResponse.json(records);
  } catch (error) {
    console.error('Failed to fetch products from PocketBase:', error);
    return NextResponse.json(
      { error: 'A termékek betöltése sikertelen volt.' },
      { status: 500 },
    );
  }
}
