'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Clock3, Package, Search, ShieldCheck, Truck } from 'lucide-react';
import Header from '@/components/Header';
import { pb } from '@/lib/pocketbase';

const logoUrl =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000204-8933c8933e/450/Zs%C3%BCl%20port%C3%A9k%C3%A1i%20logo.webp?ph=4e95f92e87';

type OrderRecord = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_method: 'foxpost' | 'home_delivery';
  payment_method: 'bank_transfer' | 'stripe';
  payment_status: 'pending' | 'paid';
  status: 'pending' | 'paid';
  total_price?: number;
  items?: Array<{ title?: string; quantity?: number; price?: number }>;
  foxpost_place_name?: string;
  foxpost_place_address?: string;
  shipping_address?: string;
  created?: string;
};

const statusStyles: Record<string, string> = {
  pending: 'bg-[#f3ebdd] text-[#7b5e2f]',
  paid: 'bg-[#eaf5eb] text-[#2a7b46]',
};

const fmtMoney = (value?: number) => `${Number(value ?? 0).toLocaleString('hu-HU')} Ft`;

const makeOrderStatus = (order: OrderRecord) => {
  if (order.payment_status === 'paid' || order.status === 'paid') return 'Fizetve';
  return 'Folyamatban';
};

export default function AdminPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      try {
        const records = await pb.collection('orders').getFullList({
          sort: '-created',
          expand: 'items',
        });

        setOrders(records as unknown as OrderRecord[]);
      } catch (error) {
        console.error('Admin megrendelések betöltése nem sikerült:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return orders;

    return orders.filter((order) => {
      const haystack = [
        order.customer_name,
        order.customer_email,
        order.customer_phone,
        order.id,
        order.foxpost_place_name,
        order.shipping_address,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [orders, search]);

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

          <div className="flex w-full max-w-md items-center gap-3 rounded-full border border-[#e2dccf] bg-white px-4 py-3 shadow-sm">
            <Search className="h-4 w-4 text-[#726b62]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Keresés név, e-mail, azonosító..."
              className="w-full bg-transparent text-sm text-[#2d2922] outline-none placeholder:text-[#9a9388]"
            />
          </div>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-[#e3ded3] bg-white p-5 shadow-[0_12px_30px_rgba(35,28,21,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#6d655d]">Összes rendelés</p>
              <Package className="h-5 w-5 text-[#4a4339]" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.06em]">{orders.length}</p>
          </div>
          <div className="rounded-[24px] border border-[#e3ded3] bg-white p-5 shadow-[0_12px_30px_rgba(35,28,21,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#6d655d]">Fizetve</p>
              <ShieldCheck className="h-5 w-5 text-[#2a7b46]" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.06em]">
              {orders.filter((order) => order.payment_status === 'paid' || order.status === 'paid').length}
            </p>
          </div>
          <div className="rounded-[24px] border border-[#e3ded3] bg-white p-5 shadow-[0_12px_30px_rgba(35,28,21,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#6d655d]">Kiszállításra vár</p>
              <Truck className="h-5 w-5 text-[#7b5e2f]" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.06em]">
              {orders.filter((order) => order.payment_status !== 'paid' && order.status !== 'paid').length}
            </p>
          </div>
        </section>

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
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-[#6b625b]">
                      Betöltés...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-[#6b625b]">
                      Nincs megjeleníthető rendelés.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
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
                        <div className="mt-1 max-w-[240px] text-xs leading-5 text-[#5d564f]">
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
                          {order.payment_status === 'paid' ? 'Kifizetve' : 'Függőben'}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#2d2922]">{fmtMoney(order.total_price)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-xs font-semibold ${statusStyles[order.status ?? 'pending']}`}>
                          {order.status === 'paid' ? <Check className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                          {makeOrderStatus(order)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
