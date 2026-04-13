import type { ObstructionProfile } from './shadow';
import { fetchNearbyBuildings, computeObstructionProfile } from './shadow';

// In-memory cache for shadow profiles (replace with DB later)
const profileCache = new Map<string, { profile: ObstructionProfile; computedAt: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours (buildings don't move)
const COMPUTATION_QUEUE = new Set<string>();

function cacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
}

/**
 * Get or compute shadow profile for a location.
 * Returns null if not cached and computation is queued (non-blocking).
 */
export async function getShadowProfile(
  lat: number,
  lng: number,
  options: { blocking?: boolean } = {}
): Promise<ObstructionProfile | null> {
  const key = cacheKey(lat, lng);

  // Check cache
  const cached = profileCache.get(key);
  if (cached && Date.now() - cached.computedAt < CACHE_TTL) {
    return cached.profile;
  }

  // If already computing, don't double-fetch
  if (COMPUTATION_QUEUE.has(key)) return cached?.profile ?? null;

  if (options.blocking) {
    // Compute synchronously (for individual cafe detail view)
    return computeAndCache(key, lat, lng);
  }

  // Queue async computation (for list view - don't block)
  COMPUTATION_QUEUE.add(key);
  computeAndCache(key, lat, lng).finally(() => COMPUTATION_QUEUE.delete(key));

  return cached?.profile ?? null;
}

async function computeAndCache(key: string, lat: number, lng: number): Promise<ObstructionProfile> {
  try {
    const buildings = await fetchNearbyBuildings(lat, lng, 100);
    const profile = computeObstructionProfile(lat, lng, buildings);
    profileCache.set(key, { profile, computedAt: Date.now() });
    return profile;
  } catch (error) {
    console.error(`Shadow computation failed for ${key}:`, error);
    // Return empty profile (no shadow data = no shadow penalty)
    const fallback: ObstructionProfile = { sectors: new Array(36).fill(0), buildingCount: 0 };
    profileCache.set(key, { profile: fallback, computedAt: Date.now() });
    return fallback;
  }
}

/**
 * Pre-warm shadow profiles for a batch of locations.
 * Respects Overpass rate limits by spacing requests.
 */
export async function preWarmShadowProfiles(
  locations: { lat: number; lng: number }[],
  batchSize: number = 5,
  delayMs: number = 2000
): Promise<void> {
  for (let i = 0; i < locations.length; i += batchSize) {
    const batch = locations.slice(i, i + batchSize);
    await Promise.all(
      batch.map(({ lat, lng }) => getShadowProfile(lat, lng, { blocking: true }).catch(() => null))
    );
    if (i + batchSize < locations.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * Get cache stats for debugging
 */
export function getShadowCacheStats() {
  return {
    cached: profileCache.size,
    computing: COMPUTATION_QUEUE.size,
  };
}
