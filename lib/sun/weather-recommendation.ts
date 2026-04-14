import type { Cafe, HourlySunForecast } from './types';
import SunCalc from 'suncalc';

/**
 * Generate an actionable weather recommendation instead of passive status.
 */
export function getWeatherRecommendation(
  cafes: Cafe[],
  weather: { cloudCover: number; temperature: number } | null,
  cityForecast?: HourlySunForecast[]
): { headline: string; subtext: string } {
  const now = new Date();
  const currentHour = now.getHours();
  const sunnyCafes = cafes.filter((c) => c.sunScore && c.sunScore.score >= 60);
  const partlyCafes = cafes.filter((c) => c.sunScore && c.sunScore.score >= 30 && c.sunScore.score < 60);

  // Case 1: Sun is shining right now
  if (sunnyCafes.length > 0) {
    return {
      headline: `${sunnyCafes.length} terraces in the sun`,
      subtext: weather ? `${Math.round(weather.temperature)}°C · ${weather.cloudCover}% clouds` : 'Go outside!',
    };
  }

  // Case 2: Some partly sunny spots
  if (partlyCafes.length > 0) {
    return {
      headline: `${partlyCafes.length} spots with some sun`,
      subtext: 'Partly cloudy — grab a seat while you can',
    };
  }

  // Case 3: No sun now — check forecast for next sunny hour
  if (cityForecast) {
    const nextSunny = cityForecast.find(
      (f) => f.hour > currentHour && (f.status === 'sunny' || f.status === 'partly')
    );
    if (nextSunny) {
      return {
        headline: `Sun breaks through at ${nextSunny.hour}:00`,
        subtext: `Currently ${weather?.cloudCover ?? 100}% clouds — but it clears up`,
      };
    }
  }

  // Case 4: Check if it's night
  const sunTimes = SunCalc.getTimes(now, 52.52, 13.405);
  if (now < sunTimes.sunrise || now > sunTimes.sunset) {
    const tomorrowRise = SunCalc.getTimes(new Date(now.getTime() + 86400000), 52.52, 13.405);
    const riseHour = tomorrowRise.sunrise.getHours();
    const riseMin = String(tomorrowRise.sunrise.getMinutes()).padStart(2, '0');
    return {
      headline: `Sun returns at ${riseHour}:${riseMin}`,
      subtext: 'Check back tomorrow for the best spots',
    };
  }

  // Case 5: Overcast all day
  return {
    headline: 'Overcast today',
    subtext: `${weather?.cloudCover ?? 100}% clouds — these spots still get the most light`,
  };
}
