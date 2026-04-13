/**
 * Building Shadow Estimation
 *
 * For each cafe, we compute a 36-sector "obstruction profile" (10° per sector).
 * Each sector stores the minimum sun altitude needed to clear the tallest
 * building in that direction. At any given time, if the sun's altitude is
 * below the obstruction angle for the sun's azimuth sector, the cafe is shadowed.
 */

export interface ObstructionProfile {
  /** 36 entries (0-350° in 10° steps), each is the min sun altitude to clear buildings */
  sectors: number[];
  /** Number of buildings analyzed */
  buildingCount: number;
}

interface Building {
  lat: number;
  lng: number;
  height: number; // meters
  // Simplified: we treat each building as a point for MVP
}

/**
 * Haversine distance in meters between two points
 */
function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Bearing from point 1 to point 2 in degrees (0-360, clockwise from north)
 */
function bearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/**
 * Compute the obstruction profile for a cafe location given nearby buildings.
 */
export function computeObstructionProfile(
  cafeLat: number,
  cafeLng: number,
  buildings: Building[],
  maxRadius: number = 100 // meters
): ObstructionProfile {
  // Initialize 36 sectors with 0° obstruction (no buildings blocking)
  const sectors = new Array(36).fill(0);
  let buildingCount = 0;

  for (const building of buildings) {
    const dist = distanceMeters(cafeLat, cafeLng, building.lat, building.lng);
    if (dist < 3 || dist > maxRadius) continue; // Skip buildings < 3m away (likely the cafe itself) or too far

    buildingCount++;

    // Obstruction angle: arctan(height / distance)
    const obstructionAngle = Math.atan2(building.height, dist) * (180 / Math.PI);

    // Bearing from cafe to building
    const bearingDeg = bearing(cafeLat, cafeLng, building.lat, building.lng);
    const sectorIdx = Math.floor(bearingDeg / 10) % 36;

    // Also affect adjacent sectors (buildings have width)
    // Approximate angular width: 2 * arctan(buildingWidth / (2 * distance))
    // Use a rough building width of 15m
    const angularWidth = Math.atan2(15, dist) * (180 / Math.PI);
    const sectorsAffected = Math.max(1, Math.ceil(angularWidth / 10));

    for (let offset = -sectorsAffected; offset <= sectorsAffected; offset++) {
      const idx = ((sectorIdx + offset) % 36 + 36) % 36;
      // Reduce obstruction for adjacent sectors
      const factor = offset === 0 ? 1.0 : 0.6;
      sectors[idx] = Math.max(sectors[idx], obstructionAngle * factor);
    }
  }

  return { sectors, buildingCount };
}

/**
 * Check if a cafe is in shadow given its obstruction profile and the current sun position.
 */
export function isShadowed(
  profile: ObstructionProfile,
  sunAzimuth: number,  // degrees from North, clockwise
  sunAltitude: number  // degrees above horizon
): boolean {
  if (sunAltitude <= 0) return true; // Sun below horizon
  if (profile.buildingCount === 0) return false; // No buildings nearby

  const sectorIdx = Math.floor(sunAzimuth / 10) % 36;

  // Check the sector and its neighbors (sun has a small angular size)
  const obstructionAngle = Math.max(
    profile.sectors[sectorIdx],
    profile.sectors[(sectorIdx + 1) % 36] * 0.5,
    profile.sectors[((sectorIdx - 1) + 36) % 36] * 0.5,
  );

  return sunAltitude < obstructionAngle;
}

/**
 * Parse Overpass API response for buildings near a point.
 * Returns simplified building data with estimated heights.
 */
export function parseBuildingsFromOverpass(overpassData: {
  elements: Array<{
    type: string;
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags?: Record<string, string>;
  }>;
}): Building[] {
  const buildings: Building[] = [];

  for (const el of overpassData.elements) {
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (!lat || !lng) continue;

    const tags = el.tags ?? {};
    let height: number;

    if (tags['height']) {
      // Parse "12.5" or "12.5 m"
      height = parseFloat(tags['height']);
    } else if (tags['building:height']) {
      height = parseFloat(tags['building:height']);
    } else if (tags['building:levels']) {
      // Standard floor height ~3m, Berlin Altbau ~3.5m
      height = parseFloat(tags['building:levels']) * 3.2;
    } else {
      // Default: 4 floors (typical Berlin)
      height = 13;
    }

    if (isNaN(height) || height <= 0) height = 13;

    buildings.push({ lat, lng, height });
  }

  return buildings;
}

/**
 * Fetch buildings near a location from the Overpass API.
 */
export async function fetchNearbyBuildings(
  lat: number,
  lng: number,
  radiusMeters: number = 100
): Promise<Building[]> {
  const query = `[out:json][timeout:30];(way["building"](around:${radiusMeters},${lat},${lng}););out center body;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Overpass API error: ${res.status}`);

  const data = await res.json();
  return parseBuildingsFromOverpass(data);
}
