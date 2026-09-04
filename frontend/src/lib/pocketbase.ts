import PocketBase from 'pocketbase';

const isLocalPocketBaseHost = (value: string | undefined) => {
  if (!value) return false;

  try {
    const { hostname } = new URL(value);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname.endsWith('.localhost');
  } catch {
    return false;
  }
};

export function getPocketBaseBaseUrl(): string {
  const configuredUrl =
    process.env.POCKETBASE_URL ||
    process.env.NEXT_PUBLIC_POCKETBASE_URL ||
    process.env.NEXT_PUBLIC_POCKETBASE_PUBLIC_URL ||
    'http://127.0.0.1:8090';

  const publicUrl =
    process.env.NEXT_PUBLIC_POCKETBASE_URL ||
    process.env.NEXT_PUBLIC_POCKETBASE_PUBLIC_URL ||
    '';

  if (isLocalPocketBaseHost(configuredUrl) && publicUrl && !isLocalPocketBaseHost(publicUrl)) {
    return publicUrl.trim().replace(/\/+$/, '');
  }

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
  const adminToken = process.env.POCKETBASE_ADMIN_TOKEN;
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL || process.env.POCKETBASE_EMAIL || process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD || process.env.POCKETBASE_PASSWORD || process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  if (!adminToken && (!adminEmail || !adminPassword)) {
    console.error('PocketBase admin credentials are missing; Stripe verification cannot persist payment status or email logs.');
    return null;
  }

  const adminPb = new PocketBase(getPocketBaseBaseUrl());

  try {
    if (adminToken) {
      adminPb.authStore.save(adminToken, null);
    } else {
      await adminPb.admins.authWithPassword(adminEmail!, adminPassword!);
    }
    return adminPb;
  } catch (error) {
    console.error('PocketBase admin authentication failed:', error);
    return null;
  }
}

export async function updateOrderRecord(orderId: string, payload: Record<string, unknown>) {
  const adminPb = await getAdminPocketBaseClient();

  if (!adminPb) {
    return null;
  }

  try {
    return await adminPb.collection('orders').update(orderId, payload);
  } catch (error) {
    console.error('PocketBase order update failed:', error);
    return null;
  }
}

type PocketBaseFileRecord = {
  id?: string | number;
  collectionId?: string | number;
  collection_id?: string | number;
};

export function getImageUrl(
  record: object | null | undefined,
  fileName: string | null | undefined,
): string {
  if (!fileName) return '/placeholder.png';

  const value = String(fileName).trim();

  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) {
    return value;
  }

  const recordLike = record as Partial<PocketBaseFileRecord> | null | undefined;
  const publicBaseUrl = getPublicPocketBaseUrl();
  const collectionId = recordLike?.collectionId ?? recordLike?.collection_id ?? 'unknown';
  const recordId = recordLike?.id ?? 'unknown';

  const safeCollectionId = String(collectionId);
  const safeRecordId = String(recordId);

  if (publicBaseUrl && /^(https?:)?\/\//i.test(publicBaseUrl)) {
    const normalizedBase = publicBaseUrl.replace(/\/+$/, '');
    return `${normalizedBase}/api/files/${encodeURIComponent(safeCollectionId)}/${encodeURIComponent(safeRecordId)}/${encodeURIComponent(value)}`;
  }

  const params = new URLSearchParams({
    collectionId: safeCollectionId,
    recordId: safeRecordId,
    fileName: value,
  });

  return `/api/pocketbase/files?${params.toString()}`;
}