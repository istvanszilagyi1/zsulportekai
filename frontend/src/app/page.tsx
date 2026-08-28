'use client';

import { useEffect, useState } from 'react';
import { pb, getImageUrl } from '@/lib/pocketbase';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import { Plus, Check, Sparkles, Truck, ShieldCheck, HeartHandshake } from 'lucide-react';
import Header from '@/components/Header';

const heroImages = [
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
];

const blogPosts = [
  {
    title: 'Hogyan válassz a mindennapi használathoz illő darabot?',
    text: 'Néhány egyszerű szabály, amivel a kézműves termékek a mindennapi élet részévé válnak.',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'A színek és a textúrák hatása a lakásban',
    text: 'Kis változtatásokkal otthonosabb és személyesebb lehet a környezeted.',
    image:
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Miért fontos a tartósság a kézműves termékeknél?',
    text: 'A minőségi anyagok és a körültekintő megmunkálás hosszú távon is megéri.',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const records = await pb.collection('products').getFullList({
          sort: '-created',
        });
        setProducts(records as unknown as Product[]);
      } catch (error) {
        console.error('Hiba a termékek betöltésekor:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fffaf2,_#f7f7f5_45%,_#f3f4f6_100%)] text-neutral-900">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <section className="relative mb-12 overflow-hidden rounded-[2rem] border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-[0_20px_60px_-30px_rgba(120,79,30,0.45)] sm:p-8 lg:p-10">
          <div className="absolute -right-8 top-0 h-52 w-52 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-orange-200/40 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                <Sparkles className="h-3.5 w-3.5" />
                kézműves kiválóság
              </div>

              <h1 className="max-w-xl text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl">
                Hozz létre otthoni hangulatot egyedi darabokkal.
              </h1>

              <p className="mt-4 max-w-lg text-base text-neutral-600 sm:text-lg">
                Személyes, kézzel készített, igazán hangulatos portékák a mindennapi élethez — kényelmesen, gyorsan, otthon.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="#products"
                  className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800"
                >
                  Nézd meg a kínálatot
                </a>
                <a
                  href="#about"
                  className="rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-300 hover:text-neutral-900"
                >
                  Rólunk
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-4 text-sm text-neutral-600">
                <div className="flex items-center gap-2 rounded-full border border-white bg-white/80 px-3 py-2 shadow-sm">
                  <Truck className="h-4 w-4 text-emerald-600" />
                  Gyors kiszállítás
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white bg-white/80 px-3 py-2 shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Minőségi anyagok
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="grid gap-3 sm:grid-cols-2">
                <img
                  src={heroImages[0]}
                  alt="Otthoni dekoráció"
                  className="h-52 w-full rounded-[1.75rem] object-cover shadow-lg sm:h-64"
                />
                <div className="flex flex-col gap-3">
                  <img
                    src={heroImages[1]}
                    alt="Kézműves termékek"
                    className="h-32 w-full rounded-[1.75rem] object-cover shadow-lg sm:h-40"
                  />
                  <div className="rounded-[1.75rem] border border-amber-200 bg-white p-4 shadow-lg">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                      Kedvenc választás
                    </p>
                    <p className="mt-2 text-2xl font-black text-neutral-900">4.9/5</p>
                    <p className="mt-1 text-sm text-neutral-600">Vásárlói értékelés</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 left-4 rounded-2xl border border-white bg-white/90 p-3 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <HeartHandshake className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Közösség</p>
                    <p className="text-sm font-semibold text-neutral-900">Sok szeretettel választott</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="mb-12 scroll-mt-24">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Portékák</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-neutral-900">
                A kedvenc darabok most itt
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-neutral-600">
              <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5">Újdonságok</span>
              <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5">Népszerű</span>
              <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5">Ötletes ajándék</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-24 text-neutral-400">
              <span className="animate-pulse">Termékek betöltése...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white py-20 text-center">
              <p className="font-semibold text-neutral-700">Még nincs feltöltve egyetlen termék sem.</p>
              <p className="mt-1 text-sm text-neutral-500">Vegyél fel egyet a PocketBase admin felületén!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => {
                const imageUrl = getImageUrl(product, product.image);
                const isJustAdded = addedId === product.id;

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
                          Új
                        </span>
                        <span className="rounded-full bg-amber-400/90 px-2.5 py-1 text-[10px] font-bold text-neutral-900">
                          4.8★
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 p-5">
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900">{product.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                          {product.description || 'Egyedi kézműves termék.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                        <span className="text-lg font-black text-neutral-900">
                          {product.price.toLocaleString('hu-HU')} Ft
                        </span>

                        <button
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

        <section id="about" className="mb-12 scroll-mt-24 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="overflow-hidden rounded-[1.75rem]">
              <img
                src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80"
                alt="Kézműves termékek és dekoráció"
                className="h-80 w-full object-cover"
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Rólunk</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-neutral-900">
                Kicsi bolt, sok szeretet és személyes hangulat.
              </h2>
              <p className="mt-4 text-neutral-600">
                A Zsül Portékái olyan darabokat gyűjt össze, amelyek kézzel, gondoskodással és figyelemmel készülnek. Célunk, hogy minden termék a mindennapi élet részévé váljon — egyszerű, tartós, hangulatos és személyes.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-neutral-50 p-4">
                  <p className="text-2xl font-black text-neutral-900">250+</p>
                  <p className="mt-1 text-sm text-neutral-600">Darab</p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4">
                  <p className="text-2xl font-black text-neutral-900">2k+</p>
                  <p className="mt-1 text-sm text-neutral-600">Kedvelő</p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4">
                  <p className="text-2xl font-black text-neutral-900">100%</p>
                  <p className="mt-1 text-sm text-neutral-600">Személyes</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="blog" className="scroll-mt-24 pb-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Blog</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-neutral-900">
                Inspirációk és ötletek
              </h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {blogPosts.map((post) => (
              <article key={post.title} className="overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <img src={post.image} alt={post.title} className="h-52 w-full object-cover" />
                <div className="p-5">
                  <h3 className="text-lg font-bold text-neutral-900">{post.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{post.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}