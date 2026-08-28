import LegalPage from '@/components/LegalPage';

const sections = [
  {
    heading: '1. Az adatkezelő adatai',
    items: [
      'Az adatkezelő neve: Bay Katalin őstermelő.',
      'Székhely: 4220 Hajdúböszörmény, Külső-Debreceni utca 42.',
      'E-mail: zsulportekai@gmail.com',
      'Telefon: +36 70 368 2132.',
    ],
  },
  {
    heading: '2. A kezelt adatok köre',
    items: [
      'A rendelés feldolgozásához az adatkezelő kezelheti a vásárló nevét, számlázási és szállítási címét, e-mail címét, telefonszámát, valamint a megrendeléssel kapcsolatos adatokat.',
      'A weboldal működtetéséhez technikai adatok is keletkezhetnek, például IP-cím, böngészőadatok és az oldal használatával kapcsolatos technikai információk.',
    ],
  },
  {
    heading: '3. Az adatkezelés célja',
    items: [
      'A személyes adatok kezelése a megrendelések feldolgozásához, szállításához, számlázásához és a vevőkkel való kapcsolattartáshoz szükséges.',
      'A megadott adatokból a szerződés teljesítése, a számlázási és könyvelési kötelezettségek teljesítése és a reklamációs ügyintézés történik.',
    ],
  },
  {
    heading: '4. Adattovábbítás és adattovábbítók',
    items: [
      'A szállítás lebonyolításához a vevő adatait a futárszolgáltató részére továbbítjuk.',
      'A számlázás és könyveléshez az előírt kötelezettségek teljesítéséhez szükséges adatokat kezeljük.',
      'A fizetési folyamatot a banki és fizetési szolgáltatók végzik, a küldött adatok minimális mértékűek és a szükséges célhoz kötöttek.',
    ],
  },
  {
    heading: '5. Adatbiztonság és jogérvényesítés',
    items: [
      'Az adatkezelő minden szükséges technikai és szervezési intézkedést megtesz az adatok védelmére és a jogosulatlan hozzáférés megakadályozására.',
      'Az érintettek a GDPR előírásainak megfelelően kérhetik az adatokhoz való hozzáférést, helyesbítését, törlését vagy korlátozását, valamint tiltakozhatnak az adatkezelés ellen.',
      'A jogérvényesítéshez a vevő a zsulportekai@gmail.com e-mail címen fordulhat hozzánk.',
    ],
  },
];

export default function Page() {
  return (
    <LegalPage
      title="Adatvédelmi szabályzat / Adatkezelési tájékoztató"
      intro="A Zsül Portékái webáruház üzemeltetője a személyes adatok kezelését a hatályos magyar és uniós adatvédelmi szabályoknak megfelelően végzi."
      sections={sections}
    />
  );
}
