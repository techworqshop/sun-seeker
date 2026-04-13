import type { Cafe } from '@/lib/sun/types';
import rawCafes from './berlin-cafes.json';

export const berlinCafes: Cafe[] = rawCafes.map((c) => ({
  id: c.id,
  name: c.name,
  lat: c.lat,
  lng: c.lng,
  address: (c as Record<string, unknown>).address as string | undefined,
  seatingOrientation: (c as Record<string, unknown>).seatingOrientation as string | undefined,
}));
