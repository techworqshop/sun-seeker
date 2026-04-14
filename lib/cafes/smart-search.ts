import type { Cafe } from '@/lib/sun/types';
import { searchCafesByName, findSunnyCafesNearby, getZipCenter } from './search';
import { findNeighborhood } from './neighborhoods';

export type SearchMode = 'idle' | 'name' | 'zip' | 'neighborhood';

export interface SearchResult {
  mode: SearchMode;
  results: Cafe[];
  center?: { lat: number; lng: number };
}

/**
 * Smart search: auto-detects whether the query is a zip code,
 * neighborhood name, or cafe name/address.
 */
export function smartSearch(
  cafes: Cafe[],
  query: string,
): SearchResult {
  const q = query.trim();
  if (!q || q.length < 2) return { mode: 'idle', results: [] };

  // 1. Zip code (5 digits)
  if (/^\d{5}$/.test(q)) {
    const center = getZipCenter(q);
    if (center) {
      return {
        mode: 'zip',
        results: findSunnyCafesNearby(cafes, center[0], center[1], 2000),
        center: { lat: center[0], lng: center[1] },
      };
    }
  }

  // 2. Neighborhood name
  const hood = findNeighborhood(q);
  if (hood) {
    return {
      mode: 'neighborhood',
      results: findSunnyCafesNearby(cafes, hood.lat, hood.lng, hood.radius),
      center: { lat: hood.lat, lng: hood.lng },
    };
  }

  // 3. Cafe name / address
  return {
    mode: 'name',
    results: searchCafesByName(cafes, q),
  };
}
