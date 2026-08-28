'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, Leaf, Menu, Package, ShoppingBag, Star, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const navigation = [
  { label: 'Portékáink', href: '#products', icon: Package },
  { label: 'A Manufaktúráról', href: '#about', icon: Heart },
  { label: 'Hogyan készül?', href: '#story', icon: Leaf },
  { label: 'Vélemények', href: '#reviews', icon: Star },
];

const logoUrl =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000204-8933c8933e/450/Zs%C3%BCl%20port%C3%A9k%C3%A1i%20logo.webp?ph=4e95f92e87';

export default function Header() {
  const { totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e5e0d6] bg-[#f7f4ed]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-6 sm:px-10 lg:px-16">
        <a href="/" aria-label="Zsül Portékái kezdőlap" className="group flex items-center">
          <Image
            src={logoUrl}
            alt="Zsül Portékái"
            width={170}
            height={62}
            priority
            className="h-auto w-[125px] object-contain mix-blend-multiply transition-opacity duration-300 group-hover:opacity-70 sm:w-[145px]"
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

          <a
            href="#products"
            aria-label="Kosár"
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
          </a>
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
            <a
              href="#products"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.2em] text-[#302d27]"
            >
              <span>Portékák megtekintése</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#302d27]">
                <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
              </span>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
