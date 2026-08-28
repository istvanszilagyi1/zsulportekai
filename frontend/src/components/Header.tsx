'use client';

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
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b border-[#e5e0d6] bg-[#f7f4ed]/95 backdrop-blur-md transition-all duration-300 ease-out ${
          scrollY > 0 ? 'shadow-[0_12px_24px_rgba(29,25,20,0.06)]' : ''
        }`}
      >
        <div className="mx-auto flex h-[68px] max-w-[1500px] items-center justify-between px-6 sm:px-10 lg:px-16">
          <a
            href="/"
            aria-label="Zsül Portékái kezdőlap"
            className="group relative z-10 flex shrink-0 items-center overflow-hidden pr-2"
          >
            <Image
              src={logoUrl}
              alt="Zsül Portékái"
              width={150}
              height={52}
              priority
              className="h-auto w-[90px] max-w-none object-contain mix-blend-multiply transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-[1.03] group-hover:opacity-75 sm:w-[118px]"
            />
          </a>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex">
            {navigation.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="group relative py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#706a5e] transition-colors duration-300 hover:text-[#292720]"
              >
                {label}
                <span className="absolute bottom-0 left-0 h-px w-0 bg-[#292720] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={isOpen ? 'Menü bezárása' : 'Menü megnyitása'}
              aria-expanded={isOpen}
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center text-[#39362f] transition hover:text-[#8a806d] lg:hidden"
            >
              {isOpen ? (
                <X className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label="Kosár megnyitása"
              className="group relative flex items-center gap-2 border-l border-[#ddd7cb] pl-4 text-[#302d27] transition hover:text-[#837761]"
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />

              <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] sm:inline">
                Kosár
              </span>

              {totalItems > 0 && (
                <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#302d27] px-1 text-[8px] font-semibold text-[#f7f4ed]">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden border-t border-[#e5e0d6] bg-[#f7f4ed] transition-all duration-300 lg:hidden ${
            isOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 border-t-transparent opacity-0'
          }`}
        >
          <nav className="mx-auto max-w-[1500px] px-6 py-5 sm:px-10">
            <div className="divide-y divide-[#e5e0d6]">
              {navigation.map(({ label, href, icon: Icon }, index) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center justify-between py-4 text-[#302d27]"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-medium tracking-[0.15em] text-[#aaa396]">
                      0{index + 1}
                    </span>
                    <span className="text-sm font-medium">{label}</span>
                  </div>

                  <Icon
                    className="h-4 w-4 text-[#8f887b] transition-transform duration-300 group-hover:translate-x-1"
                    strokeWidth={1.5}
                  />
                </a>
              ))}
            </div>

            <div className="mt-3 border-t border-[#e5e0d6] pt-5">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsCartOpen(true);
                }}
                className="flex w-full items-center justify-between text-left text-[10px] font-medium uppercase tracking-[0.2em] text-[#302d27]"
              >
                <span>Portékák megtekintése</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#302d27]">
                  <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                </span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[60] bg-black/20 transition-opacity duration-300 ${
          isCartOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-[#e2dccf] bg-[#f7f4ed] shadow-[0_24px_90px_rgba(32,28,20,0.18)] transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Kosár"
      >
        <div className="flex items-center justify-between border-b border-[#e2dccf] px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#8a806d]">
              Kosár
            </p>
            <h2 className="mt-1 text-2xl font-medium tracking-[-0.04em] text-[#27251f]">
              Rendelés összefoglaló
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Kosár bezárása"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8d1c3] text-[#302d27] transition hover:bg-[#efe9df]"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#efe9df] text-[#302d27]">
                <ShoppingBag className="h-7 w-7" strokeWidth={1.2} />
              </div>

              <p className="mt-6 text-xl font-medium tracking-[-0.03em] text-[#2c2923]">
                A kosár még üres.
              </p>

              <p className="mt-2 max-w-xs text-sm leading-6 text-[#706b62]">
                Válassz kedvenc termékeink közül, és már itt is összeállíthatod a rendelésed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-3 border border-[#e8e1d5] bg-[#f2eee6] p-3"
                >
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-[#e5dfd4]">
                    <img
                      src={resolveProductImage(product, logoUrl)}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#27251f]">{product.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#8a806d]">
                          {product.price.toLocaleString('hu-HU')} Ft
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id)}
                        aria-label={`${product.title} eltávolítása a kosárból`}
                        className="text-[#6d655d] transition hover:text-[#292720]"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-[#d9d0c0] bg-[#f7f4ed]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, -1)}
                          aria-label="Mennyiség csökkentése"
                          className="flex h-8 w-8 items-center justify-center text-[#302d27] transition hover:bg-[#efe9df]"
                        >
                          <Minus className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </button>

                        <span className="min-w-[34px] text-center text-xs font-medium uppercase tracking-[0.12em] text-[#302d27]">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, 1)}
                          aria-label="Mennyiség növelése"
                          className="flex h-8 w-8 items-center justify-center text-[#302d27] transition hover:bg-[#efe9df]"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </button>
                      </div>

                      <p className="text-sm font-medium text-[#27251f]">
                        {(product.price * quantity).toLocaleString('hu-HU')} Ft
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-[#e2dccf] bg-[#f2eee6] px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between text-sm text-[#544f47]">
              <span>Összesen</span>
              <span className="text-xl font-medium tracking-[-0.04em] text-[#27251f]">
                {totalPrice.toLocaleString('hu-HU')} Ft
              </span>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={clearCart}
                className="flex-1 border border-[#d7cebf] bg-transparent px-4 py-3 text-xs font-medium uppercase tracking-[0.18em] text-[#4c483f] transition hover:bg-[#efe8dd]"
              >
                Kosár ürítése
              </button>

              <button
                type="button"
                className="flex-1 bg-[#302d27] px-4 py-3 text-xs font-medium uppercase tracking-[0.18em] text-[#f7f4ed] transition hover:bg-[#1f1d1a]"
              >
                Tovább
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
