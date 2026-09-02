'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Heart,
  Leaf,
  Menu,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getImageUrl } from '@/lib/pocketbase';
import { getEffectiveProductPrice } from '@/types';

const navigation = [
  { label: 'Portékáink', href: '#products', icon: Package },
  { label: 'A Manufaktúráról', href: '#about', icon: Heart },
  { label: 'Hogyan készül?', href: '#story', icon: Leaf },
  { label: 'Vélemények', href: '#reviews', icon: Star },
];

const logoUrl =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000204-8933c8933e/450/Zs%C3%BCl%20port%C3%A9k%C3%A1i%20logo.webp?ph=4e95f92e87';

const resolveProductImage = (product: { image?: string | null } | null, fallback = logoUrl) => {
  if (!product?.image) return fallback;

  if (typeof product.image === 'string' && /^https?:\/\//.test(product.image)) {
    return product.image;
  }

  return getImageUrl(product, product.image);
};

export default function Header() {
  const { cart, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ease-in-out ${
          isScrolled
            ? 'h-14 border-b border-[#e6dfd3] bg-[#fbf9f5]/95 shadow-[0_4px_20px_rgba(43,37,28,0.05)] backdrop-blur-md'
            : 'h-16 border-b border-transparent bg-[#FAF9F5]'
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-6 sm:px-10 lg:px-12">
          <Link
            href="/"
            aria-label="Zsül Portékái kezdőlap"
            className="group relative flex h-full items-center gap-2 py-2 transition-transform duration-300"
          >
            <div
              className={`relative flex items-center justify-center transition-all duration-300 ease-out ${
                isScrolled ? 'h-8 w-8 sm:w-9' : 'h-9 w-9 sm:w-10'
              }`}
            >
              <Image
                src={logoUrl}
                alt="Zsül Portékái"
                fill
                sizes="(max-width: 640px) 36px, 40px"
                priority
                className="object-contain object-left mix-blend-multiply transition-all duration-300 group-hover:scale-105 group-hover:brightness-95"
              />
            </div>
            <span className="text-base font-semibold tracking-[-0.04em] text-[#2d2922] sm:text-lg">
              Zsül Portékái
            </span>
          </Link>

          {/* Navigáció */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navigation.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="group relative py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#5e574c] transition-colors duration-200 hover:text-[#2d2922]"
              >
                {label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#a35e29] transition-all duration-300 ease-out group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Kosár és mobil menü gombok */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label="Kosár megnyitása"
              className={`group flex items-center gap-2.5 rounded-full border border-[#ded7ca] px-3.5 py-2 text-[#2d2922] transition-all duration-200 hover:border-[#a35e29] hover:bg-[#f3ede1] ${
                isScrolled ? 'bg-[#f4efe5]' : 'bg-white/80 shadow-sm'
              }`}
            >
              <div className="relative flex items-center">
                <ShoppingBag className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.8} />
                {totalItems > 0 && (
                  <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#a35e29] px-1 text-[9px] font-bold text-white shadow-sm animate-in zoom-in-50">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold tracking-wider sm:inline">
                {totalPrice > 0 ? `${totalPrice.toLocaleString('hu-HU')} Ft` : 'Kosár'}
              </span>
            </button>

            <button
              type="button"
              aria-label={isOpen ? 'Menü bezárása' : 'Menü megnyitása'}
              aria-expanded={isOpen}
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ded7ca] text-[#2d2922] transition hover:bg-[#f3ede1] lg:hidden"
            >
              {isOpen ? (
                <X className="h-4 w-4" strokeWidth={1.8} />
              ) : (
                <Menu className="h-4 w-4" strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>

        {/* Mobil legördülő menü */}
        <div
          className={`overflow-hidden border-b border-[#e6dfd3] bg-[#fbf9f5] transition-all duration-300 lg:hidden ${
            isOpen ? 'max-h-[380px] opacity-100' : 'max-h-0 border-transparent opacity-0'
          }`}
        >
          <nav className="space-y-1 px-6 py-4">
            {navigation.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[#484237] transition hover:bg-[#ede6d8] hover:text-[#2d2922]"
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-[#8f887b]" strokeWidth={1.6} />
                  {label}
                </span>
                <span className="text-xs text-[#a35e29]">→</span>
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Kosár háttér sötétítés */}
      <div
        className={`fixed inset-0 z-[60] bg-black/25 backdrop-blur-xs transition-opacity duration-300 ${
          isCartOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Kosár oldalsáv */}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-[#e2dccf] bg-[#FAF9F5] shadow-2xl transition-transform duration-300 ease-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Kosár"
      >
        <div className="flex items-center justify-between border-b border-[#e6dfd3] px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a806d]">
              Zsül Portékái
            </p>
            <h2 className="text-xl font-bold tracking-tight text-[#2d2922]">
              Kosár tartalma
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Kosár bezárása"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ded7ca] text-[#2d2922] transition hover:bg-[#f0e9dc]"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0e9dc] text-[#5e574c]">
                <ShoppingBag className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <p className="mt-4 text-base font-semibold text-[#2d2922]">
                Üres a kosarad
              </p>
              <p className="mt-1 text-xs text-[#706b62]">
                Válogass kistermelői olajaink és gyümölcsleveink közül!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-3.5 rounded-xl border border-[#e6dfd3] bg-white p-3 shadow-xs"
                >
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[#f0e9dc]">
                    <img
                      src={resolveProductImage(product, logoUrl)}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#2d2922] line-clamp-1">{product.title}</p>
                        <p className="mt-0.5 text-xs font-medium text-[#a35e29]">
                          {getEffectiveProductPrice(product).toLocaleString('hu-HU')} Ft
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id)}
                        aria-label="Törlés"
                        className="text-[#999183] transition hover:text-[#b91c1c]"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-md border border-[#ded7ca] bg-[#FAF9F5]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, -1)}
                          className="flex h-7 w-7 items-center justify-center text-[#2d2922] transition hover:bg-[#ede6d8]"
                        >
                          <Minus className="h-3 w-3" strokeWidth={2} />
                        </button>
                        <span className="min-w-[28px] text-center text-xs font-semibold text-[#2d2922]">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, 1)}
                          className="flex h-7 w-7 items-center justify-center text-[#2d2922] transition hover:bg-[#ede6d8]"
                        >
                          <Plus className="h-3 w-3" strokeWidth={2} />
                        </button>
                      </div>

                      <p className="text-sm font-bold text-[#2d2922]">
                        {(getEffectiveProductPrice(product) * quantity).toLocaleString('hu-HU')} Ft
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-[#e6dfd3] bg-[#f7f2e8] p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#5e574c]">Összesen:</span>
              <span className="text-xl font-extrabold text-[#2d2922]">
                {totalPrice.toLocaleString('hu-HU')} Ft
              </span>
            </div>

            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={clearCart}
                className="rounded-lg border border-[#ded7ca] bg-white px-3 py-2.5 text-xs font-medium text-[#5e574c] transition hover:bg-[#f0e9dc]"
              >
                Kosár ürítése
              </button>
              <a
                href="/checkout"
                className="flex flex-1 items-center justify-center rounded-lg bg-[#2d2922] px-4 py-2.5 text-xs font-bold tracking-wider text-white transition hover:bg-[#1a1814]"
              >
                Tovább
              </a>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}