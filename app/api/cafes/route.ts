import { NextResponse } from 'next/server';
import { berlinCafes } from '@/data/berlin-cafes';
import { fetchWeather, getCurrentWeather } from '@/lib/weather/open-meteo';
import { getSunPosition, getWeatherFactor, computeSunScore } from '@/lib/sun/calculator';

export async function GET() {
  try {
    const weatherData = await fetchWeather();
    const currentWeather = getCurrentWeather(weatherData);
    const now = new Date();

    const cafesWithSun = berlinCafes.map((cafe) => {
      const sunPos = getSunPosition(now, cafe.lat, cafe.lng);
      const wFactor = getWeatherFactor(currentWeather.cloudCover, currentWeather.directRadiation);
      const sunScore = computeSunScore(sunPos, wFactor, currentWeather.cloudCover);

      return {
        ...cafe,
        sunScore,
      };
    });

    return NextResponse.json({
      cafes: cafesWithSun,
      weather: {
        cloudCover: currentWeather.cloudCover,
        temperature: currentWeather.temperature,
      },
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch cafes:', error);
    // Fallback without weather
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
