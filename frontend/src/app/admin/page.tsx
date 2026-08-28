'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  Check,
  Clock3,
  CreditCard,
  Delete,
  Edit3,
  LockKeyhole,
  LogOut,
  MailCheck,
  Package,
  Search,
  ShieldCheck,
  ShoppingCart,
  Truck,
  X,
} from 'lucide-react';
import Header from '@/components/Header';
import { pb } from '@/lib/pocketbase';

const logoUrl =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000204-8933c8933e/450/Zs%C3%BCl%20port%C3%A9k%C3%A1i%20logo.webp?ph=4e95f92e87';

type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'refunded';
type PaymentStatus = 'pending' | 'paid' | 'refunded';

type OrderRecord = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_method: 'foxpost' | 'home_delivery';
  payment_method: 'bank_transfer' | 'stripe';
  payment_status: PaymentStatus;
  status: OrderStatus;
  total_price?: number;
  items?: Array<{ title?: string; quantity?: number; price?: number }>;
  foxpost_place_id?: string;
  foxpost_place_name?: string;
  foxpost_place_address?: string;
  shipping_address?: string;
  invoice_required?: boolean;
  invoice_company_name?: string;
  invoice_tax_number?: string;
  invoice_address?: string;
  invoice_email?: string;
  created?: string;
};

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'paid',
  'processing',
  'shipped',
  'completed',
  'cancelled',
  'refunded',
];

const ORDER_FILTER_OPTIONS = ['all', 'pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'refunded'] as const;
type StatusFilter = (typeof ORDER_FILTER_OPTIONS)[number];
const SHIPPED_STATUSES: OrderStatus[] = ['shipped', 'completed'];

const statusClasses: Record<OrderStatus, string> = {
  pending: 'bg-[#f3ebdd] text-[#7b5e2f]',
  paid: 'bg-[#eaf5eb] text-[#2a7b46]',
  processing: 'bg-[#e8f0ff] text-[#2955b1]',
  shipped: 'bg-[#f4e5ff] text-[#6c3dbb]',
  completed: 'bg-[#eaf7ef] text-[#1d7d51]',
  cancelled: 'bg-[#fbe9e7] text-[#9a3c2c]',
  refunded: 'bg-[#f6efe8] text-[#7a614e]',
};

const scopeStatusLabel: Record<OrderStatus, string> = {
  pending: 'Függőben',
  paid: 'Fizetve',
  processing: 'Feldolgozás alatt',
  shipped: 'Kiszállítva',
  completed: 'Teljesítve',
  cancelled: 'Stornózva',
  refunded: 'Visszatérítve',
};

const fmtMoney = (value?: number) => `${Number(value ?? 0).toLocaleString('hu-HU')} Ft`;

const getOrderStatusValue = (order: OrderRecord): OrderStatus => {
  if (order.status && ORDER_STATUS_OPTIONS.includes(order.status)) {
    return order.status;
  }

  if (order.payment_status === 'refunded') {
    return 'refunded';
  }

  if (order.payment_status === 'paid' || order.status === 'paid') {
    return 'paid';
  }

  return 'pending';
};

const derivePaymentStatus = (status: OrderStatus): PaymentStatus => {
  if (status === 'refunded') return 'refunded';
  if (['paid', 'processing', 'shipped', 'completed'].includes(status)) return 'paid';
  return 'pending';
};

const getStatusFilterLabel = (filter: StatusFilter) => {
  if (filter === 'all') return 'Összes';
  if (filter === 'pending') return 'Függőben';
  if (filter === 'paid') return 'Fizetve';
  if (filter === 'processing') return 'Feldolgozás';
  if (filter === 'shipped') return 'Kiszállítva';
  if (filter === 'completed') return 'Teljesítve';
  if (filter === 'cancelled') return 'Stornó';
  return 'Visszatérítés';
};

const getStatusMeta = (status: OrderStatus) => ({
  label: scopeStatusLabel[status],
  className: statusClasses[status],
});

export default function AdminPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderRecord | null>(null);

  const fetchOrders = async () => {
    setLoading(true);

    try {
      const records = await pb.collection('orders').getFullList({
        sort: '-created',
      });

      const normalized = (records as unknown as OrderRecord[]).map((order) => {
        const status = getOrderStatusValue(order);
        return {
          ...order,
          status,
          payment_status: order.payment_status ?? derivePaymentStatus(status),
        };
      });

      setOrders(normalized);
    } catch (error) {
      console.error('Admin megrendelések betöltése nem sikerült:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const authenticated = Boolean(pb.authStore.isValid && pb.authStore.model);
    setIsAuthenticated(authenticated);

    if (authenticated) {
      fetchOrders();
      return;
    }

    setLoading(false);
  }, []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      await pb.admins.authWithPassword(email.trim(), password);
      setIsAuthenticated(true);
      await fetchOrders();
    } catch (error) {
      console.error('PocketBase admin login failed:', error);
      setLoginError('A PocketBase admin bejelentkezés sikertelen. Ellenőrizd az e-mailt és a jelszót.');
      setIsAuthenticated(false);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
    setIsAuthenticated(false);
    setOrders([]);
    setSearch('');
    setPassword('');
    setEditingOrder(null);
  };

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    const targetOrder = orders.find((order) => order.id === orderId);
    if (!targetOrder) return;

    setUpdatingOrderId(orderId);

    try {
      const nextPaymentStatus = derivePaymentStatus(nextStatus);
      const updatedOrder = {
        ...targetOrder,
        status: nextStatus,
        payment_status: nextPaymentStatus,
      };

      await pb.collection('orders').update(orderId, {
        status: nextStatus,
        payment_status: nextPaymentStatus,
      });

      setOrders((current) => current.map((order) => (order.id === orderId ? updatedOrder : order)));
    } catch (error) {
      console.error('Rendelés állapot frissítése sikertelen:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;

    const confirmed = window.confirm(`Biztosan törlöd a(z) #${order.id} rendelést?`);
    if (!confirmed) return;

    try {
      await pb.collection('orders').delete(orderId);
      setOrders((current) => current.filter((item) => item.id !== orderId));
      if (editingOrder?.id === orderId) {
        setEditingOrder(null);
      }
    } catch (error) {
      console.error('Rendelés törlése sikertelen:', error);
      window.alert('A rendelés törlése sikertelen volt.');
    }
  };

  const handleSaveEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingOrder) return;

    try {
      const payload = {
        customer_name: editingOrder.customer_name,
        customer_email: editingOrder.customer_email,
        customer_phone: editingOrder.customer_phone,
        delivery_method: editingOrder.delivery_method,
        payment_method: editingOrder.payment_method,
        payment_status: editingOrder.payment_status,
        status: editingOrder.status,
        total_price: Number(editingOrder.total_price ?? 0),
        foxpost_place_id: editingOrder.foxpost_place_id ?? '',
        foxpost_place_name: editingOrder.foxpost_place_name ?? '',
        foxpost_place_address: editingOrder.foxpost_place_address ?? '',
        shipping_address: editingOrder.shipping_address ?? '',
        invoice_required: Boolean(editingOrder.invoice_required),
        invoice_company_name: editingOrder.invoice_company_name ?? '',
        invoice_tax_number: editingOrder.invoice_tax_number ?? '',
        invoice_address: editingOrder.invoice_address ?? '',
        invoice_email: editingOrder.invoice_email ?? '',
      };

      const updated = await pb.collection('orders').update(editingOrder.id, payload);
      const updatedOrder = updated as unknown as OrderRecord;
      const normalized = {
        ...updatedOrder,
        status: getOrderStatusValue(updatedOrder),
        payment_status: updatedOrder.payment_status ?? derivePaymentStatus(getOrderStatusValue(updatedOrder)),
      };

      setOrders((current) => current.map((order) => (order.id === editingOrder.id ? normalized : order)));
      setEditingOrder(null);
    } catch (error) {
      console.error('Rendelés módosítása sikertelen:', error);
      window.alert('A rendelés mentése sikertelen volt.');
    }
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const effectiveStatus = getOrderStatusValue(order);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pending' && effectiveStatus === 'pending') ||
        (statusFilter === 'paid' && effectiveStatus === 'paid') ||
        (statusFilter === 'processing' && effectiveStatus === 'processing') ||
        (statusFilter === 'completed' && effectiveStatus === 'completed') ||
        (statusFilter === 'cancelled' && effectiveStatus === 'cancelled') ||
        (statusFilter === 'refunded' && effectiveStatus === 'refunded');

      const haystack = [
        order.customer_name,
        order.customer_email,
        order.customer_phone,
        order.id,
        order.foxpost_place_name,
        order.shipping_address,
        order.invoice_company_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesQuery = !query || haystack.includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [orders, search, statusFilter]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f7f4ed] text-[#27251f]">
        <Header />

        <main className="mx-auto flex max-w-xl items-center justify-center px-6 py-16 sm:px-10 lg:px-16">
          <div className="w-full rounded-[30px] border border-[#e3ded3] bg-white p-8 shadow-[0_18px_40px_rgba(35,28,21,0.06)] sm:p-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#efe7db] text-[#473f36]">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#827a6d]">
                  PocketBase admin
                </p>
                <h1 className="mt-2 text-3xl font-medium tracking-[-0.05em] text-[#2d2922]">
                  Bejelentkezés
                </h1>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#4c453d]">Admin e-mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@zsulportekai.hu"
                  className="w-full rounded-2xl border border-[#dad0c3] bg-[#faf8f5] px-4 py-3 text-sm text-[#2c2924] outline-none placeholder:text-[#9a9388] focus:border-[#2d2922]"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#4c453d]">Jelszó</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-[#dad0c3] bg-[#faf8f5] px-4 py-3 text-sm text-[#2c2924] outline-none placeholder:text-[#9a9388] focus:border-[#2d2922]"
                  required
                />
              </label>

              {loginError && (
                <div className="rounded-2xl border border-[#f1c7b8] bg-[#fff1ec] px-4 py-3 text-sm text-[#8e4a2d]">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-[#2d2922] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1e1b18] disabled:cursor-not-allowed disabled:bg-[#a49d93]"
              >
                {isLoggingIn ? 'Bejelentkezés...' : 'Bejelentkezés a PocketBase adminba'}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-[#27251f]">
      <Header />

      <main className="mx-auto max-w-[1280px] px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[#e8dfd0] bg-white shadow-sm">
              <img src={logoUrl} alt="Zsül Portékái logó" className="h-10 w-10 object-contain" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#827a6d]">
                Admin panel
              </p>
              <h1 className="mt-2 text-4xl font-medium tracking-[-0.06em] text-[#2c2924] sm:text-5xl">
                Rendelések kezelése
              </h1>
            </div>
          </div>

          <div className="flex w-full max-w-2xl items-center justify-end gap-3">
            <div className="flex w-full max-w-md items-center gap-3 rounded-full border border-[#e2dccf] bg-white px-4 py-3 shadow-sm">
              <Search className="h-4 w-4 text-[#726b62]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Keresés név, e-mail, azonosító..."
                className="w-full bg-transparent text-sm text-[#2d2922] outline-none placeholder:text-[#9a9388]"
              />
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-[#ddd0c0] bg-white px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#2d2922] transition hover:border-[#a35e29] hover:bg-[#f5efe4]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Kijelentkezés
            </button>
          </div>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-[24px] border border-[#e3ded3] bg-white p-5 shadow-[0_12px_30px_rgba(35,28,21,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#6d655d]">Összes rendelés</p>
              <Package className="h-5 w-5 text-[#4a4339]" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.06em]">{orders.length}</p>
          </div>
          <div className="rounded-[24px] border border-[#e3ded3] bg-white p-5 shadow-[0_12px_30px_rgba(35,28,21,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#6d655d]">Függőben</p>
              <Clock3 className="h-5 w-5 text-[#7b5e2f]" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.06em]">
              {orders.filter((order) => getOrderStatusValue(order) === 'pending').length}
            </p>
          </div>
          <div className="rounded-[24px] border border-[#e3ded3] bg-white p-5 shadow-[0_12px_30px_rgba(35,28,21,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#6d655d]">Feldolgozás</p>
              <ShoppingCart className="h-5 w-5 text-[#2955b1]" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.06em]">
              {orders.filter((order) => getOrderStatusValue(order) === 'processing').length}
            </p>
          </div>
          <div className="rounded-[24px] border border-[#e3ded3] bg-white p-5 shadow-[0_12px_30px_rgba(35,28,21,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#6d655d]">Kiszállítva / teljesítve</p>
              <ShieldCheck className="h-5 w-5 text-[#1d7d51]" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.06em]">
              {orders.filter((order) => SHIPPED_STATUSES.includes(getOrderStatusValue(order))).length}
            </p>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <a
            href="http://127.0.0.1:8090/_/"
            target="_blank"
            rel="noreferrer"
            className="rounded-[24px] border border-[#e3ded3] bg-[#f9f5ef] p-5 text-left shadow-[0_12px_30px_rgba(35,28,21,0.04)] transition hover:border-[#c6b89d]"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#6d655d]">PocketBase admin</p>
              <LockKeyhole className="h-5 w-5 text-[#473f36]" />
            </div>
            <p className="mt-4 text-lg font-medium text-[#2d2922]">Megnyitás a PocketBase dashboardban</p>
          </a>

          <div className="rounded-[24px] border border-[#e3ded3] bg-[#f9f5ef] p-5 shadow-[0_12px_30px_rgba(35,28,21,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#6d655d]">E-mail rendszer</p>
              <MailCheck className="h-5 w-5 text-[#2a7b46]" />
            </div>
            <p className="mt-4 text-lg font-medium text-[#2d2922]">Resend + PocketBase aktiv</p>
            <p className="mt-2 text-sm text-[#5d564f]">Vevői és admin értesítő üzenetek automatikusan indulnak.</p>
          </div>

          <div className="rounded-[24px] border border-[#e3ded3] bg-[#f9f5ef] p-5 shadow-[0_12px_30px_rgba(35,28,21,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#6d655d]">Státusz kezelő</p>
              <CreditCard className="h-5 w-5 text-[#473f36]" />
            </div>
            <p className="mt-4 text-lg font-medium text-[#2d2922]">Visszavonás, törlés és minden szintű állapotváltás</p>
          </div>
        </section>

        <div className="mb-5 flex flex-wrap gap-2">
          {ORDER_FILTER_OPTIONS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                statusFilter === filter
                  ? 'bg-[#2d2922] text-white'
                  : 'border border-[#ddd0c0] bg-white text-[#2d2922] hover:border-[#a35e29]'
              }`}
            >
              {getStatusFilterLabel(filter)}
            </button>
          ))}
        </div>

        <section className="overflow-hidden rounded-[28px] border border-[#e3ded3] bg-white shadow-[0_18px_40px_rgba(35,28,21,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f8f4ef] text-[#534d45]">
                <tr>
                  <th className="px-5 py-4 font-semibold">Rendelés</th>
                  <th className="px-5 py-4 font-semibold">Vevő</th>
                  <th className="px-5 py-4 font-semibold">Szállítás</th>
                  <th className="px-5 py-4 font-semibold">Fizetés</th>
                  <th className="px-5 py-4 font-semibold">Összeg</th>
                  <th className="px-5 py-4 font-semibold">Állapot</th>
                  <th className="px-5 py-4 font-semibold">Műveletek</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-[#6b625b]">
                      Betöltés...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-[#6b625b]">
                      Nincs megjeleníthető rendelés.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const currentStatus = getOrderStatusValue(order);
                    const statusMeta = getStatusMeta(currentStatus);

                    return (
                      <tr key={order.id} className="border-t border-[#f0e9e1] align-top">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-[#2d2922]">#{order.id}</div>
                          <div className="mt-1 text-xs text-[#786f66]">
                            {order.created ? new Date(order.created).toLocaleString('hu-HU') : 'Dátum nincs rögzítve'}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-[#2d2922]">{order.customer_name}</div>
                          <div className="mt-1 text-[#5d564f]">{order.customer_email}</div>
                          <div className="mt-1 text-[#5d564f]">{order.customer_phone}</div>
                        </td>
                        <td className="px-5 py-4 text-[#4c453d]">
                          <div className="font-medium text-[#2d2922]">
                            {order.delivery_method === 'foxpost' ? 'Foxpost automata' : 'Házhozszállítás'}
                          </div>
                          <div className="mt-1 max-w-[220px] text-xs leading-5 text-[#5d564f]">
                            {order.delivery_method === 'foxpost'
                              ? `${order.foxpost_place_name ?? 'Automata'} — ${order.foxpost_place_address ?? ''}`
                              : order.shipping_address ?? 'Nincs cím megadva'}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[#4c453d]">
                          <div className="font-medium text-[#2d2922]">
                            {order.payment_method === 'stripe' ? 'Online fizetés' : 'Banki átutalás'}
                          </div>
                          <div className="mt-1 text-xs text-[#5d564f]">
                            {order.payment_status === 'paid'
                              ? 'Kifizetve'
                              : order.payment_status === 'refunded'
                                ? 'Visszatérítve'
                                : 'Függőben'}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-[#2d2922]">{fmtMoney(order.total_price)}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-2">
                            <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-xs font-semibold ${statusMeta.className}`}>
                              {currentStatus === 'pending' ? <Clock3 className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                              {statusMeta.label}
                            </span>
                            <select
                              value={currentStatus}
                              onChange={(event) => handleUpdateOrderStatus(order.id, event.target.value as OrderStatus)}
                              disabled={updatingOrderId === order.id}
                              className="rounded-full border border-[#ddd0c0] bg-[#faf8f5] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2d2922] outline-none"
                            >
                              {ORDER_STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                  {scopeStatusLabel[status]}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingOrder(order)}
                              className="inline-flex items-center gap-1 rounded-full border border-[#d9d0c2] bg-[#f8f3ec] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2d2922] hover:border-[#a35e29]"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              Szerkesztés
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(order.id)}
                              className="inline-flex items-center gap-1 rounded-full border border-[#e7c4bc] bg-[#fff4f2] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b3d30] hover:border-[#af5646]"
                            >
                              <Delete className="h-3.5 w-3.5" />
                              Törlés
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#221d1b]/55 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-[0_30px_80px_rgba(26,20,16,0.18)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8e7d68]">Rendelés szerkesztése</p>
                <h2 className="mt-2 text-3xl font-medium tracking-[-0.05em] text-[#2d2922]">#{editingOrder.id}</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="rounded-full border border-[#ddd0c0] p-2 text-[#2d2922] hover:border-[#a35e29]"
                aria-label="Bezárás"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4c453d]">Név</span>
                  <input
                    value={editingOrder.customer_name}
                    onChange={(event) => setEditingOrder({ ...editingOrder, customer_name: event.target.value })}
                    className="w-full rounded-2xl border border-[#dad0c3] bg-[#faf8f5] px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4c453d]">E-mail</span>
                  <input
                    type="email"
                    value={editingOrder.customer_email}
                    onChange={(event) => setEditingOrder({ ...editingOrder, customer_email: event.target.value })}
                    className="w-full rounded-2xl border border-[#dad0c3] bg-[#faf8f5] px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4c453d]">Telefon</span>
                  <input
                    value={editingOrder.customer_phone}
                    onChange={(event) => setEditingOrder({ ...editingOrder, customer_phone: event.target.value })}
                    className="w-full rounded-2xl border border-[#dad0c3] bg-[#faf8f5] px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4c453d]">Összeg</span>
                  <input
                    type="number"
                    value={editingOrder.total_price ?? 0}
                    onChange={(event) => setEditingOrder({ ...editingOrder, total_price: Number(event.target.value) })}
                    className="w-full rounded-2xl border border-[#dad0c3] bg-[#faf8f5] px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4c453d]">Szállítási mód</span>
                  <select
                    value={editingOrder.delivery_method}
                    onChange={(event) =>
                      setEditingOrder({ ...editingOrder, delivery_method: event.target.value as 'foxpost' | 'home_delivery' })
                    }
                    className="w-full rounded-2xl border border-[#dad0c3] bg-[#faf8f5] px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                  >
                    <option value="foxpost">Foxpost automata</option>
                    <option value="home_delivery">Házhozszállítás</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4c453d]">Fizetési mód</span>
                  <select
                    value={editingOrder.payment_method}
                    onChange={(event) =>
                      setEditingOrder({ ...editingOrder, payment_method: event.target.value as 'bank_transfer' | 'stripe' })
                    }
                    className="w-full rounded-2xl border border-[#dad0c3] bg-[#faf8f5] px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                  >
                    <option value="bank_transfer">Banki átutalás</option>
                    <option value="stripe">Online fizetés</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4c453d]">Állapot</span>
                  <select
                    value={editingOrder.status}
                    onChange={(event) => {
                      const nextStatus = event.target.value as OrderStatus;
                      setEditingOrder({
                        ...editingOrder,
                        status: nextStatus,
                        payment_status: derivePaymentStatus(nextStatus),
                      });
                    }}
                    className="w-full rounded-2xl border border-[#dad0c3] bg-[#faf8f5] px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                  >
                    {ORDER_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {scopeStatusLabel[status]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4c453d]">Fizetési állapot</span>
                  <select
                    value={editingOrder.payment_status}
                    onChange={(event) =>
                      setEditingOrder({
                        ...editingOrder,
                        payment_status: event.target.value as PaymentStatus,
                      })
                    }
                    className="w-full rounded-2xl border border-[#dad0c3] bg-[#faf8f5] px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                  >
                    <option value="pending">Függőben</option>
                    <option value="paid">Kifizetve</option>
                    <option value="refunded">Visszatérítve</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-[#4c453d]">Szállítási cím</span>
                  <textarea
                    value={editingOrder.shipping_address ?? ''}
                    onChange={(event) => setEditingOrder({ ...editingOrder, shipping_address: event.target.value })}
                    className="min-h-[100px] w-full rounded-2xl border border-[#dad0c3] bg-[#faf8f5] px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4c453d]">Foxpost automata neve</span>
                  <input
                    value={editingOrder.foxpost_place_name ?? ''}
                    onChange={(event) => setEditingOrder({ ...editingOrder, foxpost_place_name: event.target.value })}
                    className="w-full rounded-2xl border border-[#dad0c3] bg-[#faf8f5] px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4c453d]">Foxpost címe</span>
                  <input
                    value={editingOrder.foxpost_place_address ?? ''}
                    onChange={(event) => setEditingOrder({ ...editingOrder, foxpost_place_address: event.target.value })}
                    className="w-full rounded-2xl border border-[#dad0c3] bg-[#faf8f5] px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="rounded-full border border-[#ddd0c0] bg-white px-5 py-2.5 text-sm font-semibold text-[#2d2922] transition hover:border-[#a35e29]"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2d2922] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e1b18]"
                >
                  <Banknote className="h-4 w-4" />
                  Mentés
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
