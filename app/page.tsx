'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/store/app-store';
import { SunSeekerLogo } from '@/components/ui/SunSeekerLogo';
import CafeDetail from '@/components/cafe/CafeDetail';
import CafeResultCard from '@/components/cafe/CafeResultCard';
import { searchCafesByName, findSunnyCafesNearby, findSunniestCafes, getZipCenter, haversineDistance } from '@/lib/cafes/search';
import type { Cafe } from '@/lib/sun/types';

const CafeMap = dynamic(() => import('@/components/map/CafeMap'), { ssr: false, loading: () => (
  <div className="w-full h-full flex items-center justify-center bg-sun-cream">
    <div className="w-6 h-6 border-2 border-sun-orange border-t-transparent rounded-full animate-spin" />
  </div>
)});

type RadiusOption = 500 | 1000 | 5000;

export default function Home() {
  const { cafes, setCafes, selectedCafe, setSelectedCafe } = useAppStore();
  const [weather, setWeather] = useState<{ cloudCover: number; temperature: number } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [nameQuery, setNameQuery] = useState('');
  const [zipQuery, setZipQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState<'none' | 'name' | 'zip' | 'sunny'>('none');
  const [sunnyRadius, setSunnyRadius] = useState<RadiusOption>(1000);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    fetch('/api/cafes').then((r) => r.json()).then((d) => { setCafes(d.cafes); if (d.weather) setWeather(d.weather); }).catch(console.error);
  }, [setCafes]);

  const nameResults = useMemo(() => activeSearch === 'name' && nameQuery.trim() ? searchCafesByName(cafes, nameQuery) : [], [cafes, nameQuery, activeSearch]);
  const zipResults = useMemo(() => {
    if (activeSearch !== 'zip' || !zipQuery.trim()) return [];
    const c = getZipCenter(zipQuery.trim());
    return c ? findSunnyCafesNearby(cafes, c[0], c[1], 2000) : [];
  }, [cafes, zipQuery, activeSearch]);
  const sunnyNearbyResults = useMemo(() => activeSearch === 'sunny' && userLocation ? findSunnyCafesNearby(cafes, userLocation.lat, userLocation.lng, sunnyRadius) : [], [cafes, userLocation, sunnyRadius, activeSearch]);
  const topSunnyCafes = useMemo(() => findSunniestCafes(cafes, 5), [cafes]);

  const handleGetLocation = useCallback(() => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }); setActiveSearch('sunny'); setLocationLoading(false); },
      () => { setUserLocation({ lat: 52.52, lng: 13.405 }); setActiveSearch('sunny'); setLocationLoading(false); },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  const handleCafeClick = useCallback((cafe: Cafe) => { setSelectedCafe(cafe); setShowMap(true); }, [setSelectedCafe]);

  const currentResults = activeSearch === 'name' ? nameResults : activeSearch === 'zip' ? zipResults : activeSearch === 'sunny' ? sunnyNearbyResults : [];
  const hasSunnyCafes = currentResults.some((c) => c.sunScore && c.sunScore.score >= 30);
  const anySunnyInBerlin = useMemo(() => cafes.some((c) => c.sunScore && c.sunScore.score >= 60), [cafes]);

  return (
    <div className="min-h-full">
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

      <div className="max-w-2xl mx-auto px-5 pb-16">

        {/* Hero — real sunrise */}
        <div className="hero-gradient rounded-b-[2.5rem] -mx-5 px-6 pt-12 pb-14 sm:pt-16 sm:pb-20 mb-10 relative overflow-hidden">
          <div className="absolute top-[-60px] right-[-40px] w-[250px] h-[250px] rounded-full bg-orange-500/15 blur-[80px]" />
          <div className="absolute bottom-[-40px] left-[-30px] w-[180px] h-[180px] rounded-full bg-amber-500/10 blur-[60px]" />

          <div className="relative">
            <div className="flex items-center justify-between mb-10">
              <SunSeekerLogo size="hero" variant="white" layout="stacked" />
              <button
                onClick={() => { setShowMap(true); setActiveSearch('none'); }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full text-white/80 text-xs font-medium transition-colors"
              >
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
              Find Berlin's sunniest cafe terraces — right now and by the hour.
            </p>
            <p className="font-pixel text-[10px] text-white/40 mt-4 uppercase tracking-wider">
              {cafes.length > 0 ? `${cafes.length} cafes` : 'Loading...'}
              {weather && ` · ${Math.round(weather.temperature)}° · ${weather.cloudCover}% clouds`}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          <div className="glass-strong rounded-2xl p-4 glow">
            <p className="font-pixel text-[10px] text-sun-orange uppercase tracking-wider mb-2.5">Search cafe</p>
            <form onSubmit={(e) => { e.preventDefault(); setActiveSearch('name'); }} className="flex gap-2">
              <input
                type="text" value={nameQuery}
                onChange={(e) => { setNameQuery(e.target.value); if (e.target.value.length >= 2) setActiveSearch('name'); }}
                placeholder="Name or address..."
                className="flex-1 px-3 py-2.5 bg-white/60 rounded-xl text-sm text-sun-earth placeholder:text-sun-muted/50 border border-white/40 focus:outline-none focus:bg-white/80 focus:border-sun-peach transition-all"
              />
              <button type="submit" className="w-10 h-10 flex items-center justify-center bg-sun-orange hover:bg-sun-coral text-white rounded-xl transition-colors shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </form>
          </div>

          <div className="glass-strong rounded-2xl p-4 glow">
            <p className="font-pixel text-[10px] text-sun-orange uppercase tracking-wider mb-2.5">Zip code</p>
            <form onSubmit={(e) => { e.preventDefault(); setActiveSearch('zip'); }} className="flex gap-2">
              <input
                type="text" value={zipQuery}
                onChange={(e) => setZipQuery(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="z.B. 10997"
                className="flex-1 px-3 py-2.5 bg-white/60 rounded-xl text-sm text-sun-earth placeholder:text-sun-muted/50 border border-white/40 focus:outline-none focus:bg-white/80 focus:border-sun-peach transition-all"
                inputMode="numeric" maxLength={5}
              />
              <button type="submit" className="w-10 h-10 flex items-center justify-center bg-sun-orange hover:bg-sun-coral text-white rounded-xl transition-colors shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </form>
          </div>
        </div>

        {/* Search Results */}
        {activeSearch !== 'none' && activeSearch !== 'sunny' && currentResults.length > 0 && (
          <div className="mb-10 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base font-bold text-sun-earth">{currentResults.length} result{currentResults.length !== 1 ? 's' : ''}</h2>
              <button onClick={() => { setActiveSearch('none'); setNameQuery(''); setZipQuery(''); }} className="font-pixel text-[10px] text-sun-coral hover:text-sun-orange transition-colors">Reset</button>
            </div>
            <div className="flex flex-col gap-2">{currentResults.map((cafe) => (
              <CafeResultCard key={cafe.id} cafe={cafe}
                distance={activeSearch === 'zip' && zipQuery ? (() => { const c = getZipCenter(zipQuery.trim()); return c ? haversineDistance(c[0], c[1], cafe.lat, cafe.lng) : undefined; })() : undefined}
                onClick={() => handleCafeClick(cafe)} />
            ))}</div>
          </div>
        )}

        {activeSearch !== 'none' && activeSearch !== 'sunny' && currentResults.length === 0 && (nameQuery.length >= 2 || zipQuery.length === 5) && (
          <div className="mb-10 glass-strong rounded-2xl p-8 text-center"><p className="text-sun-muted text-sm">No cafes found</p></div>
        )}

        {/* Sunny now */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-xl">{anySunnyInBerlin ? '☀️' : '☁️'}</span>
            <h2 className="font-display text-xl font-bold text-sun-earth">
              {anySunnyInBerlin ? 'Sunny right now' : 'Cloudy right now'}
            </h2>
          </div>
          <p className="text-sm text-sun-muted mb-5 ml-[34px]">
            {anySunnyInBerlin ? 'Cafes with good sun exposure' : `${weather ? `${weather.cloudCover}% clouds` : ''} — best options nearby`}
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-5">
            <button onClick={handleGetLocation} disabled={locationLoading}
              className="glass flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-sun-earth hover:bg-white/60 transition-all disabled:opacity-50">
              {locationLoading ? <div className="w-3 h-3 border-2 border-sun-orange border-t-transparent rounded-full animate-spin" /> : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )} My location
            </button>
            {([500, 1000, 5000] as RadiusOption[]).map((r) => (
              <button key={r} onClick={() => { setSunnyRadius(r); if (userLocation) setActiveSearch('sunny'); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  sunnyRadius === r && activeSearch === 'sunny' ? 'bg-sun-orange text-white' : 'glass text-sun-muted hover:bg-white/60'
                }`}>
                {r < 1000 ? `${r}m` : `${r / 1000}km`}
              </button>
            ))}
          </div>

          {activeSearch === 'sunny' && sunnyNearbyResults.length > 0 ? (
            <div className="flex flex-col gap-2">
              {!hasSunnyCafes && <div className="glass rounded-xl p-3 mb-1"><p className="text-xs text-sun-muted">No cafe has full sun right now.{sunnyRadius < 5000 && ' Try a larger radius?'}</p></div>}
              {sunnyNearbyResults.slice(0, 5).map((cafe) => (
                <CafeResultCard key={cafe.id} cafe={cafe} distance={userLocation ? haversineDistance(userLocation.lat, userLocation.lng, cafe.lat, cafe.lng) : undefined} onClick={() => handleCafeClick(cafe)} />
              ))}
            </div>
          ) : activeSearch === 'sunny' && sunnyNearbyResults.length === 0 ? (
            <div className="glass-strong rounded-xl p-5 text-center"><p className="text-sm text-sun-muted">No cafes in this radius</p></div>
          ) : (
            <div className="flex flex-col gap-2">{topSunnyCafes.map((cafe) => (
              <CafeResultCard key={cafe.id} cafe={cafe} onClick={() => handleCafeClick(cafe)} />
            ))}</div>
          )}
        </div>

        {/* Map card */}
        <button onClick={() => setShowMap(true)} className="w-full glass-strong rounded-2xl p-5 hover:bg-white/80 transition-all flex items-center gap-4 mb-12 group glow">
          <div className="w-11 h-11 rounded-xl bg-sun-cream flex items-center justify-center shrink-0 group-hover:bg-sun-peach/40 transition-colors">
            <svg className="w-5 h-5 text-sun-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-display text-sm font-bold text-sun-earth">Open map</h3>
            <p className="text-xs text-sun-muted">{cafes.length} cafes across Berlin</p>
          </div>
          <svg className="w-4 h-4 text-sun-peach group-hover:text-sun-orange transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Explainer */}
        <div className="glass-strong rounded-2xl p-5 sm:p-6 mb-10 glow">
          <h3 className="font-display text-base font-bold text-sun-earth mb-3">How does it work?</h3>
          <div className="space-y-3 text-[13px] text-sun-muted leading-relaxed">
            <p><span className="font-semibold text-sun-earth">Sun position.</span> We calculate exactly where the sun sits in the sky — altitude and direction — for every spot in Berlin, updated every second.</p>
            <p><span className="font-semibold text-sun-earth">Weather.</span> Every 30 minutes we pull live cloud cover and solar radiation data from the German Weather Service. Heavy clouds = less sun, no matter how high the sun is.</p>
            <p><span className="font-semibold text-sun-earth">Buildings.</span> We analyze building heights around each cafe. Tall buildings nearby can block the sun even on a clear day — we compute this using 3D data from OpenStreetMap.</p>
            <p><span className="font-semibold text-sun-earth">Community.</span> Your feedback counts! If you're sitting at a cafe, tell us whether the sun actually shines. It makes predictions better for everyone.</p>
          </div>
          <div className="mt-4 pt-3 border-t border-sun-peach/20">
            <p className="font-pixel text-[9px] text-sun-muted/60 uppercase tracking-wider">
              OpenStreetMap · Open-Meteo DWD ICON · suncalc
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center pb-8">
          <SunSeekerLogo size="sm" />
        </footer>
      </div>
    </div>
  );
}
