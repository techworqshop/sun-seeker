'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/store/app-store';
import { SunSeekerLogo } from '@/components/ui/SunSeekerLogo';
import { SkeletonList } from '@/components/ui/SkeletonCard';
import Explainer from '@/components/ui/Explainer';
import CafeDetail from '@/components/cafe/CafeDetail';
import CafeResultCard from '@/components/cafe/CafeResultCard';
import SmartSearchInput from '@/components/search/SmartSearchInput';
import WeatherRecommendation from '@/components/weather/WeatherRecommendation';
import { smartSearch } from '@/lib/cafes/smart-search';
import { findSunnyCafesNearby, findSunniestCafes, haversineDistance } from '@/lib/cafes/search';
import type { Cafe } from '@/lib/sun/types';

const CafeMap = dynamic(() => import('@/components/map/CafeMap'), { ssr: false, loading: () => (
  <div className="w-full h-full flex items-center justify-center bg-sun-cream">
    <div className="w-6 h-6 border-2 border-sun-amber border-t-transparent rounded-full animate-spin" />
  </div>
)});

type RadiusOption = 500 | 1000 | 5000;

export default function Home() {
  const { cafes, setCafes, selectedCafe, setSelectedCafe } = useAppStore();
  const [weather, setWeather] = useState<{ cloudCover: number; temperature: number } | null>(null);
  const [weatherRec, setWeatherRec] = useState<{ headline: string; subtext: string } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sunnyRadius, setSunnyRadius] = useState<RadiusOption>(1000);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [nearbyActive, setNearbyActive] = useState(false);

  // Fetch + auto-refresh
  useEffect(() => {
    const load = () => {
      fetch('/api/cafes').then((r) => r.json()).then((d) => {
        setCafes(d.cafes);
        if (d.weather) setWeather(d.weather);
        if (d.weatherRecommendation) setWeatherRec(d.weatherRecommendation);
        setIsLoading(false);
      }).catch(() => setIsLoading(false));
    };
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [setCafes]);

  // Smart search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return smartSearch(cafes, searchQuery);
  }, [cafes, searchQuery]);

  // Nearby results
  const nearbyResults = useMemo(() => {
    if (!nearbyActive || !userLocation) return [];
    return findSunnyCafesNearby(cafes, userLocation.lat, userLocation.lng, sunnyRadius);
  }, [cafes, userLocation, sunnyRadius, nearbyActive]);

  // Top cafes (default view)
  const topSunnyCafes = useMemo(() => findSunniestCafes(cafes, 6), [cafes]);

  const handleGetLocation = useCallback(() => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }); setNearbyActive(true); setLocationLoading(false); },
      () => { setUserLocation({ lat: 52.52, lng: 13.405 }); setNearbyActive(true); setLocationLoading(false); },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  const handleCafeClick = useCallback((cafe: Cafe) => { setSelectedCafe(cafe); setShowMap(true); }, [setSelectedCafe]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (q) setNearbyActive(false);
  }, []);

  // What to show in the results area
  const showSearch = searchResults && searchResults.mode !== 'idle';
  const showNearby = nearbyActive && !showSearch;
  const displayResults = showSearch ? searchResults.results : showNearby ? nearbyResults : topSunnyCafes;

  return (
    <div className="min-h-full bg-sun-cream">
      {/* Map overlay */}
      {showMap && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="absolute top-4 left-4 z-50">
            <button onClick={() => { setShowMap(false); setSelectedCafe(null); }} className="glass-strong flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-sun-earth">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back
            </button>
          </div>
          <CafeMap />
          <CafeDetail />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-5 pb-16">

        {/* Hero */}
        <div className="hero-gradient rounded-b-[2.5rem] -mx-5 px-6 pt-12 pb-14 sm:pt-14 sm:pb-16 mb-8 relative overflow-hidden">
          <div className="absolute top-[-60px] right-[-40px] w-[250px] h-[250px] rounded-full bg-orange-500/15 blur-[80px]" />
          <div className="absolute bottom-[-40px] left-[-30px] w-[180px] h-[180px] rounded-full bg-amber-500/10 blur-[60px]" />
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <SunSeekerLogo size="hero" variant="white" layout="stacked" />
              <button onClick={() => { setShowMap(true); }} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full text-white/80 text-xs font-medium transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Map
              </button>
            </div>
            <h1 className="font-display text-[1.75rem] sm:text-[2.75rem] sm:leading-[1.1] font-extrabold text-white tracking-tight mb-2">
              Chase the sun.
            </h1>
            <p className="text-white/60 text-sm sm:text-base font-medium max-w-xs">
              Find Berlin&#39;s sunniest cafe terraces — right now and by the hour.
            </p>
            {!isLoading && (
              <p className="font-pixel text-[10px] text-white/40 mt-4 uppercase tracking-wider">
                {cafes.length} cafes{weather && ` · ${Math.round(weather.temperature)}°C · ${weather.cloudCover}% clouds`}
              </p>
            )}
          </div>
        </div>

        {/* Smart Search */}
        <div className="glass-strong rounded-2xl p-4 glow mb-6">
          <p className="font-pixel text-[10px] text-sun-amber uppercase tracking-wider mb-2.5">Search</p>
          <SmartSearchInput onSearch={handleSearch} />
          {showSearch && searchResults.mode !== 'idle' && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-sun-peach/10">
              <span className="font-pixel text-[9px] text-sun-muted uppercase">
                {searchResults.mode === 'zip' ? 'Zip code' : searchResults.mode === 'neighborhood' ? 'Neighborhood' : 'Name'} · {searchResults.results.length} results
              </span>
              <button onClick={() => setSearchQuery('')} className="font-pixel text-[9px] text-sun-coral hover:text-sun-amber transition-colors uppercase">Clear</button>
            </div>
          )}
        </div>

        {/* Weather Recommendation */}
        <div className="mb-6">
          {isLoading ? (
            <div className="h-12 animate-pulse rounded-xl bg-sun-peach/10" />
          ) : weatherRec ? (
            <WeatherRecommendation headline={weatherRec.headline} subtext={weatherRec.subtext} />
          ) : null}
        </div>

        {/* Location + Radius */}
        {!showSearch && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <button onClick={handleGetLocation} disabled={locationLoading}
              className="glass flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-sun-earth hover:bg-white/60 transition-all disabled:opacity-50">
              {locationLoading ? <div className="w-3 h-3 border-2 border-sun-amber border-t-transparent rounded-full animate-spin" /> : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )} My location
            </button>
            {([500, 1000, 5000] as RadiusOption[]).map((r) => (
              <button key={r} onClick={() => { setSunnyRadius(r); if (userLocation) setNearbyActive(true); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  sunnyRadius === r && nearbyActive ? 'bg-sun-amber text-white' : 'glass text-sun-muted hover:bg-white/60'
                }`}>
                {r < 1000 ? `${r}m` : `${r / 1000}km`}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        <div className="mb-10">
          {isLoading ? (
            <SkeletonList count={6} />
          ) : displayResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {displayResults.map((cafe) => (
                <CafeResultCard
                  key={cafe.id}
                  cafe={cafe}
                  distance={
                    (showSearch && searchResults?.center)
                      ? haversineDistance(searchResults.center.lat, searchResults.center.lng, cafe.lat, cafe.lng)
                      : (showNearby && userLocation)
                        ? haversineDistance(userLocation.lat, userLocation.lng, cafe.lat, cafe.lng)
                        : undefined
                  }
                  onClick={() => handleCafeClick(cafe)}
                />
              ))}
            </div>
          ) : showSearch ? (
            <div className="glass-strong rounded-2xl p-8 text-center"><p className="text-sun-muted text-sm">No cafes found</p></div>
          ) : showNearby ? (
            <div className="glass-strong rounded-2xl p-8 text-center"><p className="text-sun-muted text-sm">No cafes in this radius</p></div>
          ) : null}
        </div>

        {/* Map card */}
        <button onClick={() => setShowMap(true)} className="w-full glass-strong rounded-2xl p-5 hover:bg-white/80 transition-all flex items-center gap-4 mb-8 group glow">
          <div className="w-11 h-11 rounded-xl bg-sun-cream flex items-center justify-center shrink-0 group-hover:bg-sun-peach/40 transition-colors">
            <svg className="w-5 h-5 text-sun-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-display text-sm font-bold text-sun-earth">Open map</h3>
            <p className="text-xs text-sun-muted">{cafes.length > 0 ? `${cafes.length} cafes across Berlin` : 'Loading...'}</p>
          </div>
          <svg className="w-4 h-4 text-sun-peach group-hover:text-sun-amber transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Explainer (collapsible) */}
        <div className="mb-8">
          <Explainer />
        </div>

        {/* Footer */}
        <footer className="text-center pb-8">
          <SunSeekerLogo size="sm" />
        </footer>
      </div>
    </div>
  );
}
