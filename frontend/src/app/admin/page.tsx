'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  Check,
  Clock3,
  Delete,
  Edit3,
  LockKeyhole,
  LogOut,
  MailCheck,
  Search,
  X,
} from 'lucide-react';
import Header from '@/components/Header';
import { pb } from '@/lib/pocketbase';

const logoUrl =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000204-8933c8933e/450/Zs%C3%BCl%20port%C3%A9k%C3%A1i%20logo.webp?ph=4e95f92e87';

const normalizeOrderStatus = (order: Partial<OrderRecord>): Pick<OrderRecord, 'status' | 'payment_status'> => {
  const status = getOrderStatusValue((order as OrderRecord) ?? { status: 'pending', payment_status: 'pending' });
  const paymentStatus: PaymentStatus = order.payment_status === 'refunded'
    ? 'refunded'
    : ['paid', 'processing', 'completed'].includes(status)
      ? 'paid'
      : 'pending';

  return {
    status,
    payment_status: paymentStatus,
  };
};

type OrderStatus = 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled' | 'refunded';
type PaymentStatus = 'pending' | 'paid' | 'refunded';

type OrderRecord = {
  id: string;
  customer_name: string;
  customer_first_name?: string;
  customer_last_name?: string;
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

type EmailLogEntry = {
  id: string;
  orderId: string;
  customerName: string;
  recipient: string;
  type: 'customer' | 'admin' | 'invoice';
  sentAt: string;
  subject: string;
  body: string;
  from?: string;
};

type CouponRecord = {
  id: string;
  code: string;
  discount_percent: number;
  discount_amount?: number;
  product_id?: string;
  product_title?: string;
  active?: boolean;
  description?: string;
  created?: string;
};

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'paid',
  'processing',
  'completed',
  'cancelled',
  'refunded',
];

const ORDER_FILTER_OPTIONS = ['all', 'pending', 'paid', 'processing', 'completed', 'cancelled', 'refunded'] as const;
type StatusFilter = (typeof ORDER_FILTER_OPTIONS)[number];

const statusClasses: Record<OrderStatus, string> = {
  pending: 'bg-[#f3ebdd] text-[#7b5e2f]',
  paid: 'bg-[#eaf5eb] text-[#2a7b46]',
  processing: 'bg-[#e8f0ff] text-[#2955b1]',
  completed: 'bg-[#eaf7ef] text-[#1d7d51]',
  cancelled: 'bg-[#fbe9e7] text-[#9a3c2c]',
  refunded: 'bg-[#f6efe8] text-[#7a614e]',
};

const scopeStatusLabel: Record<OrderStatus, string> = {
  pending: 'Függőben',
  paid: 'Fizetve',
  processing: 'Feldolgozás alatt',
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
  if (['paid', 'processing', 'completed'].includes(status)) return 'paid';
  return 'pending';
};

const getStatusFilterLabel = (filter: StatusFilter) => {
  if (filter === 'all') return 'Összes';
  if (filter === 'pending') return 'Függőben';
  if (filter === 'paid') return 'Fizetve';
  if (filter === 'processing') return 'Feldolgozás';
  if (filter === 'completed') return 'Teljesítve';
  if (filter === 'cancelled') return 'Stornó';
  return 'Visszatérítés';
};

const getStatusMeta = (status: OrderStatus) => ({
  label: scopeStatusLabel[status],
  className: statusClasses[status],
});

const splitCustomerName = (rawName?: string) => {
  const safeValue = (rawName ?? '').trim();
  if (!safeValue) {
    return { firstName: '', lastName: '' };
  }

  const parts = safeValue.split(/\s+/);
  if (parts.length <= 1) {
    return { firstName: safeValue, lastName: '' };
  }

  const lastName = parts.pop() ?? '';
  return { firstName: parts.join(' '), lastName };
};

const buildFullName = (firstName?: string, lastName?: string) => {
  const first = (firstName ?? '').trim();
  const last = (lastName ?? '').trim();

  if (!first && !last) return '';
  if (!first) return last;
  if (!last) return first;
  return `${first} ${last}`;
};

const getNextStatusForOrder = (order: OrderRecord): OrderStatus => {
  const current = getOrderStatusValue(order);

  if (current === 'pending') return 'paid';
  if (current === 'paid') return 'processing';
  if (current === 'processing') return 'completed';
  if (current === 'completed') return 'completed';
  if (current === 'cancelled' || current === 'refunded') return current;
  return 'completed';
};

const getAutoAdvanceLabel = (order: OrderRecord) => {
  const current = getOrderStatusValue(order);

  if (current === 'pending') return 'Fizetve → feldolgozás';
  if (current === 'paid') return 'Feldolgozás → teljesítés';
  if (current === 'processing') return 'Teljesítés → kész';
  return 'Nincs további automatikus lépés';
};

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(pb.authStore.isValid && pb.authStore.model));
  const [editingOrder, setEditingOrder] = useState<OrderRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'invoices' | 'coupons'>('orders');
  const [savedEmailLog, setSavedEmailLog] = useState<EmailLogEntry[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const raw = localStorage.getItem('zsulportekai-email-log');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [couponForm, setCouponForm] = useState({
    id: '',
    code: '',
    discount_percent: 10,
    discount_amount: 0,
    product_id: '',
    product_title: '',
    active: true,
    description: '',
  });
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);

    try {
      const records = await pb.collection('orders').getFullList({
        sort: '-created',
      });

      const normalized: OrderRecord[] = (records as unknown as OrderRecord[]).map((order) => {
        const status = getOrderStatusValue(order);
        const derivedNames = splitCustomerName(order.customer_name);
        const nextPaymentStatus: PaymentStatus = order.payment_status === 'refunded'
          ? 'refunded'
          : order.payment_status === 'paid' || status === 'paid' || status === 'processing' || status === 'completed'
            ? 'paid'
            : 'pending';

        return {
          ...order,
          customer_first_name: order.customer_first_name ?? derivedNames.firstName,
          customer_last_name: order.customer_last_name ?? derivedNames.lastName,
          customer_name: buildFullName(order.customer_first_name ?? derivedNames.firstName, order.customer_last_name ?? derivedNames.lastName) || order.customer_name,
          status,
          payment_status: nextPaymentStatus,
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

  const fetchCoupons = async () => {
    try {
      const records = await pb.collection('coupons').getFullList({
        sort: '-created',
      });

      const normalized = (records as unknown as CouponRecord[]) ?? [];
      setCoupons(normalized.map((coupon) => ({
        ...coupon,
        code: String(coupon.code ?? '').toUpperCase(),
        discount_percent: Number(coupon.discount_percent ?? 0),
        active: Boolean(coupon.active),
        description: coupon.description ?? '',
      })));
    } catch (error) {
      console.error('Kuponok betöltése sikertelen:', error);
      setCoupons([]);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // This runs only after the admin session becomes valid, so it is a deliberate
    // auth-driven sync point rather than a cascading render loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
    fetchCoupons();
  }, [isAuthenticated]);

  const generatedEmailLog = useMemo<EmailLogEntry[]>(() => {
    return orders.flatMap((order) => {
      const customerName = buildFullName(order.customer_first_name, order.customer_last_name) || order.customer_name;
      const base: EmailLogEntry[] = [
        {
          id: `${order.id}-customer`,
          orderId: order.id,
          customerName,
          recipient: order.customer_email,
          type: 'customer',
          sentAt: order.created ?? new Date().toISOString(),
          subject: 'Rendelés visszaigazolás',
          body: `Kedves ${customerName}!\n\nA rendelésedet rögzítettük a Zsül Portékái webshopban.\n\nMegrendelés azonosító: #${order.id}\nÖsszeg: ${fmtMoney(order.total_price)}\n\nÜdvözlettel:\nZsül Portékái`,
          from: 'Zsül Portékái',
        },
        {
          id: `${order.id}-admin`,
          orderId: order.id,
          customerName,
          recipient: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@zsulportekai.hu',
          type: 'admin',
          sentAt: order.created ?? new Date().toISOString(),
          subject: 'Új rendelés érkezett',
          body: `Új rendelés érkezett az alábbi adatokkal:\n\nNév: ${customerName}\nE-mail: ${order.customer_email}\nTelefon: ${order.customer_phone}\nÖsszeg: ${fmtMoney(order.total_price)}\nSzállítás: ${order.delivery_method === 'foxpost' ? order.foxpost_place_name ?? 'Foxpost automata' : order.shipping_address ?? 'Házhozszállítás'}`,
          from: 'Zsül Portékái admin',
        },
      ];

      if (order.invoice_required) {
        base.push({
          id: `${order.id}-invoice`,
          orderId: order.id,
          customerName,
          recipient: order.invoice_email || order.customer_email,
          type: 'invoice',
          sentAt: order.created ?? new Date().toISOString(),
          subject: 'Számla elküldése',
          body: `Kedves ${customerName}!\n\nA számlához tartozó adatok elküldésre kerültek.\nCégnév: ${order.invoice_company_name ?? 'Nincs megadva'}\nAdószám: ${order.invoice_tax_number ?? 'Nincs megadva'}\nSzámlázási cím: ${order.invoice_address ?? 'Nincs megadva'}\nÖsszeg: ${fmtMoney(order.total_price)}`,
          from: 'Zsül Portékái számlázás',
        });
      }

      return base;
    });
  }, [orders]);

  const emailLog = useMemo<EmailLogEntry[]>(() => {
    const merged = [...generatedEmailLog, ...savedEmailLog];
    const unique = new Map<string, EmailLogEntry>();
    merged.forEach((entry) => unique.set(entry.id, entry));
    return Array.from(unique.values()).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()).slice(0, 60);
  }, [generatedEmailLog, savedEmailLog]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zsulportekai-email-log', JSON.stringify(emailLog));
    }
  }, [emailLog]);

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

      const emailStatus = nextStatus === 'cancelled' || nextStatus === 'refunded' ? 'cancelled' : nextStatus;
      await fetch('/api/orders/email-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: emailStatus,
        }),
      }).catch(() => undefined);

      setOrders((current) =>
        current.map((order) => (order.id === orderId ? { ...order, ...updatedOrder, status: nextStatus, payment_status: nextPaymentStatus } : order)),
      );

      if (editingOrder?.id === orderId) {
        setEditingOrder((current) => (current ? { ...current, status: nextStatus, payment_status: nextPaymentStatus } : current));
      }
    } catch (error) {
      console.error('Rendelés állapot frissítése sikertelen:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleAutoAdvanceStatus = async (order: OrderRecord) => {
    const nextStatus = getNextStatusForOrder(order);
    if (nextStatus === order.status) return;
    await handleUpdateOrderStatus(order.id, nextStatus);
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

  const handleSaveCoupon = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedCode = couponForm.code.trim().toUpperCase();
    const hasPercentDiscount = Number(couponForm.discount_percent ?? 0) > 0;
    const hasFixedDiscount = Number(couponForm.discount_amount ?? 0) > 0;

    if (!normalizedCode || (!hasPercentDiscount && !hasFixedDiscount)) {
      window.alert('A kupon kód és legalább egy érvényes kedvezmény érték kötelező.');
      return;
    }

    if (hasPercentDiscount && (couponForm.discount_percent <= 0 || couponForm.discount_percent > 100)) {
      window.alert('A százalékos kedvezmény 1 és 100 közötti érték legyen.');
      return;
    }

    if (couponForm.product_id && !couponForm.product_title.trim()) {
      window.alert('Termékspecifikus kuponhoz a termék nevének megadása is kötelező.');
      return;
    }

    try {
      const payload = {
        code: normalizedCode,
        discount_percent: Number(couponForm.discount_percent ?? 0),
        discount_amount: Number(couponForm.discount_amount ?? 0),
        product_id: couponForm.product_id.trim(),
        product_title: couponForm.product_title.trim(),
        active: Boolean(couponForm.active),
        description: couponForm.description.trim(),
      };

      if (couponForm.id) {
        await pb.collection('coupons').update(couponForm.id, payload);
      } else {
        await pb.collection('coupons').create(payload);
      }

      setCouponForm({ id: '', code: '', discount_percent: 10, discount_amount: 0, product_id: '', product_title: '', active: true, description: '' });
      await fetchCoupons();
    } catch (error) {
      console.error('Kupon mentése sikertelen:', error);
      window.alert('A kupon mentése sikertelen volt.');
    }
  };

  const handleEditCoupon = (coupon: CouponRecord) => {
    setCouponForm({
      id: coupon.id,
      code: coupon.code,
      discount_percent: Number(coupon.discount_percent ?? 0),
      discount_amount: Number(coupon.discount_amount ?? 0),
      product_id: coupon.product_id ?? '',
      product_title: coupon.product_title ?? '',
      active: Boolean(coupon.active),
      description: coupon.description ?? '',
    });
  };

  const handleDeleteCoupon = async (couponId: string) => {
    const coupon = coupons.find((item) => item.id === couponId);
    if (!coupon) return;

    const confirmed = window.confirm(`Biztosan törlöd a(z) ${coupon.code} kuponkódot?`);
    if (!confirmed) return;

    try {
      await pb.collection('coupons').delete(couponId);
      setCoupons((current) => current.filter((item) => item.id !== couponId));
      if (couponForm.id === couponId) {
        setCouponForm({ id: '', code: '', discount_percent: 10, discount_amount: 0, product_id: '', product_title: '', active: true, description: '' });
      }
    } catch (error) {
      console.error('Kupon törlése sikertelen:', error);
      window.alert('A kupon törlése sikertelen volt.');
    }
  };

  const handleSaveEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingOrder) return;

    try {
      const nextCustomerName = buildFullName(
        editingOrder.customer_first_name ?? splitCustomerName(editingOrder.customer_name).firstName,
        editingOrder.customer_last_name ?? splitCustomerName(editingOrder.customer_name).lastName,
      );

      const normalizedStatus = normalizeOrderStatus(editingOrder);

      const payload = {
        customer_name: nextCustomerName || editingOrder.customer_name,
        customer_email: editingOrder.customer_email,
        customer_phone: editingOrder.customer_phone,
        delivery_method: editingOrder.delivery_method,
        payment_method: editingOrder.payment_method,
        payment_status: editingOrder.payment_status || normalizedStatus.payment_status,
        status: editingOrder.status || normalizedStatus.status,
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
        customer_first_name: splitCustomerName(updatedOrder.customer_name).firstName,
        customer_last_name: splitCustomerName(updatedOrder.customer_name).lastName,
        customer_name: buildFullName(
          splitCustomerName(updatedOrder.customer_name).firstName,
          splitCustomerName(updatedOrder.customer_name).lastName,
        ) || updatedOrder.customer_name,
        status: getOrderStatusValue(updatedOrder),
        payment_status: updatedOrder.payment_status ?? derivePaymentStatus(getOrderStatusValue(updatedOrder)),
      };

      if (editingOrder.status !== normalized.status || editingOrder.payment_status !== normalized.payment_status) {
        setEditingOrder((current) => (current ? { ...current, status: normalized.status, payment_status: normalized.payment_status } : current));
      }

      setOrders((current) => current.map((order) => (order.id === editingOrder.id ? normalized : order)));
      setEditingOrder(null);
    } catch (error) {
      console.error('Rendelés módosítása sikertelen:', error);
      window.alert('A rendelés mentése sikertelen volt.');
    }
  };

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const selectedOrderEmails = useMemo(
    () => emailLog.filter((entry) => entry.orderId === selectedOrderId),
    [emailLog, selectedOrderId],
  );

  const handleSendCustomerEmail = async () => {
    if (!selectedOrder || !replyBody.trim()) {
      window.alert('A vevőnek küldendő üzenet szövege kötelező.');
      return;
    }

    setIsSendingReply(true);

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedOrder.customer_email,
          subject: replySubject.trim() || `Üzenet a megrendeléshez (#${selectedOrder.id})`,
          text: replyBody.trim(),
          from: 'Zsül Portékái admin <noreply@zsulportekai.hu>',
          replyTo: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'zsulportekai@gmail.com',
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'A küldés nem sikerült.');
      }

      const sentEntry: EmailLogEntry = {
        id: `${selectedOrder.id}-reply-${Date.now()}`,
        orderId: selectedOrder.id,
        customerName: buildFullName(selectedOrder.customer_first_name, selectedOrder.customer_last_name) || selectedOrder.customer_name,
        recipient: selectedOrder.customer_email,
        type: 'admin',
        sentAt: new Date().toISOString(),
        subject: replySubject.trim() || `Üzenet a megrendeléshez (#${selectedOrder.id})`,
        body: replyBody.trim(),
        from: 'Zsül Portékái admin',
      };

      setSavedEmailLog((current) => {
        const merged = [sentEntry, ...current];
        const unique = new Map<string, EmailLogEntry>();
        merged.forEach((entry) => unique.set(entry.id, entry));
        return Array.from(unique.values()).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()).slice(0, 60);
      });

      setReplySubject('');
      setReplyBody('');
      setExpandedEmailId(sentEntry.id);
      window.alert('Az e-mail elküldve a vevőnek.');
    } catch (error) {
      console.error('E-mail küldése a vevőnek sikertelen:', error);
      window.alert('A vevőnek küldött e-mail elküldése sikertelen volt.');
    } finally {
      setIsSendingReply(false);
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
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: 'orders', label: 'Rendelések' },
            { key: 'invoices', label: 'Számlák' },
            { key: 'coupons', label: 'Kuponok' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as 'orders' | 'invoices' | 'coupons')}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                activeTab === tab.key
                  ? 'bg-[#2d2922] text-white'
                  : 'border border-[#ddd0c0] bg-white text-[#2d2922] hover:border-[#a35e29]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

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

        {activeTab === 'orders' && (
          <>
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

        {selectedOrder && (
          <section className="mb-8 rounded-[28px] border border-[#e3ded3] bg-white p-6 shadow-[0_18px_40px_rgba(35,28,21,0.04)]">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#827a6d]">Kiválasztott rendelés</p>
                <h2 className="mt-2 text-3xl font-medium tracking-[-0.05em] text-[#2d2922]">
                  #{selectedOrder.id} · {buildFullName(selectedOrder.customer_first_name, selectedOrder.customer_last_name) || selectedOrder.customer_name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="rounded-full border border-[#ddd0c0] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#2d2922] hover:border-[#a35e29]"
              >
                Bezárás
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3">
                {selectedOrderEmails.length === 0 ? (
                  <div className="rounded-[20px] border border-dashed border-[#d8cab1] bg-[#faf7f2] p-5 text-sm text-[#5d564f]">
                    Még nincs elküldött e-mail ehhez a rendeléshez.
                  </div>
                ) : (
                  selectedOrderEmails.map((entry) => {
                    const isExpanded = expandedEmailId === entry.id;
                    return (
                      <div key={entry.id} className="rounded-[20px] border border-[#e3ded3] bg-[#faf7f2] p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="text-sm font-semibold text-[#2d2922]">{entry.subject}</div>
                            <div className="mt-1 text-xs text-[#5d564f]">
                              {entry.type === 'customer' ? 'Vevői' : entry.type === 'admin' ? 'Admin' : 'Számla'} · {entry.recipient}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setExpandedEmailId(isExpanded ? null : entry.id)}
                            className="rounded-full border border-[#ddd0c0] bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2d2922] hover:border-[#a35e29]"
                          >
                            {isExpanded ? 'Bezárás' : 'Megnyitás'}
                          </button>
                        </div>
                        <div className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[#7a6d5f]">
                          {new Date(entry.sentAt).toLocaleString('hu-HU')}
                        </div>
                        {isExpanded && (
                          <div className="mt-4 rounded-[16px] border border-[#e8dfd0] bg-white p-4 text-sm leading-6 whitespace-pre-wrap text-[#423d39]">
                            {entry.body || 'Nincs levél tartalom rögzítve.'}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="rounded-[24px] border border-[#e3ded3] bg-[#faf8f5] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#827a6d]">Vevői válasz</p>
                <h3 className="mt-2 text-2xl font-medium tracking-[-0.04em] text-[#2d2922]">E-mail küldése</h3>

                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[#4c453d]">Tárgy</span>
                    <input
                      value={replySubject}
                      onChange={(event) => setReplySubject(event.target.value)}
                      placeholder="Új információ a rendelésről"
                      className="w-full rounded-2xl border border-[#dad0c3] bg-white px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[#4c453d]">Üzenet</span>
                    <textarea
                      value={replyBody}
                      onChange={(event) => setReplyBody(event.target.value)}
                      rows={8}
                      placeholder="Írd meg a vevőnek szóló üzenetet..."
                      className="w-full rounded-2xl border border-[#dad0c3] bg-white px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleSendCustomerEmail}
                    disabled={isSendingReply}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2d2922] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1e1b18] disabled:cursor-not-allowed disabled:bg-[#a49d93]"
                  >
                    {isSendingReply ? 'Küldés...' : 'E-mail küldése a vevőnek'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

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
                              onClick={() => setSelectedOrderId(order.id)}
                              className="inline-flex items-center gap-1 rounded-full border border-[#d9d0c2] bg-[#f0f6ff] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#264d9f] hover:border-[#4b7de7]"
                            >
                              <MailCheck className="h-3.5 w-3.5" />
                              E-mailek
                            </button>
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
                            <button
                              type="button"
                              onClick={() => handleAutoAdvanceStatus(order)}
                              className="inline-flex items-center gap-1 rounded-full border border-[#d9d0c2] bg-[#edf5ff] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#264d9f] hover:border-[#4b7de7]"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Auto lépés
                            </button>
                          </div>
                          <div className="mt-2 text-[11px] text-[#5d564f]">
                            {order.invoice_required ? `Számla: ${order.invoice_company_name || 'cég'}` : 'Nincs számla'}
                          </div>
                          <div className="mt-1 text-[10px] text-[#6a82b8]">{getAutoAdvanceLabel(order)}</div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
          </>
        )}

        {activeTab === 'invoices' && (
          <section className="rounded-[28px] border border-[#e3ded3] bg-white p-6 shadow-[0_18px_40px_rgba(35,28,21,0.04)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#827a6d]">Számlák</p>
                <h2 className="mt-2 text-3xl font-medium tracking-[-0.05em] text-[#2d2922]">Számlakezelés</h2>
              </div>
              <div className="rounded-full bg-[#f2eadc] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6b5539]">
                {orders.filter((order) => order.invoice_required).length} számla
              </div>
            </div>

            {orders.filter((order) => order.invoice_required).length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-[#d8cab1] bg-[#faf7f2] p-6 text-sm text-[#5d564f]">
                Jelenleg nincs számlához kötött rendelés.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {orders
                  .filter((order) => order.invoice_required)
                  .map((order) => (
                    <div key={order.id} className="rounded-[24px] border border-[#e3ded3] bg-[#faf7f2] p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-[#2d2922]">#{order.id}</div>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClasses[getOrderStatusValue(order)]}`}>
                          {scopeStatusLabel[getOrderStatusValue(order)]}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-[#4c453d]">
                        <div>
                          <span className="font-medium text-[#2d2922]">Cégnév:</span> {order.invoice_company_name || 'Nincs megadva'}
                        </div>
                        <div>
                          <span className="font-medium text-[#2d2922]">Adószám:</span> {order.invoice_tax_number || 'Nincs megadva'}
                        </div>
                        <div>
                          <span className="font-medium text-[#2d2922]">E-mail:</span> {order.invoice_email || order.customer_email}
                        </div>
                        <div>
                          <span className="font-medium text-[#2d2922]">Összeg:</span> {fmtMoney(order.total_price)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingOrder(order)}
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#d9d0c2] bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2d2922] hover:border-[#a35e29]"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Számla szerkesztése
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'coupons' && (
          <section className="rounded-[28px] border border-[#e3ded3] bg-white p-6 shadow-[0_18px_40px_rgba(35,28,21,0.04)]">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#827a6d]">Kuponok</p>
                <h2 className="mt-2 text-3xl font-medium tracking-[-0.05em] text-[#2d2922]">Kuponkezelés</h2>
              </div>
              <div className="rounded-full bg-[#f2eadc] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6b5539]">
                {coupons.filter((coupon) => coupon.active).length} aktív kupon
              </div>
            </div>

            <form onSubmit={handleSaveCoupon} className="mb-8 grid gap-4 rounded-[24px] border border-[#e3ded3] bg-[#faf7f2] p-5 md:grid-cols-2 xl:grid-cols-6">
              <label className="block xl:col-span-1">
                <span className="mb-2 block text-sm font-medium text-[#4c453d]">Kupon kód</span>
                <input
                  value={couponForm.code}
                  onChange={(event) => setCouponForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
                  placeholder="ZSUL10"
                  className="w-full rounded-2xl border border-[#dad0c3] bg-white px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                />
              </label>

              <label className="block xl:col-span-1">
                <span className="mb-2 block text-sm font-medium text-[#4c453d]">Kedvezmény %</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={couponForm.discount_percent}
                  onChange={(event) => setCouponForm((current) => ({ ...current, discount_percent: Number(event.target.value) }))}
                  className="w-full rounded-2xl border border-[#dad0c3] bg-white px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                />
              </label>

              <label className="block xl:col-span-1">
                <span className="mb-2 block text-sm font-medium text-[#4c453d]">Fix leárazás (Ft)</span>
                <input
                  type="number"
                  min={0}
                  value={couponForm.discount_amount}
                  onChange={(event) => setCouponForm((current) => ({ ...current, discount_amount: Number(event.target.value) }))}
                  className="w-full rounded-2xl border border-[#dad0c3] bg-white px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                />
              </label>

              <label className="block xl:col-span-1">
                <span className="mb-2 block text-sm font-medium text-[#4c453d]">Termék ID</span>
                <input
                  value={couponForm.product_id}
                  onChange={(event) => setCouponForm((current) => ({ ...current, product_id: event.target.value }))}
                  placeholder="termek-id"
                  className="w-full rounded-2xl border border-[#dad0c3] bg-white px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                />
              </label>

              <label className="block xl:col-span-1">
                <span className="mb-2 block text-sm font-medium text-[#4c453d]">Termék név</span>
                <input
                  value={couponForm.product_title}
                  onChange={(event) => setCouponForm((current) => ({ ...current, product_title: event.target.value }))}
                  placeholder="Paleolit kenyér"
                  className="w-full rounded-2xl border border-[#dad0c3] bg-white px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                />
              </label>

              <label className="block xl:col-span-1">
                <span className="mb-2 block text-sm font-medium text-[#4c453d]">Leírás</span>
                <input
                  value={couponForm.description}
                  onChange={(event) => setCouponForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Nyári kedvezmény"
                  className="w-full rounded-2xl border border-[#dad0c3] bg-white px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                />
              </label>

              <div className="flex items-end gap-3 xl:col-span-6">
                <label className="flex items-center gap-2 text-sm font-medium text-[#4c453d]">
                  <input
                    type="checkbox"
                    checked={couponForm.active}
                    onChange={(event) => setCouponForm((current) => ({ ...current, active: event.target.checked }))}
                    className="h-4 w-4 accent-[#2d2922]"
                  />
                  Aktív
                </label>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-[#2d2922] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#1e1b18]"
                >
                  {couponForm.id ? 'Mentés' : 'Létrehozás'}
                </button>
              </div>
            </form>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {coupons.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-[#d8cab1] bg-[#faf7f2] p-6 text-sm text-[#5d564f] md:col-span-2 xl:col-span-3">
                  Még nincs létrehozott kupon.
                </div>
              ) : (
                coupons.map((coupon) => (
                  <div key={coupon.id} className="rounded-[24px] border border-[#e3ded3] bg-[#faf7f2] p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="text-lg font-semibold text-[#2d2922]">{coupon.code}</div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${coupon.active ? 'bg-[#eaf5eb] text-[#2a7b46]' : 'bg-[#fbe9e7] text-[#9a3c2c]'}`}>
                        {coupon.active ? 'Aktív' : 'Inaktív'}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-[#4c453d]">
                      <div><span className="font-medium text-[#2d2922]">Kedvezmény:</span> {coupon.discount_percent ? `${coupon.discount_percent}%` : `${coupon.discount_amount ?? 0} Ft`}</div>
                      {coupon.discount_amount ? <div><span className="font-medium text-[#2d2922]">Fix összeg:</span> {coupon.discount_amount} Ft</div> : null}
                      {coupon.product_id ? <div><span className="font-medium text-[#2d2922]">Termék:</span> {coupon.product_title || coupon.product_id}</div> : null}
                      <div><span className="font-medium text-[#2d2922]">Leírás:</span> {coupon.description || 'Nincs megadva'}</div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditCoupon(coupon)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#d9d0c2] bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2d2922] hover:border-[#a35e29]"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Szerkesztés
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#e7c4bc] bg-[#fff4f2] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b3d30] hover:border-[#af5646]"
                      >
                        <Delete className="h-3.5 w-3.5" />
                        Törlés
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

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
                  <span className="mb-2 block text-sm font-medium text-[#4c453d]">Vezetéknév</span>
                  <input
                    value={editingOrder.customer_last_name ?? splitCustomerName(editingOrder.customer_name).lastName}
                    onChange={(event) =>
                      setEditingOrder({
                        ...editingOrder,
                        customer_last_name: event.target.value,
                        customer_name: buildFullName(
                          editingOrder.customer_first_name ?? splitCustomerName(editingOrder.customer_name).firstName,
                          event.target.value,
                        ),
                      })
                    }
                    className="w-full rounded-2xl border border-[#dad0c3] bg-[#faf8f5] px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#4c453d]">Keresztnév</span>
                  <input
                    value={editingOrder.customer_first_name ?? splitCustomerName(editingOrder.customer_name).firstName}
                    onChange={(event) =>
                      setEditingOrder({
                        ...editingOrder,
                        customer_first_name: event.target.value,
                        customer_name: buildFullName(
                          event.target.value,
                          editingOrder.customer_last_name ?? splitCustomerName(editingOrder.customer_name).lastName,
                        ),
                      })
                    }
                    className="w-full rounded-2xl border border-[#dad0c3] bg-[#faf8f5] px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                  />
                </label>

                <label className="block md:col-span-2">
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

              <div className="rounded-[24px] border border-[#e8dfd0] bg-[#faf7f2] p-4">
                <div className="mb-4 flex items-center gap-3">
                  <input
                    id="invoice-required"
                    type="checkbox"
                    checked={Boolean(editingOrder.invoice_required)}
                    onChange={(event) => setEditingOrder({ ...editingOrder, invoice_required: event.target.checked })}
                    className="h-4 w-4 rounded border-[#cbbda5] text-[#2d2922] focus:ring-[#2d2922]"
                  />
                  <label htmlFor="invoice-required" className="text-sm font-medium text-[#2d2922]">
                    Számla szükséges
                  </label>
                </div>

                {editingOrder.invoice_required && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-[#4c453d]">Cégnév</span>
                      <input
                        value={editingOrder.invoice_company_name ?? ''}
                        onChange={(event) => setEditingOrder({ ...editingOrder, invoice_company_name: event.target.value })}
                        className="w-full rounded-2xl border border-[#dad0c3] bg-white px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-[#4c453d]">Adószám</span>
                      <input
                        value={editingOrder.invoice_tax_number ?? ''}
                        onChange={(event) => setEditingOrder({ ...editingOrder, invoice_tax_number: event.target.value })}
                        className="w-full rounded-2xl border border-[#dad0c3] bg-white px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-medium text-[#4c453d]">Számlázási cím</span>
                      <textarea
                        value={editingOrder.invoice_address ?? ''}
                        onChange={(event) => setEditingOrder({ ...editingOrder, invoice_address: event.target.value })}
                        className="min-h-[100px] w-full rounded-2xl border border-[#dad0c3] bg-white px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-medium text-[#4c453d]">Számla e-mail</span>
                      <input
                        type="email"
                        value={editingOrder.invoice_email ?? ''}
                        onChange={(event) => setEditingOrder({ ...editingOrder, invoice_email: event.target.value })}
                        className="w-full rounded-2xl border border-[#dad0c3] bg-white px-4 py-3 text-sm text-[#2c2924] outline-none focus:border-[#2d2922]"
                      />
                    </label>
                  </div>
                )}
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
