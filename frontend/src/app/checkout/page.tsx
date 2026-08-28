'use client';

import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Check,
  CreditCard,
  Home,
  Landmark,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  ShieldCheck,
  Truck,
  UserRound,
} from 'lucide-react';
import Header from '@/components/Header';
import FoxpostPicker, { type FoxpostSelection } from '@/components/FoxpostPicker';
import { useCart } from '@/context/CartContext';
import { getImageUrl, pb } from '@/lib/pocketbase';
import type { PaymentMethod } from '@/types';

const resolveProductImage = (product: { image?: string | null } | null, fallback = '/placeholder.png') => {
  if (!product?.image) return fallback;

  if (typeof product.image === 'string' && /^https?:\/\//.test(product.image)) {
    return product.image;
  }

  if (typeof product.image === 'string' && product.image.startsWith('data:')) {
    return product.image;
  }

  return getImageUrl(product, product.image);
};

type DeliveryMethod = 'foxpost' | 'home_delivery';

const deliveryOptions: Array<{
  value: DeliveryMethod;
  label: string;
  description: string;
  icon: typeof Truck;
}> = [
  {
    value: 'foxpost',
    label: 'Foxpost csomagautomata',
    description: 'Válaszd ki a legközelebbi automatahelyet.',
    icon: PackageCheck,
  },
  {
    value: 'home_delivery',
    label: 'Házhozszállítás',
    description: 'Férőhelyes, kézbesítés a megadott címre.',
    icon: Home,
  },
];

const paymentOptions: Array<{
  value: PaymentMethod;
  label: string;
  description: string;
  icon: typeof Landmark;
}> = [
  {
    value: 'bank_transfer',
    label: 'Banki átutalás',
    description: 'A megrendelés leadása után a banki utalás adatai elküldésre kerül, és a rendelés feldolgozása a befizetés ellenőrzése után kezdődik.',
    icon: Landmark,
  },
  {
    value: 'stripe',
    label: 'Stripe online fizetés',
    description: 'Sikeres fizetés után automatikusan továbbhalad a folyamat.',
    icon: CreditCard,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice, clearCart } = useCart();

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('foxpost');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [foxpostSelection, setFoxpostSelection] = useState<FoxpostSelection | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    street: '',
    zip: '',
    companyName: '',
    taxNumber: '',
    invoiceAddress: '',
    invoiceEmail: '',
    wantsInvoice: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const shippingCost = 0;

  const orderTotal = useMemo(() => totalPrice + shippingCost, [totalPrice]);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const canSubmit = cart.length > 0 && !isSubmitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!cart.length) {
      setError('A kosár üres, előbb adj hozzá termékeket.');
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Kérjük, add meg a vevő adatait.');
      return;
    }

    if (deliveryMethod === 'foxpost' && !foxpostSelection) {
      setError('Kérjük, válassz ki a Foxpost csomagautomata helyét.');
      return;
    }

    if (
      formData.wantsInvoice &&
      (!formData.companyName.trim() || !formData.taxNumber.trim() || !formData.invoiceAddress.trim())
    ) {
      setError('A számla kiállításához add meg a cég neve, adószám és számlázási cím mezőket.');
      return;
    }

    if (
      deliveryMethod === 'home_delivery' &&
      (!formData.city.trim() || !formData.street.trim() || !formData.zip.trim())
    ) {
      setError('Kérjük, add meg a szállítási címet.');
      return;
    }

    setIsSubmitting(true);

    try {
      const isPaid = paymentMethod === 'stripe';
      const payload = {
        customer_name: formData.name.trim(),
        customer_email: formData.email.trim(),
        customer_phone: formData.phone.trim(),
        delivery_method: deliveryMethod,
        payment_method: paymentMethod,
        payment_status: isPaid ? 'paid' : 'pending',
        invoice_required: formData.wantsInvoice,
        invoice_company_name: formData.wantsInvoice ? formData.companyName.trim() : undefined,
        invoice_tax_number: formData.wantsInvoice ? formData.taxNumber.trim() : undefined,
        invoice_address: formData.wantsInvoice ? formData.invoiceAddress.trim() : undefined,
        invoice_email: formData.wantsInvoice ? formData.invoiceEmail.trim() || formData.email.trim() : undefined,
        items: cart.map(({ product, quantity }) => ({
          id: product.id,
          title: product.title,
          price: product.price,
          quantity,
        })),
        total_price: orderTotal,
        status: isPaid ? 'paid' : 'pending',
        ...(deliveryMethod === 'foxpost'
          ? {
              foxpost_place_id: foxpostSelection?.id,
              foxpost_place_name: foxpostSelection?.name,
              foxpost_place_address: foxpostSelection?.address,
            }
          : {
              shipping_address: `${formData.street.trim()}, ${formData.zip.trim()} ${formData.city.trim()}`,
            }),
      };

      const createdOrder = await pb.collection('orders').create(payload as Record<string, unknown>);

      clearCart();
      router.push(
        `/order-success?id=${createdOrder.id}&payment=${paymentMethod}&status=${isPaid ? 'paid' : 'pending'}`
      );
    } catch (submitError) {
      console.error('Hiba a rendelés mentésekor:', submitError);
      setError('A rendelés leadása közben hiba történt. Próbáld újra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cart.length) {
    return (
      <div className="min-h-screen bg-[#f7f4ed] text-[#27251f]">
        <Header />

        <main className="mx-auto max-w-4xl px-6 py-16 sm:px-10 lg:px-16">
          <div className="rounded-[28px] border border-[#e2dccf] bg-white p-8 shadow-[0_18px_40px_rgba(35,28,21,0.06)] sm:p-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f3ecdf] text-[#5c534a]">
              <PackageCheck className="h-7 w-7" />
            </div>

            <h1 className="mt-6 text-3xl font-medium tracking-[-0.05em] text-[#2d2922] sm:text-4xl">
              A kosarad jelenleg üres.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-[#6a625b]">
              Válassz néhány természetes alapanyagot, majd térj vissza a pénztárhoz.
            </p>

            <a
              href="/"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#2d2922] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1b1915]"
            >
              Vissza a főoldalra
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-[#27251f]">
      <Header />

      <main className="mx-auto max-w-[1280px] px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#827a6d]">
            01 — Pénztár
          </p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.06em] text-[#2c2924] sm:text-5xl lg:text-6xl">
            Rendelés és szállítás
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-[#e3ded3] bg-white p-6 shadow-[0_18px_40px_rgba(35,28,21,0.05)] sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3ecdf] text-[#675f54]">
                  <UserRound className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-medium tracking-[-0.04em] text-[#2d2922]">
                  Vevő adatai
                </h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-sm font-medium text-[#4c453d]">Név</span>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f867b]" />
                    <input
                      value={formData.name}
                      onChange={(event) => updateField('name', event.target.value)}
                      placeholder="Példa Béla"
                      className="w-full rounded-2xl border border-[#dad0c3] bg-[#faf8f5] py-3 pl-10 pr-4 text-sm text-[#2c2924] outline-none transition placeholder:text-[#9a9288] focus:border-[#2d2922]"
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#4c453d]">E-mail</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f867b]" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(event) => updateField('email', event.target.value)}
                      placeholder="pelda@meail.hu"
                      className="w-full rounded-2xl border border-[#dad0c3] bg-[#faf8f5] py-3 pl-10 pr-4 text-sm text-[#2c2924] outline-none transition placeholder:text-[#9a9288] focus:border-[#2d2922]"
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#4c453d]">Telefonszám</span>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f867b]" />
                    <input
                      value={formData.phone}
                      onChange={(event) => updateField('phone', event.target.value)}
                      placeholder="+36 20 123 4567"
                      className="w-full rounded-2xl border border-[#dad0c3] bg-[#faf8f5] py-3 pl-10 pr-4 text-sm text-[#2c2924] outline-none transition placeholder:text-[#9a9288] focus:border-[#2d2922]"
                    />
                  </div>
                </label>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#e3ded3] bg-white p-6 shadow-[0_18px_40px_rgba(35,28,21,0.05)] sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3ecdf] text-[#675f54]">
                  <Truck className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-medium tracking-[-0.04em] text-[#2d2922]">
                  Szállítási mód
                </h2>
              </div>

              <div className="mb-5 rounded-[20px] border border-[#e7e0d4] bg-[#faf8f4] p-4 text-sm leading-6 text-[#5e564d]">
                A Foxpost automata kiválasztásánál a legközelebbi átvételi pontot választhatod ki a megjelenő alkalmazásban. A kiválasztott hely automatikusan mentésre kerül a rendeléshez.
              </div>

              <div className="space-y-3">
                {deliveryOptions.map(({ value, label, description, icon: Icon }) => {
                  const selected = deliveryMethod === value;

                  return (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-start gap-4 rounded-[22px] border p-4 transition ${
                        selected
                          ? 'border-[#2d2922] bg-[#f8f4ef] shadow-[0_10px_25px_rgba(45,41,34,0.06)]'
                          : 'border-[#dfd7cc] bg-[#faf8f5] hover:border-[#cfc2a9]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value={value}
                        checked={selected}
                        onChange={() => setDeliveryMethod(value)}
                        className="mt-1 h-4 w-4 accent-[#2d2922]"
                      />

                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#efe7db] text-[#473f36]">
                        <Icon className="h-4 w-4" />
                      </span>

                      <span className="flex-1">
                        <span className="block text-base font-medium text-[#2d2922]">{label}</span>
                        <span className="mt-1 block text-sm leading-6 text-[#706a63]">
                          {description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-6">
                {deliveryMethod === 'foxpost' ? (
                  <div className="rounded-[22px] border border-[#e0d8cb] bg-[#faf8f5] p-4 sm:p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ebf7ee] text-[#2d7b46]">
                        <PackageCheck className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium text-[#2d2922]">
                        Válassz automatahelyet
                      </p>
                    </div>

                    <FoxpostPicker onSelect={setFoxpostSelection} />
                  </div>
                ) : (
                  <div className="grid gap-5 rounded-[22px] border border-[#e0d8cb] bg-[#faf8f5] p-4 sm:grid-cols-2 sm:p-5">
                    <label className="flex flex-col gap-2 sm:col-span-2">
                      <span className="text-sm font-medium text-[#4c453d]">Utca, házszám</span>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f867b]" />
                        <input
                          value={formData.street}
                          onChange={(event) => updateField('street', event.target.value)}
                          placeholder="Kossuth Lajos utca 12."
                          className="w-full rounded-2xl border border-[#dad0c3] bg-white py-3 pl-10 pr-4 text-sm text-[#2c2924] outline-none transition placeholder:text-[#9a9288] focus:border-[#2d2922]"
                        />
                      </div>
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-[#4c453d]">Város</span>
                      <input
                        value={formData.city}
                        onChange={(event) => updateField('city', event.target.value)}
                        placeholder="Hajdúböszörmény"
                        className="w-full rounded-2xl border border-[#dad0c3] bg-white px-4 py-3 text-sm text-[#2c2924] outline-none transition placeholder:text-[#9a9288] focus:border-[#2d2922]"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-[#4c453d]">Irányítószám</span>
                      <input
                        value={formData.zip}
                        onChange={(event) => updateField('zip', event.target.value)}
                        placeholder="4220"
                        className="w-full rounded-2xl border border-[#dad0c3] bg-white px-4 py-3 text-sm text-[#2c2924] outline-none transition placeholder:text-[#9a9288] focus:border-[#2d2922]"
                      />
                    </label>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-[#e3ded3] bg-white p-6 shadow-[0_18px_40px_rgba(35,28,21,0.05)] sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3ecdf] text-[#675f54]">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-medium tracking-[-0.04em] text-[#2d2922]">
                  Fizetési mód
                </h2>
              </div>

              <div className="space-y-3">
                {paymentOptions.map(({ value, label, description, icon: Icon }) => {
                  const selected = paymentMethod === value;

                  return (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-start gap-4 rounded-[22px] border p-4 transition ${
                        selected
                          ? 'border-[#2d2922] bg-[#f8f4ef] shadow-[0_10px_25px_rgba(45,41,34,0.06)]'
                          : 'border-[#dfd7cc] bg-[#faf8f5] hover:border-[#cfc2a9]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={value}
                        checked={selected}
                        onChange={() => setPaymentMethod(value)}
                        className="mt-1 h-4 w-4 accent-[#2d2922]"
                      />

                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#efe7db] text-[#473f36]">
                        <Icon className="h-4 w-4" />
                      </span>

                      <span className="flex-1">
                        <span className="block text-base font-medium text-[#2d2922]">{label}</span>
                        <span className="mt-1 block text-sm leading-6 text-[#706a63]">
                          {description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-6 rounded-[22px] border border-[#e8e0d5] bg-[#faf8f5] p-4 text-sm leading-6 text-[#5d554d]">
                A rendelés leadása után a banki átutalás részleteit e-mailben elküldjük. A fizetési igazolás megérkezése után kezdődik meg a kiszállítás vagy az átvétel előkészítése.
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-[18px] border border-[#e3ded3] bg-white p-3">
                <input
                  id="wantsInvoice"
                  type="checkbox"
                  checked={formData.wantsInvoice}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      wantsInvoice: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-[#2d2922]"
                />
                <label htmlFor="wantsInvoice" className="text-sm font-medium text-[#2d2922]">
                  Számlát kérek a rendelésre
                </label>
              </div>

              {formData.wantsInvoice && (
                <div className="mt-5 grid gap-5 rounded-[22px] border border-[#e0d8cb] bg-[#faf8f5] p-4 sm:grid-cols-2 sm:p-5">
                  <label className="flex flex-col gap-2 sm:col-span-2">
                    <span className="text-sm font-medium text-[#4c453d]">Cégnév</span>
                    <input
                      value={formData.companyName}
                      onChange={(event) => updateField('companyName', event.target.value)}
                      placeholder="Zsül Portékái Kft."
                      className="w-full rounded-2xl border border-[#dad0c3] bg-white px-4 py-3 text-sm text-[#2c2924] outline-none transition placeholder:text-[#9a9288] focus:border-[#2d2922]"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-[#4c453d]">Adószám</span>
                    <input
                      value={formData.taxNumber}
                      onChange={(event) => updateField('taxNumber', event.target.value)}
                      placeholder="12345678-2-10"
                      className="w-full rounded-2xl border border-[#dad0c3] bg-white px-4 py-3 text-sm text-[#2c2924] outline-none transition placeholder:text-[#9a9288] focus:border-[#2d2922]"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-[#4c453d]">Számla e-mail</span>
                    <input
                      type="email"
                      value={formData.invoiceEmail}
                      onChange={(event) => updateField('invoiceEmail', event.target.value)}
                      placeholder="szamla@pelda.hu"
                      className="w-full rounded-2xl border border-[#dad0c3] bg-white px-4 py-3 text-sm text-[#2c2924] outline-none transition placeholder:text-[#9a9288] focus:border-[#2d2922]"
                    />
                  </label>

                  <label className="flex flex-col gap-2 sm:col-span-2">
                    <span className="text-sm font-medium text-[#4c453d]">Számlázási cím</span>
                    <textarea
                      value={formData.invoiceAddress}
                      onChange={(event) => updateField('invoiceAddress', event.target.value)}
                      placeholder="1234 Budapest, Példa utca 13."
                      rows={3}
                      className="w-full rounded-2xl border border-[#dad0c3] bg-white px-4 py-3 text-sm text-[#2c2924] outline-none transition placeholder:text-[#9a9288] focus:border-[#2d2922]"
                    />
                  </label>
                </div>
              )}
            </section>
          </div>

          <aside className="lg:pt-2">
            <div className="rounded-[28px] border border-[#e3ded3] bg-[#f9f5ef] p-6 shadow-[0_18px_40px_rgba(35,28,21,0.04)] sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#efe7db] text-[#4a4339]">
                  <Check className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-medium tracking-[-0.04em] text-[#2d2922]">
                  Rendelési összesítő
                </h2>
              </div>

              <div className="mt-6 space-y-3">
                {cart.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-start justify-between gap-3 border-b border-[#e5dfd3] pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#efe7db]">
                        <img
                          src={resolveProductImage(product, '/placeholder.png')}
                          alt={product.title}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src = '/placeholder.png';
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#2d2922]">{product.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#7c7369]">
                          Mennyiség: {quantity}
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-semibold text-[#2d2922]">
                      {(product.price * quantity).toLocaleString('hu-HU')} Ft
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 rounded-[22px] border border-[#e3ded3] bg-white p-4">
                <div className="flex items-center justify-between text-sm text-[#5d554d]">
                  <span>Termékek összesen</span>
                  <span>{totalPrice.toLocaleString('hu-HU')} Ft</span>
                </div>
                <div className="flex items-center justify-between text-sm text-[#5d554d]">
                  <span>Szállítás</span>
                  <span>{shippingCost.toLocaleString('hu-HU')} Ft</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#e5dfd3] pt-3 text-base font-semibold text-[#2d2922]">
                  <span>Végösszeg</span>
                  <span>{orderTotal.toLocaleString('hu-HU')} Ft</span>
                </div>
              </div>

              {error && (
                <div className="mt-5 rounded-2xl border border-[#f1c7b8] bg-[#fff1ec] px-4 py-3 text-sm text-[#8e4a2d]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                formAction={undefined}
                disabled={!canSubmit}
                className="mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-[#2d2922] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1e1b18] disabled:cursor-not-allowed disabled:bg-[#a49d93]"
              >
                {isSubmitting ? 'Rendelés feldolgozása...' : 'Megrendelés leadása'}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#726d67]">
                <ShieldCheck className="h-4 w-4 text-[#5c7a5a]" />
                Biztonságos fizetés és védett megrendelés
              </div>
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
}
