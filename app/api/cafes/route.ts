import { NextResponse } from 'next/server';
import { fetchBerlinCafes } from '@/lib/cafes/overpass';
import { fetchWeather, getCurrentWeather } from '@/lib/weather/open-meteo';
import { getSunPosition, getWeatherFactor, computeSunScore, computeHourlyForecast } from '@/lib/sun/calculator';
import { computeLightweightBestWindow } from '@/lib/sun/best-window';
import { getWeatherRecommendation } from '@/lib/sun/weather-recommendation';

export async function GET() {
  try {
    const [cafes, weatherData] = await Promise.all([
      fetchBerlinCafes(),
      fetchWeather(),
    ]);

    const currentWeather = getCurrentWeather(weatherData);
    const now = new Date();

    const cafesWithSun = cafes.map((cafe) => {
      const sunPos = getSunPosition(now, cafe.lat, cafe.lng);
      const wFactor = getWeatherFactor(currentWeather.cloudCover, currentWeather.directRadiation);
      const sunScore = computeSunScore(sunPos, wFactor, currentWeather.cloudCover);
      const bestSunWindow = computeLightweightBestWindow(cafe.lat, cafe.lng, weatherData) ?? undefined;
      return { ...cafe, sunScore, bestSunWindow };
    });

    // City-wide forecast for recommendation
    const cityForecast = computeHourlyForecast(52.52, 13.405, weatherData);
    const recommendation = getWeatherRecommendation(cafesWithSun, currentWeather, cityForecast);

    return NextResponse.json({
      cafes: cafesWithSun,
      weather: { cloudCover: currentWeather.cloudCover, temperature: currentWeather.temperature },
      weatherRecommendation: recommendation,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch cafes:', error);
    const { berlinCafes } = await import('@/data/berlin-cafes');
    const now = new Date();
    const cafesWithSun = berlinCafes.map((cafe) => {
      const sunPos = getSunPosition(now, cafe.lat, cafe.lng);
      const sunScore = computeSunScore(sunPos, 0.5, 50);
      return { ...cafe, sunScore };
    });

    return NextResponse.json({
      cafes: cafesWithSun,
      weather: null,
      weatherRecommendation: { headline: 'Loading...', subtext: 'Weather data unavailable' },
      timestamp: now.toISOString(),
    });
  }
}
