'use client';

import { useCallback, useMemo, useRef } from 'react';
import Map, { Marker, type MapRef, type ViewStateChangeEvent } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAppStore } from '@/store/app-store';
import type { Cafe, SunStatus } from '@/lib/sun/types';

const STATUS_COLORS: Record<SunStatus, string> = {
  sunny: '#F59E0B',
  partly: '#9CA3AF',
  shade: '#6B7280',
  night: '#374151',
};

const STATUS_EMOJI: Record<SunStatus, string> = {
  sunny: '☀️',
  partly: '⛅',
  shade: '☁️',
  night: '🌙',
};

function CafePin({ cafe, isSelected, onClick }: { cafe: Cafe; isSelected: boolean; onClick: () => void }) {
  const status = cafe.sunScore?.status ?? 'shade';
  const color = STATUS_COLORS[status];

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`
        flex items-center gap-1 px-2 py-1 rounded-full shadow-lg cursor-pointer
        transition-all duration-200 border-2 whitespace-nowrap
        ${isSelected
          ? 'scale-110 z-50 bg-white border-amber-400 shadow-xl'
          : 'bg-white/90 backdrop-blur-sm border-transparent hover:scale-105 hover:shadow-xl'
        }
      `}
      style={{ borderColor: isSelected ? color : undefined }}
    >
      <span className="text-sm">{STATUS_EMOJI[status]}</span>
      <span className="text-xs font-medium text-gray-800 max-w-[120px] truncate">{cafe.name}</span>
    </button>
  );
}

function CafeDot({ cafe, isSelected, onClick }: { cafe: Cafe; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`
        w-3.5 h-3.5 rounded-full border-2 border-white shadow-md cursor-pointer
        transition-transform hover:scale-150
        ${isSelected ? 'scale-150 ring-2 ring-amber-400' : ''}
      `}
      style={{ backgroundColor: STATUS_COLORS[cafe.sunScore?.status ?? 'shade'] }}
    />
  );
}

// Approximate bounding box padding in degrees for viewport filtering
const PADDING = 0.01;

export default function CafeMap() {
  const mapRef = useRef<MapRef>(null);
  const { cafes, selectedCafe, viewState, setSelectedCafe, setViewState } = useAppStore();

  const handleMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewState({
      latitude: evt.viewState.latitude,
      longitude: evt.viewState.longitude,
      zoom: evt.viewState.zoom,
    });
  }, [setViewState]);

  const handleCafeClick = useCallback((cafe: Cafe) => {
    setSelectedCafe(cafe);
    mapRef.current?.flyTo({
      center: [cafe.lng, cafe.lat],
      zoom: Math.max(viewState.zoom, 15),
      duration: 500,
    });
  }, [setSelectedCafe, viewState.zoom]);

  const handleMapClick = useCallback(() => {
    setSelectedCafe(null);
  }, [setSelectedCafe]);

  // Filter cafes to viewport for performance
  const visibleCafes = useMemo(() => {
    const map = mapRef.current?.getMap();
    if (!map) return cafes; // Show all until map is ready
    const bounds = map.getBounds();
    if (!bounds) return cafes;
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    return cafes.filter((c) =>
      c.lat > sw.lat - PADDING && c.lat < ne.lat + PADDING &&
      c.lng > sw.lng - PADDING && c.lng < ne.lng + PADDING
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafes, viewState.latitude, viewState.longitude, viewState.zoom]);

  const showLabels = viewState.zoom >= 14;

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={handleMove}
      onClick={handleMapClick}
      style={{ width: '100%', height: '100%' }}
      mapStyle="https://tiles.openfreemap.org/styles/liberty"
      attributionControl={{}}
    >
      {visibleCafes.map((cafe) => (
        <Marker
          key={cafe.id}
          latitude={cafe.lat}
          longitude={cafe.lng}
          anchor="center"
        >
          {showLabels ? (
            <CafePin
              cafe={cafe}
              isSelected={selectedCafe?.id === cafe.id}
              onClick={() => handleCafeClick(cafe)}
            />
          ) : (
            <CafeDot
              cafe={cafe}
              isSelected={selectedCafe?.id === cafe.id}
              onClick={() => handleCafeClick(cafe)}
            />
          )}
        </Marker>
      ))}
    </Map>
  );
}
