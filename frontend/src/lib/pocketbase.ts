import PocketBase from 'pocketbase';

// PocketBase kapcsolat inicializálása a VPS címeddel
export const pb = new PocketBase(
  process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090'
);

// Segédfüggvény: PocketBase kép URL generálása
export function getImageUrl(record: any, fileName: string): string {
  if (!fileName) return '/placeholder.png';
  return pb.files.getURL(record, fileName);
}