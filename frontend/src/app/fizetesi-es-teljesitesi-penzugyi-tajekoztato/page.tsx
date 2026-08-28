import LegalPage from '@/components/LegalPage';

const sections = [
  {
    heading: '1. Bevezetés',
    items: [
      'A Zsül Portékái webáruházában leadott megrendelések fizetési és teljesítési feltételeit az alábbi tájékoztató rögzíti.',
      'A szabályozás az elektronikus kereskedelemre, a Polgári Törvénykönyvre és az adózási szabályokra épül.',
    ],
  },
  {
    heading: '2. Banki átutalás',
    items: [
      'A banki átutalásos fizetés a legbiztonságosabb választás. A megrendelés visszaigazolását követően csak a teljes összeg jóváírása után kezdődik el a szállítási és feldolgozási folyamat.',
      'A megrendelést a közlemény rovatban kérjük feltüntetni, például: #12345.',
      'Kedvezményezett: Bay Katalin őstermelő; bankszámla: 61200285-14445741; bank: MagNet Bank Zrt.',
    ],
  },
  {
    heading: '3. Utánvétes fizetés',
    items: [
      'Az utánvétes fizetés lehetővé teszi, hogy a vevő a termék átvételekor egyenlítse ki a teljes összeget.',
      'A futárnál történő fizetés készpénzben vagy bankkártyával is lehetséges.',
      'Az utánvét-kezelési díj a teljes összeghez hozzáadódik, és külön tételként jelenik meg a rendelésben.',
    ],
  },
  {
    heading: '4. Számlázás és bizonylatolás',
    items: [
      'A számla elektronikus formában kerül kiállításra, és a rendeléssel kapcsolatos e-mail címre érkezik meg PDF formátumban.',
      'Céges vásárlás esetén a vevő felel a pontos adószám és számlázási adatok megadásáért.',
    ],
  },
  {
    heading: '5. Visszatérítés és elállás',
    items: [
      'A fogyasztói elállási jog 14 napos, a törvényben foglalt kivételek természetesen alkalmazhatók az élelmiszerekre.',
      'A visszatérítés a törvényi határidőn belül történik, a termékek sértetlen visszaérkezését követően.',
    ],
  },
];

export default function Page() {
  return (
    <LegalPage
      title="Fizetési és teljesítési pénzügyi tájékoztató"
      intro="A megrendelések pénzügyi teljesítésének és végrehajtásának rendjét az alábbi dokumentum foglalja össze."
      sections={sections}
    />
  );
}
