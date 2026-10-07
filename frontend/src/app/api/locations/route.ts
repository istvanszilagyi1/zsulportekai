import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

const pocketBaseUrl =
  process.env.POCKETBASE_URL ||
  process.env.NEXT_PUBLIC_POCKETBASE_URL ||
  process.env.NEXT_PUBLIC_POCKETBASE_PUBLIC_URL ||
  'http://127.0.0.1:8090';

export async function GET() {
  try {
    const pb = new PocketBase(pocketBaseUrl);
    const records = await pb.collection('locations').getFullList({
      filter: 'active = true',
      sort: 'category,sort_order,name',
    });

    return NextResponse.json(records, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Failed to fetch locations from PocketBase:', error);
    return NextResponse.json(
      { error: 'A helyszínek betöltése sikertelen volt.' },
      { status: 500 },
    );
  }
}
