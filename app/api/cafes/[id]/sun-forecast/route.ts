import { NextResponse } from 'next/server';
import { berlinCafes } from '@/data/berlin-cafes';
import { fetchWeather } from '@/lib/weather/open-meteo';
import { computeHourlyForecast } from '@/lib/sun/calculator';
import { getShadowProfile } from '@/lib/sun/shadow-cache';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cafe = berlinCafes.find((c) => c.id === id);

  if (!cafe) {
    return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });
  }

  try {
    // Fetch weather and shadow profile in parallel
    const [weatherData, shadowProfile] = await Promise.all([
      fetchWeather(),
      getShadowProfile(cafe.lat, cafe.lng, { blocking: true }),
    ]);

    const forecast = computeHourlyForecast(
      cafe.lat, cafe.lng, weatherData, 0, shadowProfile ?? undefined
    );

    return NextResponse.json({
      cafeId: cafe.id,
      cafeName: cafe.name,
      forecast,
      hasShadowData: shadowProfile !== null && shadowProfile.buildingCount > 0,
      buildingsAnalyzed: shadowProfile?.buildingCount ?? 0,
    });
  } catch (error) {
    console.error('Failed to compute forecast:', error);
    return NextResponse.json({ error: 'Failed to compute forecast' }, { status: 500 });
  }
}
