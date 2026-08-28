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
    label: 'Olajút nálunk',
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
            HERO
        ========================================================== */}
        <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#25231d]">
          <img
            src={heroImage}
            alt="Zsül Portékái – hidegen sajtolt termékek"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/30" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />

          <div className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-[1500px] flex-col justify-between px-6 py-8 sm:px-10 lg:px-16 lg:py-12">
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

            <div className="max-w-4xl pb-8 pt-20 sm:pb-12 lg:pb-16">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-white/75 sm:text-sm">
                Zsül Portékái
              </p>

              <h1 className="max-w-4xl text-[3.2rem] font-medium leading-[0.94] tracking-[-0.055em] text-white sm:text-6xl md:text-7xl lg:text-[7.2rem]">
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
            PRODUCTS
        ========================================================== */}
        <section
          id="products"
          className="scroll-mt-20 px-6 py-20 sm:px-10 sm:py-28 lg:px-16 lg:py-32"
        >
          <div className="mx-auto max-w-[1250px]">
            <div className="mb-12 flex flex-col gap-8 border-b border-[#d9d3c8] pb-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#837b6b]">
                  02 — A kamránkból
                </p>

                <h2 className="mt-4 max-w-2xl text-4xl font-medium leading-none tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                  Válogass a
                  <br />
                  kedvenceinkből.
                </h2>
              </div>

              <div className="flex max-w-full gap-5 overflow-x-auto pb-1">
                {(Object.keys(categoryLabels) as CategoryFilter[]).map(
                  (category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`shrink-0 border-b pb-2 text-xs font-medium transition ${
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
              <div className="py-24 text-center text-sm text-[#837b6b]">
                Termékek betöltése...
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="py-24 text-center">
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
              <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
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
                        index % 3 === 1 ? 'sm:translate-y-8 xl:translate-y-10' : ''
                      }`}
                    >
                      <div className="relative overflow-hidden rounded-[22px] bg-[#e5e0d6] shadow-[0_10px_22px_rgba(38,30,22,0.05)]">
                        <div className="aspect-[5/6] overflow-hidden bg-[#efeae1]">
                          <img
                            src={imageUrl}
                            alt={product.title}
                            className="h-full w-full object-contain object-center p-3 transition duration-700 ease-out group-hover:scale-[1.02] sm:p-4"
                          />
                        </div>

                        <div className="absolute left-4 top-4">
                          <span className="bg-[#f7f4ed]/90 px-2.5 py-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-[#4c483f] backdrop-blur-sm">
                            {categoryName(category)}
                          </span>
                        </div>

                        <div className="absolute bottom-4 right-4">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            aria-label={`${product.title} hozzáadása a kosárhoz`}
                            className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition ${
                              isJustAdded
                                ? 'bg-[#506b4d] text-white'
                                : 'bg-white text-[#28251f] hover:scale-105'
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
                          <h3 className="text-lg font-medium tracking-[-0.025em] text-[#2c2923] sm:text-xl">
                            {product.title}
                          </h3>

                          <p className="mt-2 text-sm leading-5 text-[#777166]">
                            {sanitizeText(product.description)}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-[#2c2923] sm:text-base">
                            {product.price.toLocaleString('hu-HU')} Ft
                          </p>

                          <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-[#999286]">
                            {categoryName(category)}
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
            INTRO
        ========================================================== */}
        <section className="px-6 py-20 sm:px-10 sm:py-28 lg:px-16 lg:py-36">
          <div className="mx-auto grid max-w-[1250px] gap-12 lg:grid-cols-[0.8fr_1.6fr] lg:gap-24">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#837b6b]">
                01 — A mi világunk
              </p>
            </div>

            <div>
              <h2 className="max-w-4xl text-3xl font-medium leading-[1.08] tracking-[-0.04em] sm:text-4xl md:text-5xl lg:text-6xl">
                Nem gyárban készülnek.
                <br />
                <span className="text-[#8a806d]">
                  Hanem nálunk, odafigyeléssel.
                </span>
              </h2>

              <div className="mt-8 max-w-2xl">
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
            IMAGE MOSAIC
        ========================================================== */}
        <section className="px-4 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1500px] gap-4 lg:grid-cols-12">
            <div className="group relative min-h-[520px] overflow-hidden lg:col-span-7 lg:min-h-[720px]">
              <img
                src={storyImage}
                alt="Napraforgó és magvak"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

              <div className="absolute bottom-0 left-0 p-7 text-white sm:p-10">
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/70">
                  A termőföldtől
                </p>

                <h3 className="mt-2 max-w-md text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
                  Saját terményből indulunk.
                </h3>
              </div>
            </div>

            <div className="grid gap-4 lg:col-span-5 lg:grid-rows-[1fr_auto]">
              <div className="group relative min-h-[380px] overflow-hidden lg:min-h-0">
                <img
                  src={recipeImage}
                  alt="Tönkölybúza és liszt"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 p-7 text-white sm:p-9">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/70">
                    Tiszta alapanyag
                  </p>

                  <h3 className="mt-2 text-2xl font-medium tracking-[-0.03em]">
                    Kőmalomban őrölt lisztek.
                  </h3>
                </div>
              </div>

              <div className="flex min-h-[250px] flex-col justify-between bg-[#ded6c7] p-7 sm:p-9 lg:min-h-[280px]">
                <div className="flex items-center justify-between">
                  <Leaf className="h-5 w-5 text-[#746b5b]" />

                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#746b5b]">
                    100% természetes
                  </span>
                </div>

                <p className="max-w-sm text-2xl font-medium leading-tight tracking-[-0.03em] text-[#37342d] sm:text-3xl">
                  „A kevesebb néha több. Főleg, ha az alapanyag jó.”
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            RESPONSIVE PHOTO GALLERY
        ========================================================== */}
        <section className="px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
          <div className="mx-auto max-w-[1250px]">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#837b6b]">
                  02 — A mi műhelyünk
                </p>

                <h2 className="mt-4 text-3xl font-medium leading-none tracking-[-0.05em] text-[#2a2723] sm:text-4xl lg:text-5xl">
                  Képek a mindennapjainkból.
                </h2>
              </div>

              <p className="max-w-md text-sm leading-6 text-[#6f685f]">
                A saját készítés, a figyelmes feldolgozás és a közvetlen kapcsolat a termékekkel.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {galleryImages.map(({ src, label, alt }) => (
                <div key={label} className="group relative overflow-hidden rounded-[24px] bg-[#e7dfd1] shadow-[0_12px_30px_rgba(38,30,22,0.06)]">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={src}
                      alt={alt}
                      className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent p-4 sm:p-5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/80">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            FULL WIDTH STORY IMAGE
        ========================================================== */}
        <section className="relative overflow-hidden">
          <div className="group relative h-[620px] sm:h-[720px] lg:h-[820px]">
            <img
              src={syrupImage}
              alt="Házi szörpök és gyümölcsök"
              className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-[1.02]"
            />

            <div className="absolute inset-0 bg-black/20" />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 sm:px-10 sm:pb-14 lg:px-16 lg:pb-20">
              <div className="mx-auto max-w-[1250px]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">
                  03 — A történetünk
                </p>

                <h2 className="mt-4 max-w-4xl text-4xl font-medium leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl md:text-6xl lg:text-7xl">
                  A családi gazdaságtól
                  <br />
                  az asztalodig.
                </h2>

                <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <p className="max-w-lg text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
                    Hajdúböszörményben, a családi gazdaságunk környezetében
                    dolgozunk a növények, a föld és a hagyományos feldolgozás
                    iránti tisztelettel.
                  </p>

                  <a
                    href="#about"
                    className="group inline-flex w-fit items-center gap-3 text-sm font-semibold text-white"
                  >
                    <span className="border-b border-white/60 pb-1">
                      Ismerj meg minket
                    </span>

                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 transition group-hover:bg-white group-hover:text-[#27251f]">
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
          className="scroll-mt-20 px-6 py-24 sm:px-10 sm:py-32 lg:px-16 lg:py-40"
        >
          <div className="mx-auto max-w-[1250px]">
            <div className="grid gap-16 lg:grid-cols-[0.75fr_1.25fr] lg:gap-28">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#837b6b]">
                  04 — Ami fontos nekünk
                </p>
              </div>

              <div>
                <h2 className="max-w-4xl text-4xl font-medium leading-[1.04] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                  Természetes alapanyag.
                  <br />
                  Kíméletes feldolgozás.
                  <br />
                  <span className="text-[#8a806d]">Valódi ízek.</span>
                </h2>

                <div className="mt-14 divide-y divide-[#d9d3c8] border-y border-[#d9d3c8]">
                  <div className="grid gap-4 py-7 sm:grid-cols-[80px_1fr]">
                    <Leaf className="mt-1 h-5 w-5 text-[#756d5d]" />

                    <div>
                      <h3 className="text-lg font-medium">
                        Hazai saját termény
                      </h3>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-[#777166]">
                        Válogatott hajdúsági napraforgó és tönkölybúza, közvetlenül
                        a családi gazdaságunkból.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 py-7 sm:grid-cols-[80px_1fr]">
                    <Sparkles className="mt-1 h-5 w-5 text-[#756d5d]" />

                    <div>
                      <h3 className="text-lg font-medium">
                        Kíméletes hideg sajtolás
                      </h3>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-[#777166]">
                        Csigás préssel, hőkezelés és vegyszeres finomítás nélkül
                        dolgozunk, hogy az alapanyag saját karaktere megmaradjon.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 py-7 sm:grid-cols-[80px_1fr]">
                    <Heart className="mt-1 h-5 w-5 text-[#756d5d]" />

                    <div>
                      <h3 className="text-lg font-medium">
                        Hagyományos ízek
                      </h3>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-[#777166]">
                        Házi szörpök, gyümölcslevek és kézműves termékek olyan
                        receptek alapján, amelyekben az alapanyag a főszereplő.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 py-7 sm:grid-cols-[80px_1fr]">
                    <Truck className="mt-1 h-5 w-5 text-[#756d5d]" />

                    <div>
                      <h3 className="text-lg font-medium">
                        Gondos csomagolás
                      </h3>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-[#777166]">
                        Biztonságosan becsomagolva, Foxpost csomagautomatába,
                        hogy a termék ugyanúgy érkezzen meg hozzád, ahogy nálunk
                        elhagyta a műhelyt.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            ABOUT IMAGE SPLIT
        ========================================================== */}
        <section className="px-4 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1500px] gap-4 lg:grid-cols-2">
            <div className="relative min-h-[500px] overflow-hidden bg-[#ded6c7] sm:min-h-[650px]">
              <img
                src={flourImage}
                alt="Tönkölybúza liszt"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>

            <div className="flex min-h-[500px] flex-col justify-between bg-[#302d27] p-8 text-[#f7f4ed] sm:min-h-[650px] sm:p-12 lg:p-16">
              <div className="flex justify-between">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/50">
                  Zsül Portékái
                </p>

                <p className="text-[10px] uppercase tracking-[0.28em] text-white/50">
                  Hajdúböszörmény
                </p>
              </div>

              <div>
                <p className="mb-5 max-w-xl text-[10px] uppercase tracking-[0.25em] text-white/50">
                  A mi szemléletünk
                </p>

                <h2 className="max-w-2xl text-4xl font-medium leading-[1.02] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                  „Jó termékhez először jó alapanyag kell.”
                </h2>

                <p className="mt-8 max-w-xl text-sm leading-7 text-white/60">
                  A feldolgozás nálunk nem arról szól, hogy minél többet
                  változtassunk az alapanyagon. Inkább arról, hogy minél jobban
                  megőrizzük azt, ami eleve jó benne.
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
          className="scroll-mt-20 px-6 py-24 sm:px-10 sm:py-32 lg:px-16 lg:py-40"
        >
          <div className="mx-auto max-w-[1250px]">
            <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#837b6b]">
                  05 — Vásárlóink mondták
                </p>

                <h2 className="mt-5 text-4xl font-medium leading-none tracking-[-0.045em] sm:text-5xl">
                  Amit mások
                  <br />
                  gondolnak.
                </h2>
              </div>

              <div className="divide-y divide-[#d9d3c8] border-y border-[#d9d3c8]">
                {testimonials.map(({ name, quote }) => (
                  <article
                    key={name}
                    className="py-8 sm:py-10"
                  >
                    <div className="flex items-center gap-1 text-[#9b8052]">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={`${name}-${index}`}
                          className="h-3.5 w-3.5 fill-current"
                        />
                      ))}
                    </div>

                    <p className="mt-5 max-w-2xl text-xl font-medium leading-8 tracking-[-0.02em] text-[#36332c] sm:text-2xl">
                      “{quote}”
                    </p>

                    <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#898276]">
                      {name}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            FINAL CTA
        ========================================================== */}
        <section className="relative overflow-hidden bg-[#d8d0c0]">
          <div className="mx-auto grid max-w-[1500px] lg:grid-cols-2">
            <div className="flex min-h-[580px] flex-col justify-between p-8 sm:p-12 lg:min-h-[680px] lg:p-16 xl:p-20">
              <div className="flex items-center justify-between">
                <img
                  src={logoUrl}
                  alt="Zsül Portékái"
                  className="h-12 w-auto max-w-[200px] object-contain mix-blend-multiply"
                />

                <p className="text-[10px] uppercase tracking-[0.25em] text-[#716a5c]">
                  06 — Kezdjük itt
                </p>
              </div>

              <div>
                <h2 className="max-w-2xl text-5xl font-medium leading-[0.98] tracking-[-0.05em] text-[#302d27] sm:text-6xl lg:text-7xl">
                  Vidd haza
                  <br />
                  a természetes
                  <br />
                  ízeket.
                </h2>

                <a
                  href="#products"
                  className="group mt-9 inline-flex items-center gap-4 text-sm font-semibold text-[#302d27]"
                >
                  <span className="border-b border-[#302d27] pb-1">
                    Termékek megtekintése
                  </span>

                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#302d27] transition group-hover:bg-[#302d27] group-hover:text-white">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </a>
              </div>
            </div>

            <div className="relative min-h-[500px] overflow-hidden lg:min-h-[680px]">
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
      <footer className="bg-[#24221d] px-6 py-14 text-[#f4f0e7] sm:px-10 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-[1250px]">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
            <div>
              <div className="inline-flex items-center justify-start">
                <img
                  src={logoUrl}
                  alt="Zsül Portékái logó"
                  className="h-14 w-auto max-w-[220px] object-contain brightness-0 invert"
                />
              </div>

              <p className="mt-7 max-w-sm text-sm leading-7 text-white/50">
                A hajdúböszörményi családi manufaktúra, ahol természetes
                alapanyagokból és hagyományos készítési módokból születnek a
                tiszta ízek.
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
                Kapcsolat
              </p>

              <div className="mt-6 space-y-3 text-sm text-white/65">
                <p>Hajdúböszörmény, Magyarország</p>
                <p>info@zsulportekai.hu</p>
                <p>+36 20 123 4567</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
                Információ
              </p>

              <div className="mt-6 space-y-3 text-sm text-white/65">
                <a
                  href="#products"
                  className="block transition hover:text-white"
                >
                  Termékek
                </a>

                <a href="#about" className="block transition hover:text-white">
                  Rólunk
                </a>

                <a
                  href="#reviews"
                  className="block transition hover:text-white"
                >
                  Vélemények
                </a>

                <a href="#" className="block transition hover:text-white">
                  Általános szerződési feltételek
                </a>

                <a href="#" className="block transition hover:text-white">
                  Adatkezelési tájékoztató
                </a>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-6 text-[11px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
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