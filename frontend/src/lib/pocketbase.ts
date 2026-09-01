import PocketBase from 'pocketbase';

export function getPocketBaseBaseUrl(): string {
  const configuredUrl =
    process.env.POCKETBASE_URL ||
    process.env.NEXT_PUBLIC_POCKETBASE_URL ||
    process.env.NEXT_PUBLIC_POCKETBASE_PUBLIC_URL ||
    'http://127.0.0.1:8090';

  return configuredUrl.trim().replace(/\/+$/, '');
}

export function getPublicPocketBaseUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_POCKETBASE_URL ||
    process.env.NEXT_PUBLIC_POCKETBASE_PUBLIC_URL ||
    getPocketBaseBaseUrl();

  return configuredUrl.trim().replace(/\/+$/, '');
}

const pocketbaseUrl = getPocketBaseBaseUrl();

export const pb = new PocketBase(pocketbaseUrl);

export async function getAdminPocketBaseClient() {
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL || process.env.POCKETBASE_EMAIL || process.env.ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD || process.env.POCKETBASE_PASSWORD || process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return null;
  }

  const adminPb = new PocketBase(getPocketBaseBaseUrl());

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

export function getImageUrl(record: Record<string, unknown> | null | undefined, fileName: string): string {
  if (!fileName) return '/placeholder.png';

  const value = String(fileName).trim();

  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) {
    return value;
  }

  const publicBaseUrl = getPublicPocketBaseUrl();
  const collectionId = record?.collectionId ?? record?.collection_id ?? 'unknown';
  const recordId = record?.id ?? 'unknown';

  if (publicBaseUrl && /^(https?:)?\/\//i.test(publicBaseUrl)) {
    const normalizedBase = publicBaseUrl.replace(/\/+$/, '');
    return `${normalizedBase}/api/files/${encodeURIComponent(collectionId)}/${encodeURIComponent(recordId)}/${encodeURIComponent(value)}`;
  }

  const params = new URLSearchParams({
    collectionId,
    recordId,
    fileName: value,
  });

  return `/api/pocketbase/files?${params.toString()}`;
}