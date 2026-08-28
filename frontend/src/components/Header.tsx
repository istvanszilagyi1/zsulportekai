'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Home,
  Info,
  NotebookText,
  Package,
  ShoppingBag,
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

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Zsül Portékái kezdőlap">
          <div className="relative h-10 w-28 overflow-hidden rounded-md bg-white sm:h-12 sm:w-32">
            <Image
              src={logoUrl}
              alt="Zsül Portékái logó"
              fill
              sizes="(max-width: 640px) 112px, 128px"
              className="object-contain p-1"
              priority
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 p-1 md:flex">
          {navigation.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-white hover:text-neutral-900"
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/checkout"
            aria-label="Kosár"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:border-neutral-300 hover:text-neutral-900"
          >
            <ShoppingBag className="h-4 w-4" />
            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-semibold text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
