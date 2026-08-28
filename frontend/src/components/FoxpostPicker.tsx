'use client';

import { Check, PencilLine } from 'lucide-react';
import { useEffect, useState } from 'react';

export type FoxpostSelection = {
  id: string;
  name: string;
  address: string;
};

type FoxpostPickerProps = {
  onSelect: (selection: FoxpostSelection) => void;
};

const FOXPOST_ORIGIN_PATTERN = /^https?:\/\/([a-z0-9-]+\.)*foxpost\.hu$/i;

export default function FoxpostPicker({ onSelect }: FoxpostPickerProps) {
  const [selected, setSelected] = useState<FoxpostSelection | null>(null);
  const [showPicker, setShowPicker] = useState(true);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;

      if (!data || typeof data !== 'object') {
        return;
      }

      const origin = event.origin ?? '';

      if (!FOXPOST_ORIGIN_PATTERN.test(origin)) {
        return;
      }

      const rawPlaceId = data.place_id ?? data.placeId ?? data.id;
      const rawName = data.name;
      const rawAddress = data.address;

      if (
        rawPlaceId === undefined ||
        rawPlaceId === null ||
        rawName === undefined ||
        rawAddress === undefined
      ) {
        return;
      }

      const nextSelection: FoxpostSelection = {
        id: String(rawPlaceId),
        name: String(rawName).trim(),
        address: String(rawAddress).trim(),
      };

      if (!nextSelection.id || !nextSelection.name || !nextSelection.address) {
        return;
      }

      setSelected(nextSelection);
      setShowPicker(false);
      onSelect(nextSelection);
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onSelect]);

  return (
    <div className="space-y-4">
      {showPicker && (
        <div className="overflow-hidden rounded-[22px] border border-[#d9d3c8] bg-white shadow-[0_10px_24px_rgba(39,33,26,0.06)]">
          <iframe
            src="https://cdn.foxpost.hu/apt-finder/v1/app/"
            title="Foxpost automata kiválasztó"
            className="h-[420px] w-full border-0 bg-white"
            loading="lazy"
          />
        </div>
      )}

      {selected && (
        <div className="flex flex-col gap-4 rounded-[22px] border border-[#a7d4ad] bg-[#eef9f1] p-4 text-[#1e3a2a] shadow-[0_8px_18px_rgba(45,104,66,0.08)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#d9f1df] text-[#1f7a45]">
              <Check className="h-4 w-4" strokeWidth={2.5} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#3c7a55]">
                Kiválasztott automata
              </p>

              <p className="mt-2 text-base font-semibold text-[#183b2b]">
                {selected.name}
              </p>

              <p className="mt-1 text-sm leading-5 text-[#29543b]">
                {selected.address}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#8ec49d] bg-white px-4 py-2 text-sm font-medium text-[#214f37] transition hover:bg-[#f5fbf6]"
          >
            <PencilLine className="h-4 w-4" strokeWidth={2} />
            Módosítás
          </button>
        </div>
      )}
    </div>
  );
}
