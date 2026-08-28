'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Droplets,
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

type CategoryFilter = 'all' | 'olajok' | 'szorpok';
type ProductRecord = Product & {
  category?: string;
  image?: string;
};

const logoUrl =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000204-8933c8933e/450/Zs%C3%BCl%20port%C3%A9k%C3%A1i%20logo.webp?ph=4e95f92e87';

const heroImage =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80';

const storyImage =
  'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1200&q=80';

const trustBadges = [
  {
    icon: Leaf,
    title: '100% Természetes & Vegyszermentes',
    description: 'Minden receptünk tisztán természetes alapanyagokra épül.',
  },
  {
    icon: Droplets,
    title: 'Hidegen sajtolt',
    description: 'A hőkezelés nélkül megmaradó vitaminok és aromák megőrzése.',
  },
  {
    icon: Truck,
    title: 'Gyors Foxpost kézbesítés',
    description: 'Rendelésed gyorsan, kényelmesen és biztonságosan megérkezik.',
  },
  {
    icon: Heart,
    title: 'Családi manufaktúra',
    description: 'Gondos, kézműves készítés, amely a családi hangsúlyt viszi tovább.',
  },
];

const categoryLabels: Record<CategoryFilter, string> = {
  all: 'Összes',
  olajok: 'Hidegen sajtolt olajok',
  szorpok: 'Kézműves szörpök',
};

const testimonials = [
  {
    name: 'Kata',
    quote: 'A tökmagolaj rendkívül finom és valóban természetes. A csomagolás is prémium, és nagyon gyorsan megérkezett.',
  },
  {
    name: 'András',
    quote: 'A mákolaj és a nyárfa szörp is csodás. Olyan íz, amely nagyon különleges és otthonos.',
  },
  {
    name: 'Eszter',
    quote: 'Érthető, barátságos csomagolás és igazi kézműves minőség. Minden alkalommal újra rendelünk.',
  },
];

function getProductCategory(product: ProductRecord): CategoryFilter {
  const value = `${product.category || ''} ${product.title || ''} ${product.description || ''}`.toLowerCase();

  if (value.includes('szörp') || value.includes('szorp') || value.includes('lekvár') || value.includes('likőr')) {
    return 'szorpok';
  }

  if (
    value.includes('olaj') ||
    value.includes('mag') ||
    value.includes('dió') ||
    value.includes('napraforgó') ||
    value.includes('mák') ||
    value.includes('tök')
  ) {
    return 'olajok';
  }

  return 'all';
}

function sanitizeText(value?: string) {
  return value ? value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : 'Egyedi kézműves termék.';
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
        const records = await pb.collection('products').getFullList({
          sort: '-created',
        });
        setProducts(records as unknown as ProductRecord[]);
      } catch (error) {
        console.error('Hiba a termékek betöltésekor:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter((product) => getProductCategory(product) === selectedCategory);
  }, [products, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedId(product.id);
    window.setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fffaf2,_#f7f7f5_45%,_#f3f4f6_100%)] text-neutral-900">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <section className="relative mb-14 overflow-hidden rounded-[2rem] border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-[0_28px_80px_-35px_rgba(124,83,35,0.45)] sm:p-8 lg:p-10">
          <div className="absolute -right-8 top-0 h-52 w-52 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-orange-200/40 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div style={{ animation: 'fadeUp 0.8s ease-out both' }}>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-700">
                <Sparkles className="h-3.5 w-3.5" />
                természetes ízek
              </div>

              <h1 className="max-w-xl text-4xl font-black tracking-[-0.04em] text-neutral-900 sm:text-5xl lg:text-6xl">
                Fedezd fel a természet tiszta ízeit
              </h1>

              <p className="mt-4 max-w-lg text-base leading-7 text-neutral-600 sm:text-lg">
                Premium hidegen sajtolt olajok és kézműves házi szörpök, készítve gondos kézzel, tiszta alapanyagokból, természetes ízekkel.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#products"
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-neutral-800"
                >
                  Fedezd fel a termékeket
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#story"
                  className="rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition duration-300 hover:border-neutral-300 hover:text-neutral-900"
                >
                  Miért érdemes?
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-neutral-600">
                <div className="flex items-center gap-2 rounded-full border border-white bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  Vegyszermentes
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm">
                  <Truck className="h-4 w-4 text-emerald-700" />
                  Foxpost kézbesítés
                </div>
              </div>
            </div>

            <div className="relative lg:justify-self-end" style={{ animation: 'fadeUp 1s ease-out 0.1s both' }}>
              <div className="rounded-[2rem] border border-amber-100 bg-white/90 p-3 shadow-[0_30px_80px_-35px_rgba(35,28,16,0.55)] backdrop-blur-sm">
                <div className="relative overflow-hidden rounded-[1.5rem]">
                  <img
                    src={heroImage}
                    alt="Hidegen sajtolt olajok és kézműves alapanyagok"
                    className="h-[450px] w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10" />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
                      minőség
                    </p>
                    <p className="mt-2 text-2xl font-black text-neutral-900">100%</p>
                    <p className="text-xs text-neutral-600">természetes</p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-white p-3">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
                      íz
                    </p>
                    <p className="mt-2 text-2xl font-black text-neutral-900">4.9</p>
                    <p className="text-xs text-neutral-600">értékelés</p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-white p-3">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
                      kézbesítés
                    </p>
                    <p className="mt-2 text-2xl font-black text-neutral-900">2-3</p>
                    <p className="text-xs text-neutral-600">nap</p>
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
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 transition group-hover:bg-amber-100">
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
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">Kiemelt kínálat</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-neutral-900">
                A természetes ízek választéka
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
                      ? 'border-amber-300 bg-amber-100 text-amber-900 shadow-sm'
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
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-neutral-300 bg-white py-20 text-center">
              <p className="text-lg font-semibold text-neutral-800">Jelenleg nincs ilyen kategóriájú termék.</p>
              <p className="mt-2 text-sm text-neutral-500">Próbálj meg másik szűrőt választani.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const imageUrl = product.image ? getImageUrl(product, product.image) : heroImage;
                const isJustAdded = addedId === product.id;
                const category = getProductCategory(product);

                return (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                        <span className="rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-700">
                          {category === 'olajok' ? 'Olaj' : 'Szörp'}
                        </span>
                        <span className="rounded-full bg-amber-400/90 px-2.5 py-1 text-[10px] font-bold text-neutral-900">
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

                      <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                        <div>
                          <p className="text-lg font-black text-neutral-900">
                            {product.price.toLocaleString('hu-HU')} Ft
                          </p>
                          <p className="text-xs text-neutral-500">{categoryLabels[category]}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                            isJustAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-neutral-900 text-white hover:bg-neutral-800'
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

        <section id="story" className="mb-16 scroll-mt-24 rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="overflow-hidden rounded-[1.75rem]">
              <img
                src={storyImage}
                alt="Műhely és nyersanyagok a hidegen sajtolt olajok készítéséhez"
                className="h-[420px] w-full object-cover"
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">Miért a hidegen sajtolt olajok?</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-neutral-900">
                Tiszta íz, több antioxidáns, több természetes érték.
              </h2>

              <p className="mt-4 text-base leading-7 text-neutral-600">
                A hidegen sajtolás nem csupán egy módszer: a természetes aromák, vitaminok és esszenciális összetevők megőrzésének módja. Ennek eredményeként tisztább íz, intenzívebb illat és gazdagabb tápérték jellemzi a termékeket.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex gap-3 rounded-2xl bg-neutral-50 p-4">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <Leaf className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">Tiszta, megőrzött íz</h3>
                    <p className="mt-1 text-sm text-neutral-600">A hőkezelés nélkül a magok és gyümölcsök sajátosan friss íze érvényesül.</p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl bg-neutral-50 p-4">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">Magas E-vitamin és antioxidáns tartalom</h3>
                    <p className="mt-1 text-sm text-neutral-600">A természetes antioxidánsok és vitaminok megmaradnak, így a termék egészségesebb és ízletesebb.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">Vásárlói élmény</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-neutral-900">
              Vélemények, amelyek igazolják a minőséget
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

      <footer className="border-t border-neutral-200 bg-white/80">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
          <div>
            <img src={logoUrl} alt="Zsül Portékái logó" className="h-12 w-auto object-contain" />
            <p className="mt-4 max-w-xs text-sm leading-6 text-neutral-600">
              Természetes, kézműves és gondosan elkészített olajok és szörpök családi manufaktúránkból.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-900">Kapcsolat</h3>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              <li>info@zsulportekai.hu</li>
              <li>+36 20 123 4567</li>
              <li>Budapest, Magyarország</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-900">Foxpost & Jog</h3>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              <li>Foxpost csomagautomata kézbesítés</li>
              <li>ÁSZF</li>
              <li>Adatkezelési tájékoztató</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-200">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>© 2026 Zsül Portékái. Minden jog fenntartva.</p>
            <p>Gyors, biztonságos rendelés a családi manufaktúrától.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
