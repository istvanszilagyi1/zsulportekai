'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Home, Landmark } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') ?? 'ismeretlen';
  const paymentMethod = searchParams.get('payment') ?? 'bank_transfer';
  const paymentStatus = searchParams.get('status') ?? 'pending';
  const sessionId = searchParams.get('session_id');
  const [isVerifyingStripe, setIsVerifyingStripe] = useState(false);
  const [hasStripeVerificationError, setHasStripeVerificationError] = useState(false);

  useEffect(() => {
    if (paymentMethod !== 'stripe' || !sessionId || !orderId || paymentStatus === 'paid') {
      return;
    }

    let isMounted = true;

    const verifyStripePayment = async () => {
      try {
        setIsVerifyingStripe(true);
        setHasStripeVerificationError(false);

        const response = await fetch(`/api/stripe/verify?order_id=${encodeURIComponent(orderId)}&session_id=${encodeURIComponent(sessionId)}`);
        const payload = await response.json();

        if (!isMounted) {
          return;
        }

        if (!response.ok || !payload?.paid) {
          setHasStripeVerificationError(true);
          return;
        }
      } catch (error) {
        console.error('Stripe verification failed:', error);
        if (isMounted) {
          setHasStripeVerificationError(true);
        }
      } finally {
        if (isMounted) {
          setIsVerifyingStripe(false);
        }
      }
    };

    verifyStripePayment();

    return () => {
      isMounted = false;
    };
  }, [orderId, paymentMethod, paymentStatus, sessionId]);

  const isPaid = paymentStatus === 'paid' || paymentMethod === 'stripe';

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f4ed] px-6 py-16 text-[#27251f]">
      <div className="w-full max-w-2xl rounded-[30px] border border-[#e3ded3] bg-white p-8 shadow-[0_18px_40px_rgba(35,28,21,0.06)] sm:p-12">
        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${isPaid ? 'bg-[#eaf5eb] text-[#2a7b46]' : 'bg-[#f5efe5] text-[#8b6d3d]'}`}>
          {isPaid ? <CheckCircle2 className="h-8 w-8" /> : <Landmark className="h-8 w-8" />}
        </div>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#847c70]">
          {isPaid ? 'Fizetés sikeres' : 'Rendelés elküldve'}
        </p>

        <h1 className="mt-4 text-4xl font-medium tracking-[-0.06em] text-[#2d2922] sm:text-5xl">
          {isPaid ? 'Köszönjük a megrendelést!' : 'Rendelésedet fogadtuk!'}
        </h1>

        {paymentMethod === 'stripe' && isVerifyingStripe && (
          <p className="mt-5 max-w-lg text-base leading-7 text-[#675f57]">
            A Stripe fizetés ellenőrzése folyamatban van. Egy pillanat múlva a rendelés automatikusan frissül.
          </p>
        )}

        {paymentMethod === 'stripe' && hasStripeVerificationError && (
          <p className="mt-5 max-w-lg text-base leading-7 text-[#8e4a2d]">
            A Stripe fizetési ellenőrzés sikertelen volt, de a rendelés adatai megmaradtak. Kérjük, vedd fel velünk a kapcsolatot.
          </p>
        )}

        {!isVerifyingStripe && !hasStripeVerificationError && (
          <p className="mt-5 max-w-lg text-base leading-7 text-[#675f57]">
            {isPaid
              ? 'Az online fizetés sikeresen lezárult. A rendelésedet rögzítettük és feldolgozásra került.'
              : 'A rendelésedet rögzítettük. A banki átutalási részleteket elküldjük a megadott e-mail címre, és a rendelés feldolgozása a befizetés ellenőrzését követően kezdődik meg.'}
          </p>
        )}

        <div className="mt-8 rounded-[22px] border border-[#e8e0d4] bg-[#faf8f5] p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7e756a]">
            Megrendelés azonosító
          </p>
          <p className="mt-2 text-lg font-semibold tracking-[0.08em] text-[#2d2922]">#{orderId}</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-3 rounded-full bg-[#2d2922] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1f1b17]"
          >
            Vissza a főoldalra
            <Home className="h-4 w-4" />
          </Link>

          <a
            href="#products"
            className="inline-flex items-center justify-center gap-3 rounded-full border border-[#dbd2c5] bg-white px-5 py-3 text-sm font-semibold text-[#302d27] transition hover:bg-[#f5f1ea]"
          >
            További termékek
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f7f4ed] text-[#2d2922]">Betöltés...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
