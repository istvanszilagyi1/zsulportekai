'use client';

import { useEffect, useState } from 'react';
import { pb, getImageUrl } from '@/lib/pocketbase';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import { Plus, Check } from 'lucide-react';
import Header from '@/components/Header';

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
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-12">
        <section className="mb-12 rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Kézműves kiválóság
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
              Eredeti darabok, amelyek a mindennapokhoz illeszkednek.
            </h1>
            <p className="mt-4 text-base text-neutral-600 sm:text-lg">
              Fedezd fel a Zsül Portékái különleges készleteit — a mindennapi használatból és a személyes stílusból inspirált, egyedi termékekkel.
            </p>
          </div>
        </section>

        <section id="products" className="mb-12 scroll-mt-24">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Portékák
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
                Válogatás a legjobbakból
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-24 text-neutral-400">
              <span className="animate-pulse">Termékek betöltése...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white py-20 text-center">
              <p className="font-semibold text-neutral-700">Még nincs feltöltve egyetlen termék sem.</p>
              <p className="mt-1 text-sm text-neutral-500">
                Vegyél fel egyet a PocketBase admin felületén!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => {
                const imageUrl = getImageUrl(product, product.image);
                const isJustAdded = addedId === product.id;

                return (
                  <div
                    key={product.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <h3 className="font-semibold text-neutral-900">{product.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                          {product.description || 'Egyedi kézműves termék.'}
                        </p>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
                        <span className="text-lg font-bold text-neutral-900">
                          {product.price.toLocaleString('hu-HU')} Ft
                        </span>

                        <button
                          onClick={() => handleAddToCart(product)}
                          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
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
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section id="about" className="mb-12 scroll-mt-24 grid gap-6 rounded-[2rem] border border-neutral-200 bg-white p-8 sm:grid-cols-2 sm:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Rólunk</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
              Kicsi, de személyes.
            </h2>
          </div>
          <p className="text-neutral-600">
            A Zsül Portékái olyan darabokat gyűjt össze, amelyek kézzel, gondoskodással és figyelemmel készülnek. Célunk, hogy minden termék a mindennapi élet része lehessen — egyszerű, tartós és szép.
          </p>
        </section>

        <section id="blog" className="scroll-mt-24">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Blog</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
              Inspirációk és ötletek
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Hogyan válassz a mindennapi használathoz illő darabot?',
                text: 'Néhány egyszerű szabály, amivel a kézműves termékek a mindennapi élet részévé válnak.',
              },
              {
                title: 'A színek és a textúrák hatása a lakásban',
                text: 'Kis változtatásokkal otthonosabb és személyesebb lehet a környezeted.',
              },
              {
                title: 'Miért fontos a tartósság a kézműves termékeknél?',
                text: 'A minőségi anyagok és a körültekintő megmunkálás hosszú távon is megéri.',
              },
            ].map((post) => (
              <article key={post.title} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="mb-4 h-28 rounded-xl bg-neutral-100" />
                <h3 className="text-lg font-semibold text-neutral-900">{post.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{post.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}