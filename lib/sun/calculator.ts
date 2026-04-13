import SunCalc from 'suncalc';
import type { SunPosition, SunScore, SunStatus, HourlySunForecast } from './types';
import type { ObstructionProfile } from './shadow';
import { isShadowed } from './shadow';

export function getSunPosition(date: Date, lat: number, lng: number): SunPosition {
  const pos = SunCalc.getPosition(date, lat, lng);
  return {
    altitude: pos.altitude * (180 / Math.PI),
    azimuth: ((pos.azimuth * (180 / Math.PI)) + 180) % 360,
  };
}

export function getWeatherFactor(cloudCover: number, directRadiation?: number): number {
  if (directRadiation !== undefined && directRadiation > 0) {
    return Math.min(directRadiation / 800, 1.0);
  }
  return 1.0 - (cloudCover / 100);
}

export function getCommunityAdjustment(
  votes: { vote: boolean; votedAt: Date }[],
  now: Date
): number {
  if (votes.length === 0) return 0;
  let weightedPositive = 0;
  let weightedTotal = 0;
  for (const v of votes) {
    const minutesAgo = (now.getTime() - v.votedAt.getTime()) / 60000;
    const weight = Math.exp(-minutesAgo / 30);
    weightedTotal += weight;
    if (v.vote) weightedPositive += weight;
  }
  if (weightedTotal < 0.5) return 0;
  return ((weightedPositive / weightedTotal) - 0.5) * 40;
}

export function computeSunScore(
  sunPosition: SunPosition,
  weatherFactor: number,
  cloudCover: number,
  communityAdj: number = 0,
  shadowProfile?: ObstructionProfile,
): SunScore {
  if (sunPosition.altitude <= 0) {
    return { score: 0, status: 'night', sunPosition, weatherFactor, cloudCover };
  }

  const altitudeScore = Math.min(sunPosition.altitude / 45, 1.0) * 100;
  let score = altitudeScore * weatherFactor;

  // Apply building shadow if profile exists
  if (shadowProfile && isShadowed(shadowProfile, sunPosition.azimuth, sunPosition.altitude)) {
    score *= 0.15; // 85% reduction when in building shadow
  }

  score = Math.max(0, Math.min(100, score + communityAdj));

  let status: SunStatus;
  if (score >= 60) status = 'sunny';
  else if (score >= 30) status = 'partly';
  else status = 'shade';

  return { score, status, sunPosition, weatherFactor, cloudCover };
}

export function computeHourlyForecast(
  lat: number,
  lng: number,
  weatherData: { hourly: { time: string[]; cloud_cover: number[]; direct_radiation?: number[]; temperature_2m?: number[] } },
  communityAdj: number = 0,
  shadowProfile?: ObstructionProfile,
): HourlySunForecast[] {
  const now = new Date();
  const forecasts: HourlySunForecast[] = [];
  const { time, cloud_cover, direct_radiation, temperature_2m } = weatherData.hourly;

  for (let i = 0; i < time.length && i < 48; i++) {
    const forecastTime = new Date(time[i]);
    if (forecastTime < new Date(now.getTime() - 3600000)) continue;

    const sunPos = getSunPosition(forecastTime, lat, lng);
    const wFactor = getWeatherFactor(cloud_cover[i], direct_radiation?.[i]);
    const sunScore = computeSunScore(sunPos, wFactor, cloud_cover[i], communityAdj, shadowProfile);

    forecasts.push({
      hour: forecastTime.getHours(),
      time: time[i],
      score: sunScore.score,
      status: sunScore.status,
      cloudCover: cloud_cover[i],
      temperature: temperature_2m?.[i] ?? 0,
    });
  }

  return forecasts;
}
