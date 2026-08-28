import Link from 'next/link';

type LegalSection = {
  heading: string;
  items: string[];
};

type LegalPageProps = {
  title: string;
  intro: string;
  sections: LegalSection[];
};

export default function LegalPage({ title, intro, sections }: LegalPageProps) {
  return (
    <main className="bg-[#f7f3eb] px-6 py-14 text-[#2d2922] sm:px-10 lg:px-16">
      <div className="mx-auto max-w-4xl rounded-3xl border border-[#e6dfd3] bg-white p-6 shadow-[0_12px_40px_rgba(43,37,28,0.05)] sm:p-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center text-sm font-semibold uppercase tracking-[0.18em] text-[#8a5a30] transition hover:text-[#5d3d22]"
        >
          ← Vissza a főoldalra
        </Link>

        <header className="border-b border-[#e8e0d2] pb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8a806d]">
            Zsül Portékái
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#554f47]">{intro}</p>
        </header>

        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold text-[#2d2922]">{section.heading}</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[#4c473f]">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#a35e29]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
