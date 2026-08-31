import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

const pb = new PocketBase(
  process.env.POCKETBASE_URL ||
    process.env.NEXT_PUBLIC_POCKETBASE_URL ||
    process.env.NEXT_PUBLIC_POCKETBASE_PUBLIC_URL ||
    'http://127.0.0.1:8090',
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    const recordId = searchParams.get('recordId');
    const fileName = searchParams.get('fileName');

    if (!collectionId || !recordId || !fileName) {
      return NextResponse.json({ error: 'Hiányzó fájlparaméterek.' }, { status: 400 });
    }

    const fileUrl = pb.files.getURL(
      { id: recordId, collectionId },
      fileName,
    );

    return NextResponse.redirect(fileUrl);
  } catch (error) {
    console.error('PocketBase file proxy failed:', error);
    return NextResponse.json({ error: 'A kép betöltése sikertelen volt.' }, { status: 500 });
  }
}
