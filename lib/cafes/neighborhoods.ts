export interface NeighborhoodInfo {
  lat: number;
  lng: number;
  radius: number; // meters
}

export const BERLIN_NEIGHBORHOODS: Record<string, NeighborhoodInfo> = {
  'mitte': { lat: 52.5200, lng: 13.4050, radius: 2000 },
  'kreuzberg': { lat: 52.4990, lng: 13.4030, radius: 2000 },
  'neukölln': { lat: 52.4810, lng: 13.4350, radius: 2500 },
  'neukoelln': { lat: 52.4810, lng: 13.4350, radius: 2500 },
  'prenzlauer berg': { lat: 52.5400, lng: 13.4200, radius: 2000 },
  'friedrichshain': { lat: 52.5150, lng: 13.4550, radius: 2000 },
  'charlottenburg': { lat: 52.5100, lng: 13.3100, radius: 2500 },
  'schöneberg': { lat: 52.4850, lng: 13.3500, radius: 2000 },
  'schoeneberg': { lat: 52.4850, lng: 13.3500, radius: 2000 },
  'wedding': { lat: 52.5500, lng: 13.3600, radius: 2000 },
  'moabit': { lat: 52.5300, lng: 13.3450, radius: 1500 },
  'tempelhof': { lat: 52.4700, lng: 13.3900, radius: 2500 },
  'treptow': { lat: 52.4900, lng: 13.4700, radius: 2500 },
  'lichtenberg': { lat: 52.5150, lng: 13.5000, radius: 2500 },
  'pankow': { lat: 52.5700, lng: 13.4100, radius: 2500 },
  'wilmersdorf': { lat: 52.4900, lng: 13.3100, radius: 2500 },
  'steglitz': { lat: 52.4560, lng: 13.3300, radius: 2500 },
  'spandau': { lat: 52.5350, lng: 13.2000, radius: 3000 },
  'köpenick': { lat: 52.4450, lng: 13.5800, radius: 3000 },
  'reinickendorf': { lat: 52.5900, lng: 13.3350, radius: 3000 },
  'tiergarten': { lat: 52.5140, lng: 13.3520, radius: 1500 },
  'friedenau': { lat: 52.4730, lng: 13.3400, radius: 1500 },
  'graefekiez': { lat: 52.4930, lng: 13.4200, radius: 800 },
  'bergmannkiez': { lat: 52.4880, lng: 13.3930, radius: 800 },
  'boxhagener platz': { lat: 52.5110, lng: 13.4570, radius: 800 },
  'kollwitzkiez': { lat: 52.5390, lng: 13.4180, radius: 800 },
  'kastanienallee': { lat: 52.5380, lng: 13.4090, radius: 600 },
  'helmholtzplatz': { lat: 52.5440, lng: 13.4160, radius: 600 },
  'simon-dach': { lat: 52.5100, lng: 13.4560, radius: 600 },
};

/**
 * Try to match a query to a Berlin neighborhood.
 * Returns neighborhood info or null.
 */
export function findNeighborhood(query: string): NeighborhoodInfo | null {
  const q = query.toLowerCase().trim();
  return BERLIN_NEIGHBORHOODS[q] ?? null;
}
