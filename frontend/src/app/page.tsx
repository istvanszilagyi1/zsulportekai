'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Check,
  Heart,
  Leaf,
  Plus,
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
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000039-d6411d6413/DSC02127-5.webp?ph=4e95f92e87';

const sunflowerImage =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000070-d6a59d6a5b/450/611162499_122246153336090690_8722529316535153812_n.webp?ph=4e95f92e87';

const syrupImage =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000192-8c9068c908/zsulportekai-2026-majus-22-ami-a-vasarban-lathatatlan.jpg.webp?ph=4e95f92e87';

const flourImage =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000188-85ac385ac5/zsulportekai-2026-aprilis-17-napi-szosszenet-nalunk.jpg.webp?ph=4e95f92e87';

const storyImage =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000186-8429584296/zsulportekai-2026-aprilis-napraforgo-vetes-elott.jpg.webp?ph=4e95f92e87';

const recipeImage =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000156-8e5ba8e5bc/zsulportekai-2025-december-16-kedvenc-kalacs-receptem.jpg.webp?ph=4e95f92e87';

// Az újonnan kért 3 galéria kép
const galleryImageOne =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000180-8da838da85/zsulportekai-2026-januar-16-vasarlas-kozvetlenul-a-manufakturanal.jpg.webp?ph=4e95f92e87';

const galleryImageTwo =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000190-ede95ede97/zsulportekai-2026-aprilis-24-olajutes-nalunk.jpg.webp?ph=4e95f92e87';

const galleryImageThree =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000200-43b5c43b5e/zsulportekai-2026-junius-5-az-utolso-mozzanat.jpg.webp?ph=4e95f92e87';

const galleryImages = [
  {
    src: galleryImageOne,
    label: 'Vásárlás a manufaktúránál',
    alt: 'Vásárlás közvetlenül a manufaktúránál',
  },
  {
    src: galleryImageTwo,
    label: 'Olajütés nálunk',
    alt: 'Olajút és gyártás a manufaktúrában',
  },
  {
    src: galleryImageThree,
    label: 'Az utolsó mozzanat',
    alt: 'A kézműves készítés utolsó mozzanata',
  },
];

const categoryLabels: Record<CategoryFilter, string> = {
  all: 'Minden termék',
  olajok: 'Hidegen sajtolt olajok',
  szorpok: 'Szörpök & gyümölcslevek',
  lisztek: 'Kézműves lisztek',
};

const testimonials = [
  {
    name: 'Kata',
    quote:
      'A tökmagolaj igazán finom és természetes. A csomagolás hangulatos, a szállítás pedig rendkívül gyors volt.',
  },
  {
    name: 'András',
    quote:
      'A berkenye szörp a kedvencünk. Gyümölcsös, természetes és olyan, mintha a kertünkben készült volna.',
  },
  {
    name: 'Eszter',
    quote:
      'A családi manufaktúra hangulata és a minőségi alapanyagok egyszerűen megérződnek. Minden alkalommal megéri.',
  },
];

const fallbackProducts: ProductRecord[] = [
  {
    id: 'fallback-1',
    title: 'Hidegen sajtolt tökmagolaj',
    price: 3990,
    description:
      'Tömör, aranyszínű olaj, amely a magok természetes aromáját és esszenciális értékeit őrzi meg.',
    image: heroImage,
    category: 'olajok',
  },
  {
    id: 'fallback-2',
    title: 'Kézműves napraforgóolaj',
    price: 3290,
    description:
      'Könnyed, friss és gazdag ízű, egészségesebb főzéshez és salátákhoz.',
    image: sunflowerImage,
    category: 'olajok',
  },
  {
    id: 'fallback-3',
    title: 'Homoktövis szörp',
    price: 2490,
    description:
      'Friss, aromás és természetes ízű gyümölcslé, gondosan elkészítve.',
    image: syrupImage,
    category: 'szorpok',
  },
  {
    id: 'fallback-4',
    title: 'Tönkölybúza liszt',
    price: 1890,
    description:
      'Kőmalomban őrölt, teljes értékű liszt, tökéletes főzéshez és kovászos sütéshez.',
    image: flourImage,
    category: 'lisztek',
  },
];

function inferProductCategory(value: string): CategoryFilter {
  const lower = value.toLowerCase();

  if (
    lower.includes('szörp') ||
    lower.includes('szorp') ||
    lower.includes('berkenye') ||
    lower.includes('homoktövis')
  ) {
    return 'szorpok';
  }

  if (
    lower.includes('liszt') ||
    lower.includes('búza') ||
    lower.includes('gabona')
  ) {
    return 'lisztek';
  }

  if (
    lower.includes('olaj') ||
    lower.includes('napraforgó') ||
    lower.includes('tök') ||
    lower.includes('mák') ||
    lower.includes('dió')
  ) {
    return 'olajok';
  }

  return 'all';
}

function sanitizeText(value?: string) {
  return value
    ? value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : 'Kézműves, természetes és gondosan készült termék.';
}

function categoryName(category: CategoryFilter) {
  if (category === 'olajok') return 'Olajok';
  if (category === 'szorpok') return 'Szörpök';
  if (category === 'lisztek') return 'Lisztek';
  return 'Termék';
}

export default function HomePage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>('all');
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const records = await pb
          .collection('products')
          .getFullList({ sort: '-created' });

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

    if (selectedCategory === 'all') {
      return source;
    }

    return source.filter((product) => {
      const productCategory = inferProductCategory(
        `${product.category ?? ''} ${product.title ?? ''} ${
          product.description ?? ''
        }`,
      );

      return productCategory === selectedCategory;
    });
  }, [products, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);

    setAddedId(product.id);

    window.setTimeout(() => {
      setAddedId(null);
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-[#27251f]">
      <Header />

      <main>
        {/* =========================================================
            HERO (Magasság optimalizálva: max 800px)
        ========================================================== */}
        <section className="relative min-h-[70vh] max-h-[800px] overflow-hidden bg-[#25231d]">
          <img
            src={heroImage}
            alt="Zsül Portékái – hidegen sajtolt termékek"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />

          <div className="relative mx-auto flex h-full min-h-[70vh] max-h-[800px] max-w-[1500px] flex-col justify-between px-6 py-8 sm:px-10 lg:px-16 lg:py-12">
            <div className="flex items-center justify-between">
              <div className="rounded-full border border-white/30 bg-black/10 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.28em] text-white backdrop-blur-sm">
                Kézműves manufaktúra
              </div>

              <a
                href="#products"
                className="hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:opacity-70 sm:flex"
              >
                Felfedezem
                <ArrowDown className="h-4 w-4" />
              </a>
            </div>

            <div className="max-w-4xl pb-8 pt-16 sm:pb-12">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-white/75 sm:text-sm">
                Zsül Portékái
              </p>

              <h1 className="max-w-4xl text-5xl font-medium leading-[1] tracking-[-0.03em] text-white sm:text-6xl md:text-7xl lg:text-[6.5rem]">
                Amit a föld ad,
                <br />
                azt gondosan
                <br />
                visszük tovább.
              </h1>

              <div className="mt-8 flex max-w-xl flex-col gap-6 sm:flex-row sm:items-end">
                <p className="max-w-md text-sm leading-6 text-white/80 sm:text-base">
                  Hajdúböszörményi családi gazdaságunkból származó alapanyagokból
                  készítünk hidegen sajtolt olajokat, kézműves liszteket és
                  házi szörpöket.
                </p>

                <a
                  href="#products"
                  className="group inline-flex shrink-0 items-center gap-3 text-sm font-semibold text-white"
                >
                  <span className="border-b border-white/60 pb-1">
                    Nézz körül
                  </span>

                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 transition group-hover:bg-white group-hover:text-[#27251f]">
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            INTRO
        ========================================================== */}
        <section className="px-6 py-16 sm:px-10 sm:py-24 lg:px-16 lg:py-28">
          <div className="mx-auto grid max-w-[1250px] gap-12 lg:grid-cols-[0.8fr_1.6fr] lg:gap-24">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#837b6b]">
                01 — A mi világunk
              </p>
            </div>

            <div>
              <h2 className="max-w-4xl text-3xl font-medium leading-[1.1] tracking-[-0.03em] sm:text-4xl md:text-5xl">
                Nem gyárban készülnek.
                <br />
                <span className="text-[#8a806d]">
                  Hanem nálunk, odafigyeléssel.
                </span>
              </h2>

              <div className="mt-6 max-w-2xl">
                <p className="text-base leading-7 text-[#656055] sm:text-lg sm:leading-8">
                  Hiszünk abban, hogy egy jó alapanyaghoz nem kell sokat
                  hozzáadni. A saját termény, a kíméletes feldolgozás és a
                  hagyományos tudás önmagában elég ahhoz, hogy valódi ízek
                  szülessenek.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            IMAGE MOSAIC (Optimalizált magasságokkal)
        ========================================================== */}
        <section className="px-4 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1400px] gap-4 lg:grid-cols-12">
            
            {/* Bal oldali nagy kép - magasság csökkentve */}
            <div className="group relative min-h-[350px] overflow-hidden rounded-[20px] lg:col-span-7 lg:min-h-[500px]">
              <img
                src={storyImage}
                alt="Napraforgó és magvak"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white sm:p-8">
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/70">
                  A termőföldtől
                </p>
                <h3 className="mt-2 max-w-md text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
                  Saját terményből indulunk.
                </h3>
              </div>
            </div>

            {/* Jobb oldali oszlop */}
            <div className="grid gap-4 lg:col-span-5 lg:grid-rows-[1.2fr_1fr]">
              <div className="group relative min-h-[250px] overflow-hidden rounded-[20px] lg:min-h-[250px]">
                <img
                  src={recipeImage}
                  alt="Tönkölybúza és liszt"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 text-white sm:p-8">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/70">
                    Tiszta alapanyag
                  </p>
                  <h3 className="mt-2 text-xl font-medium tracking-[-0.02em] sm:text-2xl">
                    Kőmalomban őrölt lisztek.
                  </h3>
                </div>
              </div>

              <div className="flex min-h-[200px] flex-col justify-between rounded-[20px] bg-[#ded6c7] p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <Leaf className="h-5 w-5 text-[#746b5b]" />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#746b5b]">
                    100% természetes
                  </span>
                </div>
                <p className="max-w-sm text-xl font-medium leading-tight tracking-[-0.02em] text-[#37342d] sm:text-2xl">
                  „A kevesebb néha több. Főleg, ha az alapanyag jó.”
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            RESPONSIVE PHOTO GALLERY (Javított képarányok)
        ========================================================== */}
        <section className="px-6 py-16 sm:px-10 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-[1250px]">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#837b6b]">
                  02 — A mi műhelyünk
                </p>
                <h2 className="mt-3 text-3xl font-medium leading-none tracking-[-0.04em] text-[#2a2723] sm:text-4xl">
                  Képek a mindennapjainkból.
                </h2>
              </div>
              <p className="max-w-xs text-sm leading-6 text-[#6f685f]">
                A saját készítés, a figyelmes feldolgozás és a közvetlen kapcsolat.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {galleryImages.map(({ src, label, alt }) => (
                <div key={label} className="group relative overflow-hidden rounded-[20px] bg-[#e7dfd1] shadow-sm">
                  {/* Telefonon 4:3 (kicsit fekvőbb), asztali gépen 4:5 (portré) a jobb illeszkedésért */}
                  <div className="aspect-[4/3] overflow-hidden sm:aspect-square lg:aspect-[4/5]">
                    <img
                      src={src}
                      alt={alt}
                      className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 sm:p-5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/90">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            PRODUCTS
        ========================================================== */}
        <section
          id="products"
          className="scroll-mt-20 px-6 py-16 sm:px-10 sm:py-24 lg:px-16 lg:py-28 bg-[#fbf9f5]"
        >
          <div className="mx-auto max-w-[1250px]">
            <div className="mb-10 flex flex-col gap-6 border-b border-[#d9d3c8] pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#837b6b]">
                  02 — A kamránkból
                </p>
                <h2 className="mt-3 max-w-2xl text-4xl font-medium leading-none tracking-[-0.04em] sm:text-5xl">
                  Válogass a kedvenceinkből.
                </h2>
              </div>

              <div className="flex max-w-full gap-5 overflow-x-auto pb-1">
                {(Object.keys(categoryLabels) as CategoryFilter[]).map(
                  (category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`shrink-0 border-b-2 pb-2 text-xs font-medium transition ${
                        selectedCategory === category
                          ? 'border-[#302d27] text-[#302d27]'
                          : 'border-transparent text-[#8b8579] hover:text-[#302d27]'
                      }`}
                    >
                      {categoryLabels[category]}
                    </button>
                  ),
                )}
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center text-sm text-[#837b6b]">
                Termékek betöltése...
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-lg font-medium">
                  Jelenleg nincs ilyen kategóriájú termék.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="mt-4 border-b border-[#302d27] pb-1 text-sm"
                >
                  Összes termék megtekintése
                </button>
              </div>
            ) : (
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {visibleProducts.map((product, index) => {
                  const imageUrl = product.image
                    ? getImageUrl(product, product.image)
                    : heroImage;
                  const isJustAdded = addedId === product.id;
                  const category = inferProductCategory(
                    `${product.category ?? ''} ${product.title ?? ''} ${
                      product.description ?? ''
                    }`,
                  );

                  return (
                    <article
                      key={product.id}
                      className={`group ${
                        index % 3 === 1 ? 'xl:translate-y-6' : ''
                      }`}
                    >
                      <div className="relative overflow-hidden rounded-[20px] bg-[#e5e0d6] shadow-sm">
                        <div className="aspect-[4/5] overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={product.title}
                            className="h-full w-full object-cover object-center transition duration-700 ease-out group-hover:scale-[1.04]"
                          />
                        </div>

                        <div className="absolute left-4 top-4">
                          <span className="rounded-full bg-[#f7f4ed]/95 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#4c483f] backdrop-blur-sm shadow-sm">
                            {categoryName(category)}
                          </span>
                        </div>

                        <div className="absolute bottom-4 right-4">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            aria-label={`${product.title} hozzáadása a kosárhoz`}
                            className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md transition ${
                              isJustAdded
                                ? 'bg-[#506b4d] text-white'
                                : 'bg-white text-[#28251f] hover:scale-110 hover:bg-[#FAF9F5]'
                            }`}
                          >
                            {isJustAdded ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-4 pt-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#2c2923]">
                            {product.title}
                          </h3>
                          <p className="mt-1.5 text-xs leading-5 text-[#777166] line-clamp-2">
                            {sanitizeText(product.description)}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-[#2c2923]">
                            {product.price.toLocaleString('hu-HU')} Ft
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* =========================================================
            FULL WIDTH STORY IMAGE (Magasság csökkentve)
        ========================================================== */}
        <section className="relative overflow-hidden">
          <div className="group relative h-[50vh] min-h-[400px] max-h-[500px] lg:max-h-[600px]">
            <img
              src={syrupImage}
              alt="Házi szörpök és gyümölcsök"
              className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 sm:px-10 sm:pb-12 lg:px-16 lg:pb-16">
              <div className="mx-auto max-w-[1250px]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80">
                  03 — A történetünk
                </p>

                <h2 className="mt-3 max-w-4xl text-3xl font-medium leading-[1.05] tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
                  A családi gazdaságtól az asztalodig.
                </h2>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <p className="max-w-lg text-sm leading-6 text-white/90">
                    Hajdúböszörményben dolgozunk a növények, a föld és a hagyományos feldolgozás iránti tisztelettel.
                  </p>

                  <a
                    href="#about"
                    className="group inline-flex w-fit items-center gap-3 text-sm font-semibold text-white"
                  >
                    <span className="border-b border-white/60 pb-1">
                      Ismerj meg minket
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 transition group-hover:bg-white group-hover:text-[#27251f]">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            ABOUT / VALUES
        ========================================================== */}
        <section
          id="about"
          className="scroll-mt-20 px-6 py-16 sm:px-10 sm:py-24 lg:px-16 lg:py-28"
        >
          <div className="mx-auto max-w-[1250px]">
            <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#837b6b]">
                  04 — Ami fontos nekünk
                </p>
              </div>

              <div>
                <h2 className="max-w-4xl text-3xl font-medium leading-[1.1] tracking-[-0.03em] sm:text-4xl lg:text-5xl">
                  Természetes alapanyag.
                  <br />
                  Kíméletes feldolgozás.
                  <br />
                  <span className="text-[#8a806d]">Valódi ízek.</span>
                </h2>

                <div className="mt-12 divide-y divide-[#d9d3c8] border-y border-[#d9d3c8]">
                  <div className="grid gap-4 py-6 sm:grid-cols-[60px_1fr]">
                    <Leaf className="mt-0.5 h-5 w-5 text-[#756d5d]" />
                    <div>
                      <h3 className="text-base font-semibold">Hazai saját termény</h3>
                      <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#777166]">
                        Válogatott hajdúsági napraforgó és tönkölybúza, közvetlenül a családi gazdaságunkból.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 py-6 sm:grid-cols-[60px_1fr]">
                    <Sparkles className="mt-0.5 h-5 w-5 text-[#756d5d]" />
                    <div>
                      <h3 className="text-base font-semibold">Kíméletes hideg sajtolás</h3>
                      <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#777166]">
                        Csigás préssel, hőkezelés és vegyszeres finomítás nélkül dolgozunk.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 py-6 sm:grid-cols-[60px_1fr]">
                    <Heart className="mt-0.5 h-5 w-5 text-[#756d5d]" />
                    <div>
                      <h3 className="text-base font-semibold">Hagyományos ízek</h3>
                      <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#777166]">
                        Házi szörpök és gyümölcslevek olyan receptek alapján, ahol az alapanyag a főszereplő.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 py-6 sm:grid-cols-[60px_1fr]">
                    <Truck className="mt-0.5 h-5 w-5 text-[#756d5d]" />
                    <div>
                      <h3 className="text-base font-semibold">Gondos csomagolás</h3>
                      <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#777166]">
                        Biztonságosan becsomagolva, Foxpost csomagautomatába szállítva.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            ABOUT IMAGE SPLIT (Magasság optimalizálva)
        ========================================================== */}
        <section className="px-4 sm:px-6 lg:px-10 pb-16 lg:pb-24">
          <div className="mx-auto grid max-w-[1400px] gap-4 lg:grid-cols-2">
            <div className="relative min-h-[350px] overflow-hidden rounded-[20px] bg-[#ded6c7] sm:min-h-[450px]">
              <img
                src={flourImage}
                alt="Tönkölybúza liszt"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>

            <div className="flex min-h-[350px] flex-col justify-between rounded-[20px] bg-[#302d27] p-8 text-[#f7f4ed] sm:min-h-[450px] sm:p-12">
              <div className="flex justify-between">
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/50">
                  Zsül Portékái
                </p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/50">
                  Hajdúböszörmény
                </p>
              </div>

              <div>
                <p className="mb-4 max-w-xl text-[9px] uppercase tracking-[0.2em] text-white/50">
                  A mi szemléletünk
                </p>
                <h2 className="max-w-2xl text-3xl font-medium leading-[1.1] tracking-[-0.03em] sm:text-4xl">
                  „Jó termékhez először jó alapanyag kell.”
                </h2>
                <p className="mt-6 max-w-xl text-sm leading-7 text-white/70">
                  A feldolgozás nálunk nem arról szól, hogy minél többet változtassunk az alapanyagon. 
                  Inkább arról, hogy minél jobban megőrizzük azt, ami eleve jó benne.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            REVIEWS
        ========================================================== */}
        <section
          id="reviews"
          className="scroll-mt-20 px-6 pb-20 sm:px-10 sm:pb-28 lg:px-16 bg-[#fbf9f5] pt-16"
        >
          <div className="mx-auto max-w-[1250px]">
            <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#837b6b]">
                  05 — Vásárlóink mondták
                </p>
                <h2 className="mt-4 text-3xl font-medium leading-none tracking-[-0.03em] sm:text-4xl">
                  Amit mások
                  <br />
                  gondolnak.
                </h2>
              </div>

              <div className="divide-y divide-[#d9d3c8] border-y border-[#d9d3c8]">
                {testimonials.map(({ name, quote }) => (
                  <article key={name} className="py-6 sm:py-8">
                    <div className="flex items-center gap-1 text-[#9b8052]">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={`${name}-${index}`} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <p className="mt-4 max-w-2xl text-lg font-medium leading-7 tracking-[-0.01em] text-[#36332c] sm:text-xl">
                      “{quote}”
                    </p>
                    <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[#898276]">
                      {name}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            FINAL CTA (Magasság csökkentve)
        ========================================================== */}
        <section className="relative overflow-hidden bg-[#d8d0c0]">
          <div className="mx-auto grid max-w-[1400px] lg:grid-cols-2">
            <div className="flex min-h-[400px] flex-col justify-between p-8 sm:p-12 lg:min-h-[500px]">
              <div className="flex items-center justify-between">
                <img
                  src={logoUrl}
                  alt="Zsül Portékái"
                  className="h-10 w-auto max-w-[160px] object-contain mix-blend-multiply"
                />
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#716a5c]">
                  06 — Kezdjük itt
                </p>
              </div>

              <div>
                <h2 className="max-w-2xl text-4xl font-medium leading-[1] tracking-[-0.03em] text-[#302d27] sm:text-5xl">
                  Vidd haza
                  <br />
                  a természetes ízeket.
                </h2>

                <a
                  href="#products"
                  className="group mt-8 inline-flex items-center gap-3 text-sm font-semibold text-[#302d27]"
                >
                  <span className="border-b border-[#302d27] pb-1">
                    Termékek megtekintése
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#302d27] transition group-hover:bg-[#302d27] group-hover:text-white">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </a>
              </div>
            </div>

            <div className="relative min-h-[300px] overflow-hidden lg:min-h-[500px]">
              <img
                src={heroImage}
                alt="Zsül Portékái"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer className="bg-[#24221d] px-6 py-12 text-[#f4f0e7] sm:px-10 lg:px-16 lg:py-16">
        <div className="mx-auto max-w-[1250px]">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
            <div>
              <img
                src={logoUrl}
                alt="Zsül Portékái logó"
                className="h-12 w-auto max-w-[180px] object-contain brightness-0 invert"
              />
              <p className="mt-6 max-w-sm text-sm leading-6 text-white/50">
                A hajdúböszörményi családi manufaktúra, ahol természetes
                alapanyagokból és hagyományos készítési módokból születnek a
                tiszta ízek.
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
                Kapcsolat
              </p>
              <div className="mt-5 space-y-2.5 text-sm text-white/65">
                <p>Hajdúböszörmény, Magyarország</p>
                <p>info@zsulportekai.hu</p>
                <p>+36 20 123 4567</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
                Információ
              </p>
              <div className="mt-5 space-y-2.5 text-sm text-white/65">
                <a href="#products" className="block transition hover:text-white">Termékek</a>
                <a href="#about" className="block transition hover:text-white">Rólunk</a>
                <a href="#reviews" className="block transition hover:text-white">Vélemények</a>
                <a href="#" className="block transition hover:text-white">Általános szerződési feltételek</a>
                <a href="#" className="block transition hover:text-white">Adatkezelési tájékoztató</a>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-[10px] text-white/35 sm:flex-row sm:items-center sm:justify-between uppercase tracking-widest">
            <p>© 2026 Zsül Portékái. Minden jog fenntartva.</p>
            <p>Hajdúböszörmény · Magyarország</p>
          </div>
        </div>
      </footer>

      {/* =========================================================
          SMALL GLOBAL ANIMATIONS
      ========================================================== */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        ::selection {
          background: #302d27;
          color: #f7f4ed;
        }

        @keyframes imageReveal {
          from {
            opacity: 0;
            transform: scale(1.025);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        img {
          animation: imageReveal 0.9s ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}