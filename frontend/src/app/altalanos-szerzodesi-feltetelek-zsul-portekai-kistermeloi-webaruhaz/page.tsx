import LegalPage from '@/components/LegalPage';

const sections = [
  {
    heading: '1. A szolgáltató adatai',
    items: [
      'Név: Bay Katalin őstermelő',
      'Székhely: 4220 Hajdúböszörmény, Külső-Debreceni utca 42.',
      'Telefon: +36 70 368 2132',
      'E-mail: zsulportekai@gmail.com',
      'Honlap: zsulportekai.hu',
    ],
  },
  {
    heading: '2. A termékek és a szerződés létrejötte',
    items: [
      'A webáruházban értékesített termékek a Zsül Portékái kistermelői tevékenysége keretében előállított élelmiszerek: tarkabab, étolaj, köretként és főzéshez használható növényi olajok, liszt, berkenyelé és egyéb természetes alapanyagú termékek.',
      'A vevő a weboldalon kiválasztja a termékeket, a kosárba helyezi azokat, majd a megrendelést elküldi.',
      'A szerződés az Eladó e-mailes visszaigazolásával jön létre, és a vevő a megrendelés véglegesítésével fizetési kötelezettséget vállal.',
    ],
  },
  {
    heading: '3. Fizetési és szállítási feltételek',
    items: [
      'A vevő banki átutalással vagy utánvétes fizetéssel választhat a rendelkezésre álló fizetési módok közül.',
      'A szállítás a FoxPost Kft. részvételével történik, a weboldalon feltüntetett aktuális díjszabás szerint.',
      'A megrendelés közlését követően a vevő a fizetendő végösszegre vonatkozóan végleges nyilatkozatot tesz a megrendelés befejezésekor.',
    ],
  },
  {
    heading: '4. Elállási jog és korlátozása',
    items: [
      'A fogyasztó 14 napos elállási joggal rendelkezik, azonban az élelmiszerekre vonatkozó higiéniai és egészségvédelmi okok miatt a zárt csomagolású termékek visszaküldése korlátozott lehet.',
      'Az élelmiszertermékeknél az elállási jog a csomagolás felbontása vagy a termék nem rendeltetésszerű használata miatt korlátozható.',
      'A vevő köteles a nem rendeltetésszerű használatból eredő károkat és a visszaküldési költségeket viselni.',
    ],
  },
  {
    heading: '5. Szavatosság és panaszkezelés',
    items: [
      'A termékek minősége és biztonsága a hatályos élelmiszer-biztonsági előírásoknak megfelelően történik.',
      'Hibás teljesítés, sérült csomagolás vagy más panasz esetén a vevő írásban jelezheti a problémát az zsulportekai@gmail.com e-mail címen.',
      'Az Eladó köteles a hibára reagálni és a panasz kezelését a törvényes határidőn belül lebonyolítani.',
    ],
  },
];

export default function Page() {
  return (
    <LegalPage
      title="Általános szerződési feltételek"
      intro="Jelen dokumentum a Zsül Portékái kistermelői webáruházban kötött adásvételi szerződések általános feltételeit és a felek jogait és kötelezettségeit rögzíti."
      sections={sections}
    />
  );
}
