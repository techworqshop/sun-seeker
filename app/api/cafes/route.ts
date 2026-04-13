import { NextResponse } from 'next/server';
import { fetchBerlinCafes } from '@/lib/cafes/overpass';
import { fetchWeather, getCurrentWeather } from '@/lib/weather/open-meteo';
import { getSunPosition, getWeatherFactor, computeSunScore } from '@/lib/sun/calculator';

export async function GET() {
  try {
    // Fetch cafes (live from Overpass, 24h cache) and weather in parallel
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
      return { ...cafe, sunScore };
    });

    return NextResponse.json({
      cafes: cafesWithSun,
      weather: { cloudCover: currentWeather.cloudCover, temperature: currentWeather.temperature },
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch cafes:', error);
    // Fallback: static data without weather
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
      timestamp: now.toISOString(),
    });
  }
}
