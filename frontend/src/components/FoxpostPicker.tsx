'use client';

import { Check, MapPin, PencilLine } from 'lucide-react';
import { useEffect, useState } from 'react';

export type FoxpostSelection = {
  id: string;
  name: string;
  address: string;
};

type FoxpostPickerProps = {
  value?: FoxpostSelection | null;
  onSelect: (selection: FoxpostSelection) => void;
};

export default function FoxpostPicker({ value, onSelect }: FoxpostPickerProps) {
  const [selected, setSelected] = useState<FoxpostSelection | null>(() => value ?? null);
  const [showPicker, setShowPicker] = useState<boolean>(() => !value);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Biztonsági ellenőrzés: csak a Foxpost hivatalos oldaláról fogadjuk az adatot
      if (event.origin !== 'https://cdn.foxpost.hu') return;

      let data = event.data;

      // A Foxpost widget JSON stringként küldi az adatot, ezt dekódolni kell!
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          return; // Ha nem érvényes JSON, figyelmen kívül hagyjuk
        }
      }

      if (!data || typeof data !== 'object') return;

      // A Foxpost szabványos válaszmezői
      const id = data.operator_id || data.place_id || data.id;
      const name = data.name || data.title;
      // Az address vagy egyben jön, vagy részekből kell összerakni
      const address = data.address || data.full_address || [data.zip, data.city, data.street].filter(Boolean).join(', ');

      // Ha megvan minden adat, elmentjük a kiválasztást
      if (id && name && address) {
        const nextSelection: FoxpostSelection = {
          id: String(id).trim(),
          name: String(name).trim(),
          address: String(address).trim(),
        };

        setSelected(nextSelection);
        setShowPicker(false);
        onSelect(nextSelection);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onSelect]);

  return (
    <div className="space-y-4">
      {/* Tájékoztató szöveg, ha még nincs kiválasztva semmi */}
      {!selected && !showPicker && (
        <div className="rounded-[20px] border border-dashed border-[#d9d3c8] bg-[#FAF9F5] p-5 text-sm text-[#777166]">
          <p className="font-semibold text-[#2c2923]">Kérjük, válasszon egy átvételi pontot!</p>
          <p className="mt-1.5 leading-6">
            A Foxpost automata kiválasztása után a rendeléshez a pontos cím automatikusan rögzítésre kerül.
          </p>
        </div>
      )}

      {/* A kiválasztott automata megjelenítése (Elegáns Zsül Portékái stílusban) */}
      {selected && !showPicker && (
        <div className="flex flex-col gap-4 rounded-[20px] border border-[#d9d3c8] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between transition-all">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0e9dc] text-[#506b4d]">
              <Check className="h-5 w-5" strokeWidth={2.5} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a806d]">
                Kiválasztott átvételi pont
              </p>

              <p className="mt-2 flex items-center gap-2 text-base font-bold text-[#2c2923]">
                <MapPin className="h-4 w-4 shrink-0 text-[#a35e29]" strokeWidth={2} />
                {selected.name}
              </p>

              <p className="mt-1 break-words pl-6 text-sm leading-5 text-[#777166]">
                {selected.address}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#d9d3c8] bg-[#FAF9F5] px-5 py-2.5 text-sm font-semibold text-[#2c2923] transition hover:bg-[#f0e9dc]"
          >
            <PencilLine className="h-4 w-4" strokeWidth={2} />
            Módosítás
          </button>
        </div>
      )}

      {/* A Foxpost Térkép (Iframe) */}
      {showPicker && (
        <div className="overflow-hidden rounded-[20px] border border-[#d9d3c8] bg-white shadow-sm animate-in fade-in zoom-in-95 duration-300">
          <div className="border-b border-[#d9d3c8] bg-[#FAF9F5] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#5e574c]">
              Foxpost Automata Kereső
            </p>
          </div>
          <iframe
            src="https://cdn.foxpost.hu/apt-finder/v1/app/"
            title="Foxpost automata kiválasztó"
            className="h-[min(72vh,550px)] w-full border-0 bg-white sm:h-[650px]"
            loading="lazy"
            allow="clipboard-write"
          />
        </div>
      )}
    </div>
  );
}