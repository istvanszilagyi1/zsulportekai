import LegalPage from '@/components/LegalPage';

const sections = [
  {
    heading: '1. Szállítási lehetőségek',
    items: [
      'A megrendelések kiszállítása a FoxPost Kft. által történik a webáruházban feltüntetett, aktuális szabályok szerint.',
      'A rendelés véglegesítésekor a szállítási díj automatikusan hozzáadódik a végösszeghez, így a vásárló a fizetendő végső összeget átláthatóan látja.',
      'A vásárló a szállítási mód megválasztásakor a házhozszállítás vagy csomagautomatába történő kézbesítés között dönthet.',
    ],
  },
  {
    heading: '2. Csomagautomatás és házhozszállítás',
    items: [
      'A FoxPost automata kiválasztása esetén a rendelés a kijelölt csomagpontba érkezik, ahonnan a vevő átvette vagy később felvehette.',
      'Házhozszállítás során a futár a rendelés leadása után a megadott címre szállítja a csomagot, a feladási és kézbesítési információkat pedig e-mailben küldjük meg.',
      'A szállítási költség a termékek mennyiségétől és a kiválasztott kézbesítési módjától függ.',
    ],
  },
  {
    heading: '3. Átvétel és ellenőrzés',
    items: [
      'A kézbesítéskor a vevő köteles ellenőrizni a csomag sértetlenségét és a termékek állapotát.',
      'Amennyiben a csomag sérült vagy a termékek hibásak, a vevő haladéktalanul jelezheti a problémát a zsulportekai@gmail.com e-mail címen.',
      'A sérült csomagok esetén az Eladó gondoskodik a visszavételről és a probléma rendezéséről.',
    ],
  },
  {
    heading: '4. Értesítés és követés',
    items: [
      'A rendelés átvételéről és a szállítási státusz változásairól e-mailben értesítjük a vásárlót.',
      'A Futárhoz kapcsolódó részleteket és csomagszámot ugyanilyen formában küldjük meg, így a vevő nyomon követheti a küldeményt.',
    ],
  },
];

export default function Page() {
  return (
    <LegalPage
      title="Szállítási és átvételi módok"
      intro="A Zsül Portékái megrendelései a FoxPost Kft. hálózatán keresztül kerülnek kiszállításra, a kézbesítéshez kapcsolódó szabályokat és kötelezettségeket az alábbi összefoglaló tartalmazza."
      sections={sections}
    />
  );
}
