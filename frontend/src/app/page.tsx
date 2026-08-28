'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Heart,
  Leaf,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { pb, getImageUrl } from '@/lib/pocketbase';
import type { Product } from '@/types';

type CategoryFilter = 'all' | 'olajok' | 'szorpok' | 'lisztek';
type ProductRecord = Product & {
  category?: string;
  image?: string;
};

const logoUrl =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000204-8933c8933e/450/Zs%C3%BCl%20port%C3%A9k%C3%A1i%20logo.webp?ph=4e95f92e87';

const heroImage =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000192-fa333fa336/700/Zs%C3%BCl%20port%C3%A9k%C3%A1i%20hidegen%20sajtolt%20olaj.webp?ph=4e95f92e87';
const sunflowerImage =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000201-4458344586/700/Zs%C3%BCl%20port%C3%A9k%C3%A1i%20napraforg%C3%B3.webp?ph=4e95f92e87';
const syrupImage =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000203-7bf1c7bf1e/700/Zs%C3%BCl%20port%C3%A9k%C3%A1i%20sz%C3%B6rp.webp?ph=4e95f92e87';
const flourImage =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000202-6029560298/700/Zs%C3%BCl%20port%C3%A9k%C3%A1i%20liszt.webp?ph=4e95f92e87';

const trustBadges = [
  {
    icon: Leaf,
    title: 'Hazai Saját Termény',
    description: 'Válogatott hajdúsági napraforgó és tönkölybúza.',
  },
  {
    icon: Sparkles,
    title: 'Kíméletes Hideg Sajtolás',
    description: 'Csigás préssel, hőkezelés és vegyszeres finomítás nélkül.',
  },
  {
    icon: Heart,
    title: 'Hagyományos Ízek',
    description: 'Cukor- és adalékmentes homoktövis, berkenye és házi szörpök.',
  },
  {
    icon: Truck,
    title: 'Foxpost Csomagautomata',
    description: 'Törésbiztos csomagolás és kényelmes átvétel.',
  },
];

const categoryLabels: Record<CategoryFilter, string> = {
  all: 'Összes termék',
  olajok: 'Hidegen sajtolt olajok',
  szorpok: 'Szörpök & Gyümölcslevek',
  lisztek: 'Kézműves lisztek',
};

const testimonials = [
  {
    name: 'Kata',
    quote: 'A tökmagolaj igazán finom és természetes. A csomagolás hangulatos, a szállítás pedig rendkívül gyors volt.',
  },
  {
    name: 'András',
    quote: 'A berkenye szörp a kedvencünk. Gyümölcsös, természetes és olyan, mintha a kertünkben készült volna.',
  },
  {
    name: 'Eszter',
    quote: 'A családi manufaktúra hangulata és a minőségi alapanyagok egyszerűen megérzésekre épülnek. Minden alkalommal megéri.',
  },
];

const fallbackProducts: ProductRecord[] = [
  {
    id: 'fallback-1',
    title: 'Hidegen sajtolt tökmagolaj',
    price: 3990,
    description: 'Tömör, aranyszínű olaj, amely a magok természetes aromáját és esszenciális értékeit őrzi meg.',
    image: heroImage,
    category: 'olajok',
  },
  {
    id: 'fallback-2',
    title: 'Kézműves napraforgóolaj',
    price: 3290,
    description: 'Könnyed, friss és gazdag ízű, egészségesebb főzéshez és salátákhoz.',
    image: sunflowerImage,
    category: 'olajok',
  },
  {
    id: 'fallback-3',
    title: 'Homoktövis szörp',
    price: 2490,
    description: 'Friss, aromás és természetes ízű gyümölcslé, cukor nélkül, gondosan elkészítve.',
    image: syrupImage,
    category: 'szorpok',
  },
  {
    id: 'fallback-4',
    title: 'Tönkölybúza liszt',
    price: 1890,
    description: 'Kőmalomban őrölt, teljes értékű liszt, tökéletes főzéshez és kovászos sütéshez.',
    image: flourImage,
    category: 'lisztek',
  },
];

function inferProductCategory(value: string): CategoryFilter {
  const lower = value.toLowerCase();
  if (lower.includes('szörp') || lower.includes('szorp') || lower.includes('berkenye') || lower.includes('homoktövis')) {
    return 'szorpok';
  }
  if (lower.includes('liszt') || lower.includes('búza') || lower.includes('gabona')) {
    return 'lisztek';
  }
  if (lower.includes('olaj') || lower.includes('napraforgó') || lower.includes('tök') || lower.includes('mák') || lower.includes('dió')) {
    return 'olajok';
  }
  return 'all';
}

function sanitizeText(value?: string) {
  return value
    ? value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : 'Kézműves, természetes és gondosan készült termék.';
}

export default function HomePage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const records = await pb.collection('products').getFullList({ sort: '-created' });
        setProducts(records as unknown as ProductRecord[]);
      } catch (error) {
        console.error('Hiba a termékek betöltésekor:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const visibleProducts = useMemo(() => {
    const source = products.length ? products : fallbackProducts;
    if (selectedCategory === 'all') return source;
    return source.filter((product) => {
      const productCategory = inferProductCategory(
        `${product.category ?? ''} ${product.title ?? ''} ${product.description ?? ''}`
      );
      return productCategory === selectedCategory;
    });
  }, [products, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedId(product.id);
    window.setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fffaf2,_#f8f3ee_45%,_#f3f1ec_100%)] text-neutral-900">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <section className="relative mb-14 overflow-hidden rounded-[2rem] border border-amber-100 bg-gradient-to-br from-[#f7f0e4] via-white to-[#f5efe7] p-5 shadow-[0_30px_90px_-35px_rgba(95,75,39,0.45)] sm:p-8 lg:p-10">
          <div className="absolute -right-8 top-0 h-52 w-52 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-44 w-44 rounded-full bg-orange-200/30 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div style={{ animation: 'fadeUp 0.7s ease-out both' }}>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-700">
                <Sparkles className="h-3.5 w-3.5" />
                természetes ízek
              </div>

              <h1 className="max-w-xl text-4xl font-black tracking-[-0.05em] text-neutral-900 sm:text-5xl lg:text-6xl">
                A föld, a növények ritmusa és a tiszta ízek szeretete.
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-neutral-700 sm:text-lg">
                Családi gazdaságunkból indult kézműves manufaktúránkban 100% természetes, hidegen sajtolt étolajokat, kőmalomban őrölt tönkölyliszteket és házi szörpöket készítünk.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#products"
                  className="inline-flex items-center gap-2 rounded-full bg-[#2c241d] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1d1713]"
                >
                  Nézz körül a kamránkban
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="relative" style={{ animation: 'fadeUp 1s ease-out 0.15s both' }}>
              <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                <div className="overflow-hidden rounded-[1.6rem] border border-amber-100 bg-white/80 p-2 shadow-[0_25px_70px_-35px_rgba(96,78,36,0.55)]">
                  <img
                    src={heroImage}
                    alt="A Zsül Portékái hidegen sajtolt olajok manufaktúrája"
                    className="h-[420px] w-full rounded-[1.2rem] object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-[1.4rem] border border-amber-100 bg-white/80 p-2 shadow-[0_25px_70px_-35px_rgba(96,78,36,0.45)]">
                    <img
                      src={sunflowerImage}
                      alt="Kézműves napraforgó és magvak"
                      className="h-40 w-full rounded-[1rem] object-cover"
                    />
                  </div>
                  <div className="rounded-[1.4rem] border border-amber-100 bg-[#f9f5ee] p-4 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">manufaktúra</p>
                    <p className="mt-2 text-3xl font-black text-neutral-900">100%</p>
                    <p className="mt-1 text-sm text-neutral-600">természetes alapanyag</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {trustBadges.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-[1.65rem] border border-neutral-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5ebdc] text-[#7a5a2b] transition duration-300 group-hover:bg-[#f0e2c9]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="products" className="mb-16 scroll-mt-24">
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Válogatás a kamránkból</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-neutral-900">
                Kiemelt termékeink a természetes mindennapokhoz
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {(Object.keys(categoryLabels) as CategoryFilter[]).map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    selectedCategory === category
                      ? 'border-[#d7b98e] bg-[#f7efe3] text-[#654b24] shadow-sm'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:text-neutral-900'
                  }`}
                >
                  {categoryLabels[category]}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-24 text-neutral-500">
              <span className="animate-pulse">Termékek betöltése...</span>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-neutral-300 bg-white py-20 text-center">
              <p className="text-lg font-semibold text-neutral-800">Jelenleg nincs ilyen kategóriájú termék.</p>
              <p className="mt-2 text-sm text-neutral-500">Próbálj meg másik szűrőt választani.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {visibleProducts.map((product) => {
                const imageUrl = product.image ? getImageUrl(product, product.image) : heroImage;
                const isJustAdded = addedId === product.id;
                const category = inferProductCategory(
                  `${product.category ?? ''} ${product.title ?? ''} ${product.description ?? ''}`
                );

                return (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-[1.75rem] border border-[#eadac2] bg-[#fffdf9] shadow-[0_20px_50px_-30px_rgba(128,99,48,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                        <span className="rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-700">
                          {category === 'olajok' ? 'Olaj' : category === 'szorpok' ? 'Szörp' : 'Liszt'}
                        </span>
                        <span className="rounded-full bg-[#d6a75c] px-2.5 py-1 text-[10px] font-bold text-[#2b1e11]">
                          4.9★
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 p-5">
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900">{product.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-neutral-500">
                          {sanitizeText(product.description)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#f0e7d8] pt-4">
                        <div>
                          <p className="text-lg font-black text-[#2c241d]">
                            {product.price.toLocaleString('hu-HU')} Ft
                          </p>
                          <p className="text-xs text-neutral-500">{categoryLabels[category]}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                            isJustAdded ? 'bg-emerald-600 text-white' : 'bg-[#2c241d] text-white hover:bg-[#1d1713]'
                          }`}
                        >
                          {isJustAdded ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              Hozzáadva
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5" />
                              Kosárba
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section id="about" className="mb-16 scroll-mt-24 rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="grid gap-4 sm:grid-cols-2">
              <img
                src={flourImage}
                alt="Tönkölybúza liszt és gabona"
                className="h-64 w-full rounded-[1.5rem] object-cover"
              />
              <img
                src={sunflowerImage}
                alt="Napraforgó és magvak a manufaktúrában"
                className="h-64 w-full rounded-[1.5rem] object-cover"
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">A Zsül Portékái története</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-neutral-900">
                Családi gazdaságunkból indult a természetes, tiszta ízek szeretete.
              </h2>
              <p className="mt-4 text-base leading-7 text-neutral-600">
                Hajdúböszörményben, a családi gazdaságunk környezetében kezdtünk el dolgozni a növények, a föld és a hagyományos feldolgozás iránti tisztelettel. Úgy készítjük termékeinket, hogy a nyersanyagok saját íze és minősége megmaradjon, a hőkezelés és a vegyszeres finomítás nélkül.
              </p>
              <p className="mt-4 text-base leading-7 text-neutral-600">
                A kíméletes sajtolás, a kézi gondosság és a hagyományos receptek ma is az alapjai a kézműves kamránknak — és annak, hogy a természetes ízek egyszerűen a mindennapok részévé váljanak.
              </p>
            </div>
          </div>
        </section>

        <section id="story" className="mb-16 scroll-mt-24 rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="overflow-hidden rounded-[1.75rem]">
              <img
                src={syrupImage}
                alt="Manufaktúra és hagyományos gyümölcsös szörpök"
                className="h-[420px] w-full object-cover"
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Hogyan készül?</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-neutral-900">
                Kíméletes feldolgozás, természetes íz és közeli gyártás.
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex gap-3 rounded-2xl bg-neutral-50 p-4">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#f5ebdc] text-[#7a5a2b]">
                    <Leaf className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">Szelektált nyersanyagok</h3>
                    <p className="mt-1 text-sm text-neutral-600">Válogatott terményekből, mindig a föld és a szezon ritmusához igazodva készítjük termékeinket.</p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl bg-neutral-50 p-4">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#f5ebdc] text-[#7a5a2b]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">Hidegen sajtolt és gondosan őrzött</h3>
                    <p className="mt-1 text-sm text-neutral-600">A hőkezelés és a vegyszeres finomítás nélkül megmarad a természetes íz, az E-vitamin és az antioxidáns tartalom.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="reviews" className="mb-16 scroll-mt-24">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Vélemények</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-neutral-900">
              A családok kedvenc kézműves termékei
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map(({ name, quote }) => (
              <article key={name} className="rounded-[1.7rem] border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={`${name}-${index}`} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-base leading-7 text-neutral-700">“{quote}”</p>
                <div className="mt-5 border-t border-neutral-100 pt-4">
                  <p className="font-bold text-neutral-900">{name}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-[#f8f4ee]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
          <div>
            <img src={logoUrl} alt="Zsül Portékái logó" className="h-12 w-auto object-contain" />
            <p className="mt-4 max-w-xs text-sm leading-6 text-neutral-600">
              A hajdúböszörményi családi manufaktúra, ahol a természetes alapanyagokból és a hagyományos készítési módokból születnek a tiszta ízek.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-900">Kapcsolat</h3>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              <li>Hajdúböszörmény, Magyarország</li>
              <li>info@zsulportekai.hu</li>
              <li>+36 20 123 4567</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-900">Foxpost & jog</h3>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              <li>Foxpost csomagautomata kézbesítés</li>
              <li>Általános szerződési feltételek</li>
              <li>Adatkezelési tájékoztató</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-200 bg-white/50">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>© 2026 Zsül Portékái. Minden jog fenntartva.</p>
            <p>Gyors, biztonságos kiszállítás hazánkban.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
