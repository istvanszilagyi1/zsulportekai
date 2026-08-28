'use client';

import { useEffect, useState } from 'react';
import { pb, getImageUrl } from '@/lib/pocketbase';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import { ShoppingBag, Package, Plus, Check } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);
  const { addToCart, totalItems } = useCart();

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
      {/* Fejléc */}
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-neutral-900">
            Zsül Portékái
          </Link>
          
          <Link
            href="/checkout"
            className="flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Kosár</span>
            {totalItems > 0 && (
              <span className="ml-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-neutral-900">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Fő tartalom */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Kézműves termékek</h1>
          <p className="mt-2 text-neutral-600">
            Válogass egyedi portékáink közül, gyors Foxpost csomagautomata átvétellel.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24 text-neutral-400">
            <span className="animate-pulse">Termékek betöltése...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 py-20 text-center">
            <Package className="mb-3 h-12 w-12 text-neutral-400" />
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
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:shadow-lg"
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
                      <h2 className="font-bold text-neutral-900">{product.title}</h2>
                      <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                        {product.description || 'Egyedi kézműves termék.'}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
                      <span className="text-lg font-extrabold text-neutral-900">
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
      </main>
    </div>
  );
}