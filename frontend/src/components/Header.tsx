'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Home,
  Info,
  Menu,
  NotebookText,
  Package,
  ShoppingBag,
  X,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

const navigation = [
  { label: 'Főoldal', href: '/', icon: Home },
  { label: 'Portékák', href: '/#products', icon: Package },
  { label: 'Rólunk', href: '/#about', icon: Info },
  { label: 'Blog', href: '/#blog', icon: NotebookText },
];

const logoUrl =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000204-8933c8933e/450/Zs%C3%BCl%20port%C3%A9k%C3%A1i%20logo.webp?ph=4e95f92e87';

export default function Header() {
  const { totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-amber-100 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Zsül Portékái kezdőlap">
          <div className="relative h-11 w-28 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm sm:h-12 sm:w-32">
            <Image
              src={logoUrl}
              alt="Zsül Portékái logó"
              fill
              sizes="(max-width: 640px) 112px, 128px"
              className="object-contain p-1.5"
              priority
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 p-1 shadow-sm md:flex">
          {navigation.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-3.5 py-2 text-sm font-medium text-neutral-600 transition-all duration-300 hover:text-neutral-900"
            >
              <span className="absolute inset-0 -z-10 scale-0 rounded-full bg-white transition-transform duration-300 group-hover:scale-100" />
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Menü"
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:border-amber-200 hover:text-neutral-900 md:hidden"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <Link
            href="/checkout"
            aria-label="Kosár"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-neutral-900 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-neutral-800"
          >
            <ShoppingBag className="h-4 w-4" />
            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-neutral-900">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-neutral-200 bg-white md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {navigation.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
