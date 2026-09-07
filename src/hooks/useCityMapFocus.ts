import { useCallback, useRef, useState } from 'react';
import { geocodeCity } from '@/services/geocoding';
import type { MapFocus } from '@/utils/address';

const DEBOUNCE_MS = 400;
const MIN_CITY_LENGTH = 3;

export function useCityMapFocus() {
  const [mapFocus, setMapFocus] = useState<MapFocus | undefined>();
  const skipNextRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onCityChange = useCallback((city: string) => {
    if (skipNextRef.current) {
      skipNextRef.current = false;
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = city.trim();
    if (trimmed.length < MIN_CITY_LENGTH) return;

    timerRef.current = setTimeout(async () => {
      const result = await geocodeCity(trimmed);
      if (result) setMapFocus(result);
    }, DEBOUNCE_MS);
  }, []);

  const markCityFromAddress = useCallback(() => {
    skipNextRef.current = true;
  }, []);

  return { mapFocus, onCityChange, markCityFromAddress };
}
