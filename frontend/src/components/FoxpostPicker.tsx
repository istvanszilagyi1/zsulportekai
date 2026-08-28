'use client';

import { Check, MapPin, PencilLine } from 'lucide-react';
import { useEffect, useState } from 'react';

export type FoxpostSelection = {
  id: string;
  name: string;
  address: string;
};

type FoxpostPickerProps = {
  onSelect: (selection: FoxpostSelection) => void;
};

const isFoxpostOrigin = (origin: string) => /foxpost\.hu$/i.test(origin) || /foxpost\.hu\b/i.test(origin);

const normalizeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const extractFoxpostValue = (source: unknown, keys: string[]) => {
  if (!source || typeof source !== 'object') {
    return undefined;
  }

  const normalizedKeys = new Set(keys.map((key) => normalizeKey(key)));
  const queue: unknown[] = [source];
  const visited = new Set<unknown>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object' || visited.has(current)) {
      continue;
    }

    visited.add(current);

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    for (const [key, value] of Object.entries(current as Record<string, unknown>)) {
      if (normalizedKeys.has(normalizeKey(key))) {
        if (value !== undefined && value !== null && value !== '') {
          return value;
        }
      }

      if (value && typeof value === 'object') {
        queue.push(value);
      }
    }
  }

  return undefined;
};

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
      if (!isFoxpostOrigin(origin)) {
        return;
      }

      const payload =
        (data as Record<string, unknown>).payload ??
        (data as Record<string, unknown>).selected ??
        (data as Record<string, unknown>).selection ??
        (data as Record<string, unknown>).place ??
        (data as Record<string, unknown>).selectedPlace ??
        (data as Record<string, unknown>).location ??
        data;

      const rawPlaceId =
        extractFoxpostValue(payload, ['place_id', 'placeId', 'id', 'pickup_id', 'parcel_id', 'point_id', 'terminal_id']) ??
        extractFoxpostValue((data as Record<string, unknown>).place, ['place_id', 'placeId', 'id', 'pickup_id', 'parcel_id', 'point_id', 'terminal_id']);

      const rawName =
        extractFoxpostValue(payload, ['name', 'place_name', 'point_name', 'location_name', 'title']) ??
        extractFoxpostValue((data as Record<string, unknown>).place, ['name', 'place_name', 'point_name', 'location_name', 'title']);

      const rawAddress =
        extractFoxpostValue(payload, [
          'address',
          'full_address',
          'addressText',
          'fullAddress',
          'address_text',
          'pickup_address',
        ]) ??
        extractFoxpostValue((data as Record<string, unknown>).place, [
          'address',
          'full_address',
          'addressText',
          'fullAddress',
          'address_text',
          'pickup_address',
        ]);

      if (rawPlaceId === undefined || rawName === undefined || rawAddress === undefined) {
        return;
      }

      const nextSelection: FoxpostSelection = {
        id: String(rawPlaceId).trim(),
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
      {!selected && (
        <div className="rounded-[22px] border border-dashed border-[#d0c6b7] bg-[#faf8f5] p-4 text-sm text-[#5b544d]">
          <p className="font-medium text-[#2d2922]">Válassza ki az átvételi pontot</p>
          <p className="mt-1 leading-6">
            A Foxpost automata kiválasztása után a rendeléshez a pontos cím és a csomagautomatás hely megadása automatikusan rögzítésre kerül.
          </p>
        </div>
      )}

      {showPicker && (
        <div className="overflow-hidden rounded-[22px] border border-[#d9d3c8] bg-white shadow-[0_10px_24px_rgba(39,33,26,0.06)]">
          <iframe
            src="https://cdn.foxpost.hu/apt-finder/v1/app/"
            title="Foxpost automata kiválasztó"
            className="h-[520px] w-full border-0 bg-white sm:h-[620px]"
            loading="lazy"
            allow="clipboard-write"
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
                Kiválasztott átvételi pont
              </p>

              <p className="mt-2 flex items-center gap-2 text-base font-semibold text-[#183b2b]">
                <MapPin className="h-4 w-4" strokeWidth={2} />
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
