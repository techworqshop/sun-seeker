import type { HourlySunForecast } from './types';
import { getSunPosition, getWeatherFactor, computeSunScore } from './calculator';

export interface BestSunWindow {
  startHour: number;
  endHour: number;
  avgScore: number;
}

/**
 * Find the best consecutive sun window from hourly forecast data.
 * Scans for the window of 2+ hours with the highest average score.
 * Returns null if no hour has score >= 20.
 */
export function computeBestSunWindow(forecast: HourlySunForecast[]): BestSunWindow | null {
  // Only look at daytime hours with some sun potential
  const daytime = forecast.filter((f) => f.status !== 'night');
  if (daytime.length === 0) return null;

  let bestStart = 0;
  let bestEnd = 0;
  let bestAvg = 0;

  // Sliding window: try windows of size 2 to 5 hours
  for (let windowSize = 2; windowSize <= Math.min(5, daytime.length); windowSize++) {
    for (let i = 0; i <= daytime.length - windowSize; i++) {
      const window = daytime.slice(i, i + windowSize);

      // Only consider windows with consecutive hours
      let consecutive = true;
      for (let j = 1; j < window.length; j++) {
        const diff = window[j].hour - window[j - 1].hour;
        if (diff !== 1 && diff !== -23) { consecutive = false; break; }
      }
      if (!consecutive) continue;

      const avg = window.reduce((sum, h) => sum + h.score, 0) / window.length;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestStart = window[0].hour;
        bestEnd = window[window.length - 1].hour;
      }
    }
  }

  if (bestAvg < 20) return null;

  return { startHour: bestStart, endHour: bestEnd, avgScore: Math.round(bestAvg) };
}

/**
 * Compute a lightweight best sun window for a cafe using weather data only (no shadow profiles).
 * Used in the main /api/cafes endpoint for card display.
 */
export function computeLightweightBestWindow(
  lat: number,
  lng: number,
  weatherData: { hourly: { time: string[]; cloud_cover: number[]; direct_radiation?: number[]; temperature_2m?: number[] } }
): BestSunWindow | null {
  const now = new Date();
  const forecasts: HourlySunForecast[] = [];
  const { time, cloud_cover, direct_radiation, temperature_2m } = weatherData.hourly;

  for (let i = 0; i < time.length && i < 24; i++) {
    const t = new Date(time[i]);
    if (t < new Date(now.getTime() - 3600000)) continue;

    const sunPos = getSunPosition(t, lat, lng);
    const wFactor = getWeatherFactor(cloud_cover[i], direct_radiation?.[i]);
    const sunScore = computeSunScore(sunPos, wFactor, cloud_cover[i]);

    forecasts.push({
      hour: t.getHours(),
      time: time[i],
      score: sunScore.score,
      status: sunScore.status,
      cloudCover: cloud_cover[i],
      temperature: temperature_2m?.[i] ?? 0,
    });
  }

  return computeBestSunWindow(forecasts);
}
