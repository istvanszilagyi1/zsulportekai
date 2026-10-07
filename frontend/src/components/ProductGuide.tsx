import { ArrowRight, Plus } from 'lucide-react';

type GuideItem = {
  label?: string;
  text: string;
};

type GuideBlock = {
  heading?: string;
  paragraphs?: string[];
  items?: GuideItem[];
};

const productGuides: { title: string; blocks: GuideBlock[] }[] = [
  {
    title: 'Hidegen sajtolt napraforgóolaj',
    blocks: [
      {
        paragraphs: [
          'Hazánk egyik legismertebb növényi olaja mely természetesebb és egészségesebb hidegen sajtolt változat , nem egyszerűen nagyüzemi , bolti olaj .',
        ],
      },
      {
        heading: 'Főbb jellemzői és előnyei',
        items: [
          {
            label: 'Készítése:',
            text: 'Érett, tisztított napraforgómagokból kizárólag mechanikai eljárással egy úgynevezett csigás préssel sajtoljuk ki, így megőrzi az eredeti tápanyagokat , hőkezelés és vegyi adalékanyagok nélkül . Ezzel szemben a hagyományos étolajokat finomítják, fehérítik és szagtalanítják.',
          },
          {
            label: 'Összetétel:',
            text: 'Gazdag B, E és F - vitaminban, fehérjékben , antioxidánsokban, valamint egyszeresen és 85%-ban többszörösen telítetlen zsírsavakban (omega-6, omega-9). Koleszterint nem tartalmaz.',
          },
          {
            label: 'Íze és illata:',
            text: 'Jellegzetes, telt, magasabb élvezeti értékű, mint a szagtalan bolti étolajok.',
          },
        ],
      },
      {
        heading: 'Felhasználása',
        items: [
          {
            label: 'Hideg konyha:',
            text: 'Salátákhoz, öntetekhez, hideg előételekhez és készételek ízesítésére a legjobb.',
          },
          {
            label: 'Sütés, főzés:',
            text: 'Használható főzéshez és kíméletesebb sütéshez is, érdemes kerülni a túlhevítését, mivel a forráspontja alacsonyabb lehet, mint a finomított olajoké. Sütésnél 200 fok fölé ne hevítsük!',
          },
          {
            label: 'Tárolás:',
            text: 'Hűvös, sötét helyen tartandó, és a hagyományos olajoknál rövidebb ideig áll el a természetessége miatt. A termékben az idő elteltével és különböző hőmérsékleti tartományokban való tárolás esetén megjelenhet természetes üledék melyek rostok , és színváltozás melyek az olaj használhatóságát nem befolyásolja csak is küllemét. Szavatossági ideje 6 hónap.',
          },
          {
            label: 'Mire nem ajánljuk:',
            text: 'Édes kelt tészták kisütésére mint például : fánk, illetve házi majonéz készítésére mivel túl intenzív lesz belőle az elkészült mártás.',
          },
        ],
      },
    ],
  },
  {
    title: 'Tökmagolaj',
    blocks: [
      {
        paragraphs: [
          'Héjnélküli olajtök magból , mechanikai préseléssel készült tökmagolaj. Tartalmaz telítetlen zsírsavakat, antioxidánsokat, vitaminokat és ásványi anyagokat. Az előállítás során nincs magas hőmérséklet, nem használunk sót, adalékanyagokat, így olajunk megőrzi természetes A-, E-, B1-, B2-, B3-, B6- és C-vitaminokat, valamint a jótékony nyomelemeket, például az értékes Cink, Foszfor, Kalcium, Kálium, Magnézium, Mangán, Nátrium, Réz és Szelén tartalmakat.',
        ],
      },
      {
        items: [
          {
            label: 'Prosztata és húgyutak egészsége:',
            text: 'Enyhíti a prosztata megnagyobbodásból adódó panaszokat és segíthet megelőzni a prosztatarákot. Enyhíti a felfázás és húgyúti fertőzések tüneteit.',
          },
          {
            label: 'Szív- és érrendszer:',
            text: 'Csökkenti a koleszterinszintet, rugalmassá teszi az érfalakat és erősíti a szívet, ezáltal csökkentve a szívinfarktus kockázatát. Lassítja az érelmeszesedés folyamatát.',
          },
          {
            label: 'Immun- és idegrendszer:',
            text: 'Erősíti mind az immun-, mind az idegrendszert, és antioxidáns tartalma révén véd a sejtek károsodásától.',
          },
          {
            label: 'Agyfunkciók:',
            text: 'Javítja az agyi keringést, ezáltal hozzájárulhat a memóriazavarok megelőzéséhez.',
          },
          {
            label: 'Bőr és haj:',
            text: 'Az E-vitamin és cink tartalom miatt jótékonyan hat a bőrre és a hajra, segíti a gyógyulást.',
          },
          {
            label: 'Gyulladáscsökkentés:',
            text: 'Gyulladáscsökkentő hatása révén csökkenti a gyulladásokat a szervezetben.',
          },
          {
            label: 'Méregtelenítés:',
            text: 'Segíthet a szervezet méregtelenítési folyamatában és a sav-lúg egyensúly helyreállításában.',
          },
          {
            label: 'Fogyasztása:',
            text: 'A tökmagolaj hőkezelés hatására veszít jótékony hatásaiból ezért nem alkalmas sütésre-főzésre, fontos nyersen fogyasztani.',
          },
          {
            label: 'Felhasználás:',
            text: 'Legjobban salátákra csöpögtetve, szendvicsekre, krémlevesek tetejére, vagy vanília fagyira öntetként .',
          },
          {
            text: 'Férfiaknak kivételesen jó reggel éhgyomorra egy kanálnyi.',
          },
          {
            label: 'Tárolás:',
            text: 'Száraz hűvös helyen, felbontás után hűtőben tárolandó!',
          },
        ],
      },
    ],
  },
  {
    title: 'Mákolaj',
    blocks: [
      {
        heading: 'Belsőleg fogyasztva :',
        items: [
          {
            label: 'Csontok és ízületek:',
            text: 'Erősíti a csontokat a benne lévő magas kálcium, foszfor és magnézium, valamint a kálcium felszívódását segítő anyagok miatt, küzdhet a csontritkulás ellen is.',
          },
          {
            label: 'Idegrendszer:',
            text: 'Nyugtató hatású, segíthet alvási problémák esetén, és erősíti az idegeket.',
          },
          {
            label: 'Szív- és érrendszer:',
            text: 'Kedvező zsírsavösszetétele révén hozzájárulhat a koleszterinszint normalizálásához, és csökkentheti a trombózis vagy embólia kialakulásának kockázatát.',
          },
          {
            label: 'Immunrendszer:',
            text: 'Segíti az immunrendszer működését.',
          },
          {
            label: 'Sebgyógyulás és bőr:',
            text: 'Felgyorsítja a sebgyógyulást.',
          },
          {
            label: 'Szellemi teljesítmény:',
            text: 'Növelheti a szellemi teljesítőképességet.',
          },
          {
            label: 'Fogyasztása:',
            text: 'Leginkább magában kiskanállal fogyasztva, vagy gyümölcssalátára csepegtetve ajánlatos.',
          },
        ],
      },
      {
        heading: 'Külsőleg alkalmazva:',
        items: [
          {
            label: 'Bőr:',
            text: 'Megküzdhet a bőr gyulladásaival, irritált felületeken is alkalmazható, és öregedést gátló hatású arc- és bőrápolóként is használható, mivel nem tömíti el a pórusokat.',
          },
          {
            label: 'Haj és fejbőr:',
            text: 'Kenhető száraz hajra és fejbőrre.',
          },
          {
            label: 'Alkalmazása :',
            text: 'A hidegen sajtolt mákolaj nem hőstabil, így sütéshez és főzéshez nem alkalmas. Fogyasztása esetén fontos a rendszeresség a jótékony hatások érvényesüléséhez. Nőknek ajánlott napi egy teáskanálnyi reggel étkezés előtt .',
          },
          {
            label: 'Tárolás:',
            text: 'Száraz hűvös helyen , felbontás után hűtőben tárolandó',
          },
        ],
      },
    ],
  },
  {
    title: '100%-OS BERKENYELÉ',
    blocks: [
      {
        paragraphs: [
          'Feketés, sötétlila színű bogyós gyümölcs , íze fanyar, száraz, nagyon jellegzetes, tömény, igazi antioxidáns-bomba !',
        ],
      },
      {
        heading: 'Jótékony hatásai:',
        items: [
          { text: 'Kedvező hatással van a szív és érrendszerre' },
          { text: 'Szabályozza a vérnyomást' },
          { text: 'Vérszegénység elleni küzdelem elősegítése' },
          { text: 'Magas antioxidáns tartalma miatt erősíti az immunrendszert' },
          { text: 'Vércukorszintet stabilizálja' },
          { text: 'Gyomorvédő, gyomorfekély és hasmenés ellen kiváló' },
          { text: 'Epe, máj betegségeinek megelőzésére' },
          {
            text: 'Krónikus betegségek mint a Rák, Parkinson kór, Bronchitis kialakulásának megelőzésére',
          },
          {
            text: 'Pajzsmirigy működésének serkentése, jó hatással van a hormonokra',
          },
          { text: 'Javítja a látást és a memóriát' },
        ],
      },
      {
        paragraphs: [
          'Ajánlott napi mennyiség: 50 ml, reggel étkezés előtt, vagy este étkezés után hígítatlanul! Esetleges hasmenés lehetséges természetes velejáró !',
          'Felbontás után hűtve tárolandó!',
        ],
      },
    ],
  },
];

export default function ProductGuide() {
  return (
    <section
      id="termekleirasok"
      className="scroll-mt-20 border-y border-[#ddd5c8] bg-[#eee9df] px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24"
    >
      <div className="mx-auto max-w-[1250px]">
        <div className="mb-10 flex flex-col gap-6 border-b border-[#d3cbbd] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7c776b]">
              Ismerd meg közelebbről
            </p>
            <h2 className="mt-4 text-3xl font-medium leading-tight tracking-[-0.04em] text-[#2d2923] sm:text-4xl lg:text-5xl">
              Minden olajnak megvan a maga helye az asztalon.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#696357] sm:text-base sm:leading-7">
              Olvasd el a részletes tudnivalókat, és találd meg, melyik illik legjobban a konyhádhoz.
            </p>
          </div>

          <a
            href="#products"
            className="group inline-flex w-fit shrink-0 items-center gap-3 text-sm font-semibold text-[#35382d]"
          >
            <span className="border-b border-[#858775] pb-1">Vissza a termékekhez</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#858775] transition group-hover:bg-[#35382d] group-hover:text-white">
              <ArrowRight className="h-4 w-4" />
            </span>
          </a>
        </div>

        <div className="grid items-start gap-3 sm:grid-cols-2 sm:gap-4">
          {productGuides.map(({ title, blocks }, index) => (
            <details
              key={title}
              className="group border border-[#d9d1c4] bg-[#f8f5ef] open:border-[#b9b5a5]"
            >
              <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:hidden sm:px-6 [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-4">
                  <span className="text-[10px] font-semibold tabular-nums text-[#8d897a]">
                    0{index + 1}
                  </span>
                  <span className="text-base font-medium text-[#302d27] sm:text-lg">
                    {title}
                  </span>
                </span>
                <Plus className="h-5 w-5 shrink-0 text-[#716d60] transition-transform duration-200 group-open:rotate-45" />
              </summary>

              <div className="border-t border-[#e1dbd0] px-5 pb-6 pt-5 text-sm leading-7 text-[#5d574d] sm:px-6">
                {blocks.map((block, blockIndex) => (
                  <div key={`${title}-${blockIndex}`} className="mb-5 last:mb-0">
                    {block.heading ? (
                      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#777565]">
                        {block.heading}
                      </h3>
                    ) : null}
                    {block.paragraphs?.map((paragraph) => (
                      <p key={paragraph} className="mb-3 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                    {block.items ? (
                      <ul className="space-y-3">
                        {block.items.map(({ label, text }, itemIndex) => (
                          <li
                            key={`${title}-${blockIndex}-${itemIndex}`}
                            className="pl-4 [border-left:1px_solid_#c8c3b5]"
                          >
                            {label ? <strong className="font-semibold text-[#37342d]">{label} </strong> : null}
                            {text}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}