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
  X,
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

const businessAddress = '4220 Hajdúböszörmény, Kisböszörmény utca';
const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(businessAddress)}&z=17&output=embed`;

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
  lisztek: 'Lisztek & hüvelyesek',
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
    lower.includes('homoktövis') ||
    lower.includes('gyümölcs')
  ) {
    return 'szorpok';
  }

  if (
    lower.includes('liszt') ||
    lower.includes('búza') ||
    lower.includes('gabona') ||
    lower.includes('tönköly') ||
    lower.includes('bab') ||
    lower.includes('hüvelyes') ||
    lower.includes('lencse') ||
    lower.includes('borsó') ||
    lower.includes('csicseriborsó')
  ) {
    return 'lisztek';
  }

  if (
    lower.includes('olaj') ||
    lower.includes('napraforgó') ||
    lower.includes('tök') ||
    lower.includes('mák') ||
    lower.includes('dió') ||
    lower.includes('mag')
  ) {
    return 'olajok';
  }

  return 'olajok';
}

function resolveProductCategory(product: Partial<ProductRecord>): CategoryFilter {
  const rawCategory = (product.category ?? '').trim().toLowerCase();

  if (rawCategory.includes('szörp') || rawCategory.includes('szorp')) return 'szorpok';
  if (rawCategory.includes('liszt')) return 'lisztek';
  if (rawCategory.includes('olaj')) return 'olajok';

  return inferProductCategory(`${product.title ?? ''} ${product.description ?? ''} ${rawCategory}`);
}

function decodeHtmlEntities(value: string) {
  if (!value) return '';

  const entityMap: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&Aacute;': 'Á',
    '&aacute;': 'á',
    '&Acirc;': 'Â',
    '&acirc;': 'â',
    '&Auml;': 'Ä',
    '&auml;': 'ä',
    '&Eacute;': 'É',
    '&eacute;': 'é',
    '&Iacute;': 'Í',
    '&iacute;': 'í',
    '&Oacute;': 'Ó',
    '&oacute;': 'ó',
    '&Ouml;': 'Ö',
    '&ouml;': 'ö',
    '&Uacute;': 'Ú',
    '&uacute;': 'ú',
    '&Uuml;': 'Ü',
    '&uuml;': 'ü',
    '&Oslash;': 'Ø',
    '&oslash;': 'ø',
    '&szlig;': 'ß',
  };

  let decoded = value;

  Object.entries(entityMap).forEach(([entity, replacement]) => {
    decoded = decoded.split(entity).join(replacement);
  });

  decoded = decoded.replace(/&#(\d+);/g, (_, code) => {
    return String.fromCodePoint(Number(code));
  });

  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => {
    return String.fromCodePoint(parseInt(code, 16));
  });

  if (typeof window !== 'undefined' && 'DOMParser' in window) {
    const doc = new DOMParser().parseFromString(decoded, 'text/html');
    const bodyHtml = doc.body?.innerHTML ?? doc.documentElement?.innerHTML ?? decoded;
    if (bodyHtml.trim()) {
      decoded = bodyHtml;
    }
  }

  return decoded;
}

function sanitizeText(value?: string) {
  const decoded = decodeHtmlEntities(value ?? '');
  const cleanText = decoded
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleanText || 'Kézműves, természetes és gondosan készült termék.';
}

function formatProductDescriptionHtml(value?: string) {
  const decoded = decodeHtmlEntities(value ?? '').trim();
  if (!decoded) {
    return '<p>Kézműves, természetes és gondosan készült termék.</p>';
  }

  const allowedTags = new Set([
    'p',
    'div',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'ul',
    'ol',
    'li',
    'span',
    'a',
  ]);

  if (typeof window === 'undefined' || !('DOMParser' in window)) {
    return decoded.replace(/<\/?([a-z0-9]+)(\s[^>]*)?>/gi, (match, tagName) => {
      const normalizedTag = String(tagName).toLowerCase();
      return allowedTags.has(normalizedTag) ? match : '';
    });
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(decoded, 'text/html');
  const fragment = doc.createDocumentFragment();

  const visit = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent ?? '';
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const element = node as Element;
    const tagName = element.tagName.toLowerCase();

    if (!allowedTags.has(tagName)) {
      let result = '';
      for (const child of Array.from(element.childNodes)) {
        result += visit(child);
      }
      return result;
    }

    const inner = Array.from(element.childNodes)
      .map((child) => visit(child))
      .join('');

    if (tagName === 'br') {
      return '<br />';
    }

    if (tagName === 'p' || tagName === 'div' || tagName === 'li' || tagName === 'span') {
      return `<${tagName}>${inner}</${tagName}>`;
    }

    if (tagName === 'ul' || tagName === 'ol') {
      return `<${tagName}>${inner}</${tagName}>`;
    }

    if (tagName === 'strong' || tagName === 'b' || tagName === 'em' || tagName === 'i') {
      return `<${tagName}>${inner}</${tagName}>`;
    }

    if (tagName === 'a') {
      const href = element.getAttribute('href');
      return href ? `<a href="${href}" target="_blank" rel="noreferrer">${inner}</a>` : inner;
    }

    return inner;
  };

  return Array.from(doc.body.childNodes)
    .map((node) => visit(node))
    .join('') || '<p>Kézműves, természetes és gondosan készült termék.</p>';
}

function categoryName(category: CategoryFilter) {
  if (category === 'olajok') return 'Olajok';
  if (category === 'szorpok') return 'Szörpök';
  if (category === 'lisztek') return 'Lisztek & hüvelyesek';
  return 'Termék';
}

export default function HomePage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>('all');
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductRecord | null>(
    null,
  );

  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error(`A termékek lekérdezése sikertelen: ${response.status}`);
        }

        const records = (await response.json()) as ProductRecord[];
        setProducts(records);
      } catch (error) {
        console.error('Hiba a termékek betöltésekor:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const visibleProducts = useMemo(() => {
    if (!products.length) {
      return [];
    }

    if (selectedCategory === 'all') {
      return products;
    }

    return products.filter((product) => {
      const productCategory = resolveProductCategory(product);
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

  const openProductModal = (product: ProductRecord) => {
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
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
                  {products.length > 0
                    ? 'Jelenleg nincs ilyen kategóriájú termék.'
                    : 'A termékek jelenleg nem érhetők el.'}
                </p>

                {products.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="mt-4 border-b border-[#302d27] pb-1 text-sm"
                  >
                    Összes termék megtekintése
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {visibleProducts.map((product, index) => {
                  const imageUrl = product.image
                    ? getImageUrl(product, product.image)
                    : heroImage;

                  const isJustAdded = addedId === product.id;

                  const category = resolveProductCategory(product);

                  return (
                    <article
                      key={product.id}
                      onClick={() => openProductModal(product)}
                      className="group cursor-pointer"
                    >
                      <div className="relative overflow-hidden rounded-[22px] bg-[#e5e0d6] shadow-[0_10px_22px_rgba(38,30,22,0.05)]">
                        <div className="aspect-[5/6] overflow-hidden bg-[#efeae1]">
                          <img
                            src={imageUrl}
                            alt={product.title}
                            className="h-full w-full object-contain object-center p-3 transition duration-700 ease-out group-hover:scale-[1.02] sm:p-4"
                            onClick={(event) => {
                              event.stopPropagation();
                              openProductModal(product);
                            }}
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
                            onClick={(event) => {
                              event.stopPropagation();
                              handleAddToCart(product);
                            }}
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

        {selectedProduct ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d1914]/75 p-2 sm:p-4 backdrop-blur-sm"
            onClick={closeProductModal}
          >
            <div
              className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[24px] border border-[#d9d0c2] bg-[#f7f4ed] shadow-[0_30px_90px_rgba(28,22,18,0.28)] sm:rounded-[28px]"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={selectedProduct.title}
            >
              <button
                type="button"
                onClick={closeProductModal}
                className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-[#f2eee7] text-[#2d2923] shadow-sm transition hover:bg-white"
                aria-label="Termékablak bezárása"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[1.2fr_0.8fr]">
                <div className="bg-[#ece4d8] p-3 sm:p-6">
                  <div className="overflow-hidden rounded-[20px] border border-[#d9d3c8] bg-[#f4efe9] sm:rounded-[22px]">
                    <div className="flex h-[220px] items-center justify-center overflow-hidden bg-[#f3eee7] sm:h-[320px] lg:h-[520px]">
                      <img
                        src={
                          selectedProduct.image
                            ? getImageUrl(selectedProduct, selectedProduct.image)
                            : heroImage
                        }
                        alt={selectedProduct.title}
                        className="h-full w-full object-contain transition-transform duration-200 ease-out"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex min-h-0 flex-col overflow-y-auto p-4 sm:p-8 lg:p-10">
                  <div className="shrink-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7b766a]">
                      {categoryName(resolveProductCategory(selectedProduct))}
                    </p>

                    <h3 className="mt-4 text-2xl font-medium tracking-[-0.04em] text-[#2d2923] sm:text-3xl lg:text-4xl">
                      {selectedProduct.title}
                    </h3>

                    <p className="mt-4 text-xl font-semibold text-[#2d2923] sm:text-2xl">
                      {selectedProduct.price.toLocaleString('hu-HU')} Ft
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        handleAddToCart(selectedProduct);
                        closeProductModal();
                      }}
                      className="mt-5 inline-flex items-center justify-center rounded-full bg-[#2d2923] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1d1a17] sm:mt-6 sm:px-5 sm:py-3"
                    >
                      Kosárba
                    </button>
                  </div>

                  <div className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden border-t border-[#d8d0c6] pt-5 sm:mt-8 sm:pt-6">
                    <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7b766a]">
                      Leírás
                    </p>

                    <div
                      className="mt-4 min-h-0 flex-1 overflow-y-auto pr-2 text-base leading-7 text-[#564f46] [scrollbar-width:thin] [-ms-overflow-style:scrollbar] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d3cabd] [&_p]:mb-3 [&_ul]:ml-5 [&_ul]:list-disc [&_ol]:ml-5 [&_ol]:list-decimal [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_div]:mb-3 [&_a]:text-[#2d2923] [&_a]:underline"
                      dangerouslySetInnerHTML={{
                        __html: formatProductDescriptionHtml(selectedProduct.description),
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

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
            MARKET / WHOLESALE SECTION
        ========================================================== */}
        <section className="px-6 py-20 sm:px-10 sm:py-28 lg:px-16 lg:py-32">
          <div className="mx-auto max-w-[1250px] rounded-[30px] border border-[#e1d8c9] bg-[#f3eee7] p-6 shadow-[0_18px_40px_rgba(38,30,22,0.04)] sm:p-8 lg:p-12">
            <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7b7266]">
                  03 — Vásárok és viszonteladók
                </p>
                <h2 className="mt-4 text-3xl font-medium leading-none tracking-[-0.05em] text-[#2a2723] sm:text-4xl lg:text-5xl">
                  Hol találkozhatsz velünk?
                </h2>
              </div>

              <p className="max-w-xl text-sm leading-7 text-[#665f54]">
                A piacokon és vásárokon lehetőség nyílik arra, hogy személyesen is találkozzunk, beszélgessünk, és segítsünk eligazodni a termékeink között.
              </p>
            </div>

            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[24px] bg-[#f8f4ee] p-5 sm:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#796f62]">
                  Piaci jelenlétünk
                </p>

                <ul className="mt-6 space-y-4 text-sm leading-7 text-[#4b453f]">
                  <li><strong className="font-semibold text-[#2a2723]">Minden hónap első szombatján:</strong> Debrecen Liget tér 8–11.30, Debrecen Kerekestelep Platán hotel melletti játszótér 8–11.30</li>
                  <li><strong className="font-semibold text-[#2a2723]">Minden hónap második szombatján:</strong> Debrecen Ruyter utca, Derce pékműhely udvara 8–11.30; Hajdúböszörmény Fürdőkerti vásár, Bíró Péter utca 7–12; Újfehértó Zsindelyes Cottage termelői piac 8–11.30</li>
                  <li><strong className="font-semibold text-[#2a2723]">Minden hónap második péntekjén:</strong> Hajdúböszörmény Ady téri piac 7–11</li>
                  <li><strong className="font-semibold text-[#2a2723]">Minden hónap harmadik szombatján:</strong> Debrecen Leány utca 2, egyháztáji vásár 8–11.30</li>
                  <li><strong className="font-semibold text-[#2a2723]">Minden vasárnap:</strong> Balmazújvárosi piac 7–11</li>
                </ul>

                <p className="mt-6 text-sm leading-7 text-[#5e584f]">
                  A vásári jelenlétünk hónapról hónapra frissül, az időpontokat és a pontos helyszíneket Facebook oldalunkon találod meg.
                </p>
              </div>

              <div className="rounded-[24px] bg-[#2d2923] p-5 text-[#f7f4ed] sm:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
                  Viszonteladó partnereink
                </p>

                <ul className="mt-6 space-y-4 text-sm leading-7 text-white/80">
                  <li>Hajdúböszörmény – Csuporka bolt, Petőfi Sándor utca 15.</li>
                  <li>Hajdúböszörmény – Kálvin téri zöldséges bolt, Kálvin tér 20.</li>
                  <li>Hajdúböszörmény – Mosolygó zöldség-gyümölcs, Külső-Hadházi utca 19.</li>
                  <li>Józsai piac – Tóth Józsefné viszonteladó, kedd, csütörtök, péntek.</li>
                  <li>Hajdúhadház piac – Tóth Józsefné viszonteladó, szombatonként.</li>
                  <li>Debrecen – Egyháztáji Delikátesz, Hatvan utca 1/A.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            FULL WIDTH STORY IMAGE
        ========================================================== */}
        <section id="story" className="relative overflow-hidden scroll-mt-20">
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
                  Hogyan készül?
                  <br />
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
              <div className="flex items-center justify-end">
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
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.9fr_1fr] lg:gap-12">
            <div>
              <div className="inline-flex items-center justify-start rounded-full border border-white/10 bg-white/3 px-3 py-2">
                <img
                  src={logoUrl}
                  alt="Zsül Portékái logó"
                  className="h-12 w-auto max-w-[200px] object-contain"
                />
              </div>

              <p className="mt-6 max-w-sm text-sm leading-7 text-white/55">
                A hajdúböszörményi családi manufaktúra, ahol természetes
                alapanyagokból és hagyományos készítési módokból születnek a
                tiszta ízek.
              </p>
            </div>

            <div className="lg:pl-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
                Kapcsolat:
              </p>

              <div className="mt-6 space-y-3 text-sm text-white/65">
                <p>Cím: 4220 Hajdúböszörmény, Kisböszörmény utca 3.</p>
                <a href="tel:+36703682132" className="block transition hover:text-white">
                  Telefon: +36 70 368 2132
                </a>
                <a href="mailto:zsulportekai@gmail.com" className="block transition hover:text-white">
                  E-mail: zsulportekai@gmail.com
                </a>
              </div>

              <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#1d1b18]">
                <iframe
                  title="Zsül Portékái elhelyezkedése"
                  src={mapEmbedUrl}
                  className="h-56 w-full border-0 grayscale contrast-125"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
                INFORMÁCIÓK:
              </p>

              <div className="mt-6 space-y-3 text-sm text-white/65">
                <a href="/szallitasi-es-atveteli-modok" className="block transition hover:text-white">
                  Szállítási és átvételi módok
                </a>
                <a href="/fizetesi-modok" className="block transition hover:text-white">
                  Fizetési módok
                </a>
                <a href="/fizetesi-es-teljesitesi-penzugyi-tajekoztato" className="block transition hover:text-white">
                  Fizetési és teljesítési pénzügyi tájékoztató
                </a>
                <a href="/altalanos-szerzodesi-feltetelek-zsul-portekai-kistermeloi-webaruhaz" className="block transition hover:text-white">
                  Általános szerződési feltételek
                </a>
                <a href="/adatvedelmi-szabalyzat-adatkezelesi-tajekoztato" className="block transition hover:text-white">
                  Adatvédelmi szabályzat / adatkezelési tájékoztató
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61552720706499"
                  target="_blank"
                  rel="noreferrer"
                  className="block transition hover:text-white"
                >
                  Facebook
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