import type { Cafe } from '@/lib/sun/types';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const OVERPASS_QUERY = `[out:json][timeout:120];area[name="Berlin"][admin_level=4]->.b;node[amenity=cafe][outdoor_seating=yes](area.b);out body;`;

let cafeCache: { cafes: Cafe[]; fetchedAt: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch Berlin cafes from Overpass API with 24h cache.
 * Falls back to static data if Overpass is unavailable.
 */
export async function fetchBerlinCafes(): Promise<Cafe[]> {
  // Return cache if fresh
  if (cafeCache && Date.now() - cafeCache.fetchedAt < CACHE_TTL) {
    return cafeCache.cafes;
  }

  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) throw new Error(`Overpass ${res.status}`);

    const data = await res.json();
    const cafes: Cafe[] = [];

    for (const el of data.elements ?? []) {
      const tags = el.tags ?? {};
      const name = tags.name;
      if (!name) continue;

      const street = tags['addr:street'] ?? '';
      const house = tags['addr:housenumber'] ?? '';
      const postcode = tags['addr:postcode'] ?? '';
      const city = tags['addr:city'] ?? '';

      const addrParts: string[] = [];
      if (street) addrParts.push(`${street} ${house}`.trim());
      if (postcode || city) addrParts.push(`${postcode} ${city}`.trim());

      cafes.push({
        id: String(el.id),
        name,
        lat: el.lat,
        lng: el.lon,
        address: addrParts.length > 0 ? addrParts.join(', ') : undefined,
      });
    }

    if (cafes.length > 0) {
      cafeCache = { cafes, fetchedAt: Date.now() };
      console.log(`Overpass: fetched ${cafes.length} cafes`);
      return cafes;
    }

    throw new Error('No cafes returned');
  } catch (error) {
    console.warn('Overpass fetch failed, using cached/static data:', error);

    // Return stale cache if available
    if (cafeCache) return cafeCache.cafes;

    // Fall back to static data
    const { berlinCafes } = await import('@/data/berlin-cafes');
    return berlinCafes;
  }
}
