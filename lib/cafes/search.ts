import type { Cafe } from '@/lib/sun/types';

// Haversine distance in meters
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function searchCafesByName(cafes: Cafe[], query: string): Cafe[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return cafes
    .filter((c) => {
      const name = c.name.toLowerCase();
      const address = (c.address ?? '').toLowerCase();
      return name.includes(q) || address.includes(q);
    })
    .slice(0, 20);
}

export function searchCafesByZip(cafes: Cafe[], zip: string): Cafe[] {
  const z = zip.trim();
  if (!z) return [];

  return cafes
    .filter((c) => c.address?.includes(z))
    .slice(0, 30);
}

export function findSunnyCafesNearby(
  cafes: Cafe[],
  lat: number,
  lng: number,
  radiusMeters: number
): Cafe[] {
  return cafes
    .map((c) => ({ ...c, _distance: haversineDistance(lat, lng, c.lat, c.lng) }))
    .filter((c) => c._distance <= radiusMeters)
    .sort((a, b) => {
      // Primary: sun score descending, secondary: distance ascending
      const scoreA = a.sunScore?.score ?? 0;
      const scoreB = b.sunScore?.score ?? 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return a._distance - b._distance;
    })
    .slice(0, 30);
}

export function findSunniestCafes(cafes: Cafe[], limit: number = 10): Cafe[] {
  return [...cafes]
    .sort((a, b) => (b.sunScore?.score ?? 0) - (a.sunScore?.score ?? 0))
    .slice(0, limit);
}

// Berlin zip code center coordinates (approximate)
const BERLIN_ZIP_CENTERS: Record<string, [number, number]> = {
  '10115': [52.5328, 13.3870], '10117': [52.5163, 13.3889], '10119': [52.5286, 13.4063],
  '10178': [52.5210, 13.4050], '10179': [52.5120, 13.4180], '10243': [52.5115, 13.4430],
  '10245': [52.5080, 13.4580], '10247': [52.5160, 13.4620], '10249': [52.5270, 13.4400],
  '10315': [52.5160, 13.4950], '10317': [52.4970, 13.4850], '10318': [52.4760, 13.4950],
  '10319': [52.4700, 13.5100], '10365': [52.5190, 13.5080], '10367': [52.5260, 13.4760],
  '10369': [52.5310, 13.4570], '10405': [52.5350, 13.4240], '10407': [52.5370, 13.4400],
  '10409': [52.5470, 13.4350], '10435': [52.5380, 13.4100], '10437': [52.5440, 13.4120],
  '10439': [52.5520, 13.4050], '10551': [52.5320, 13.3430], '10553': [52.5260, 13.3400],
  '10555': [52.5200, 13.3370], '10557': [52.5200, 13.3650], '10559': [52.5370, 13.3530],
  '10585': [52.5140, 13.3050], '10587': [52.5180, 13.3200], '10589': [52.5350, 13.3200],
  '10623': [52.5100, 13.3250], '10625': [52.5070, 13.3150], '10627': [52.5050, 13.3060],
  '10629': [52.5000, 13.3130], '10707': [52.4950, 13.3190], '10709': [52.4870, 13.3130],
  '10711': [52.4900, 13.2960], '10713': [52.4800, 13.3180], '10715': [52.4770, 13.3320],
  '10717': [52.4880, 13.3280], '10719': [52.4990, 13.3310], '10777': [52.4970, 13.3480],
  '10779': [52.4900, 13.3480], '10781': [52.4870, 13.3560], '10783': [52.4920, 13.3640],
  '10785': [52.5040, 13.3650], '10787': [52.5060, 13.3410], '10789': [52.5030, 13.3370],
  '10823': [52.4840, 13.3570], '10825': [52.4820, 13.3490], '10827': [52.4780, 13.3560],
  '10829': [52.4770, 13.3660], '10961': [52.4890, 13.3920], '10963': [52.4970, 13.3820],
  '10965': [52.4820, 13.3850], '10967': [52.4880, 13.4110], '10969': [52.5010, 13.4100],
  '10997': [52.5010, 13.4370], '10999': [52.4960, 13.4250],
  '12043': [52.4820, 13.4310], '12045': [52.4840, 13.4220], '12047': [52.4880, 13.4250],
  '12049': [52.4760, 13.4150], '12051': [52.4700, 13.4280], '12053': [52.4760, 13.4330],
  '12055': [52.4690, 13.4450], '12057': [52.4620, 13.4430], '12059': [52.4710, 13.4490],
  '12099': [52.4660, 13.3930], '12101': [52.4740, 13.3790], '12103': [52.4650, 13.3720],
  '12105': [52.4600, 13.3850], '12107': [52.4480, 13.3780], '12109': [52.4520, 13.3870],
  '13347': [52.5540, 13.3660], '13349': [52.5580, 13.3550], '13351': [52.5510, 13.3470],
  '13353': [52.5430, 13.3600], '13355': [52.5400, 13.3900], '13357': [52.5500, 13.3870],
  '13359': [52.5570, 13.3740],
};

export function getZipCenter(zip: string): [number, number] | null {
  return BERLIN_ZIP_CENTERS[zip] ?? null;
}
