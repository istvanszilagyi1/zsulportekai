import LegalPage from '@/components/LegalPage';

const sections = [
  {
    heading: '1. Banki átutalás',
    items: [
      'A banki átutalás a legbiztonságosabb és legköltséghatékonyabb fizetési mód, különösen akkor, ha a vevő szeretné elkerülni az utánvét kezelési költségét.',
      'Az átutalás után a megrendelés teljes összege csak a pénz beérkezése után indul el a szállítási és feldolgozási folyamat.',
      'A közlemény rovatba kérjük, írja be a rendelés számát, például: #12345.',
      'Kedvezményezett: Bay Katalin őstermelő; számlaszám: 61200285-14445741; bank: MagNet Bank Zrt.',
    ],
  },
  {
    heading: '2. Utánvét',
    items: [
      'Az utánvétes fizetés lehetőséget biztosít arra, hogy a termékeket a kézbesítéskor, a futárnál fizessék ki.',
      'Az utánvét összegéhez a termék ára, a szállítási költség és az utánvét-kezelési díj is hozzátartozik.',
      'A futárnál történő fizetés készpénzben vagy bankkártyával is lehetséges.',
      'A 2026-os kezelési díj mértéke a szállítási összeg függvényében változik: 5–15000 Ft között 300 Ft + ÁFA, 15000 Ft felett 2% + ÁFA.',
    ],
  },
  {
    heading: '3. Fizetés és teljesítés',
    items: [
      'A megrendelés összege a webáruházban a végső szakaszban, a megrendelés megerősítésekor világosan megjelenik.',
      'A teljesítés csak a fizetés tényleges teljesülése után kezdődik meg, kivéve, ha a vevő az utánvétet választja, mely esetben a fizetés a kézbesítéskor történik meg.',
      'A vevő a fizetési mód kiválasztásával elfogadja a webáruház által közzétett feltételeket.',
    ],
  },
];

export default function Page() {
  return (
    <LegalPage
      title="Fizetési módok"
      intro="A Zsül Portékái webshopban két fő fizetési mód közül választhat a vásárló: banki átutalás vagy utánvétes fizetés a futárnál."
      sections={sections}
    />
  );
}
