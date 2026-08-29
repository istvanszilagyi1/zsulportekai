import PocketBase from 'pocketbase';

const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

// PocketBase kapcsolat inicializálása a VPS címeddel
export const pb = new PocketBase(pocketbaseUrl);

export async function getAdminPocketBaseClient() {
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL || process.env.POCKETBASE_EMAIL || process.env.ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD || process.env.POCKETBASE_PASSWORD || process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return null;
  }

  const adminPb = new PocketBase(pocketbaseUrl);

  try {
    await adminPb.admins.authWithPassword(adminEmail, adminPassword);
    return adminPb;
  } catch (error) {
    console.error('PocketBase admin authentication failed:', error);
    return null;
  }
}

export async function updateOrderRecord(orderId: string, payload: Record<string, unknown>) {
  const adminPb = await getAdminPocketBaseClient();

  if (!adminPb) {
    console.warn('PocketBase admin credentials are missing; skipping order update for Stripe flow.', { orderId, payload });
    return null;
  }

  try {
    return await adminPb.collection('orders').update(orderId, payload);
  } catch (error) {
    console.error('PocketBase order update failed:', error);
    return null;
  }
}

// Segédfüggvény: PocketBase kép URL generálása
export function getImageUrl(record: any, fileName: string): string {
  if (!fileName) return '/placeholder.png';
  return pb.files.getURL(record, fileName);
}