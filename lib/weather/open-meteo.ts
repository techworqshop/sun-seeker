export interface WeatherData {
  hourly: {
    time: string[];
    cloud_cover: number[];
    direct_radiation: number[];
    diffuse_radiation: number[];
    temperature_2m: number[];
  };
}

let weatherCache: { data: WeatherData; fetchedAt: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Berlin center - one fetch covers the whole city
const BERLIN_LAT = 52.52;
const BERLIN_LNG = 13.405;

export async function fetchWeather(lat?: number, lng?: number): Promise<WeatherData> {
  const useLat = lat ?? BERLIN_LAT;
  const useLng = lng ?? BERLIN_LNG;

  if (weatherCache && Date.now() - weatherCache.fetchedAt < CACHE_TTL) {
    return weatherCache.data;
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${useLat}&longitude=${useLng}&hourly=cloud_cover,direct_radiation,diffuse_radiation,temperature_2m&timezone=Europe/Berlin&forecast_days=2`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo API error: ${res.status}`);
  }

  const data: WeatherData = await res.json();

  weatherCache = { data, fetchedAt: Date.now() };
  return data;
}

export function getCurrentWeather(weatherData: WeatherData): {
  cloudCover: number;
  directRadiation: number;
  temperature: number;
} {
  const now = new Date();
  const currentHour = now.getHours();
  const todayStr = now.toISOString().split('T')[0];

  const idx = weatherData.hourly.time.findIndex((t) => {
    const d = new Date(t);
    return d.toISOString().split('T')[0] === todayStr && d.getHours() === currentHour;
  });

  if (idx === -1) {
    return { cloudCover: 50, directRadiation: 0, temperature: 15 };
  }

  return {
    cloudCover: weatherData.hourly.cloud_cover[idx],
    directRadiation: weatherData.hourly.direct_radiation[idx],
    temperature: weatherData.hourly.temperature_2m[idx],
  };
}
