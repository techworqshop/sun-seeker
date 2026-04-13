'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-store';
import SunForecastChart from './SunForecastChart';
import VoteButtons from './VoteButtons';
import type { SunStatus } from '@/lib/sun/types';

const STATUS_TEXT: Record<SunStatus, string> = { sunny: 'Sunny', partly: 'Partly sunny', shade: 'Shaded', night: 'Night' };

export default function CafeDetail() {
  const { selectedCafe, selectedCafeForecast, isLoadingForecast, setSelectedCafe, setSelectedCafeForecast, setIsLoadingForecast } = useAppStore();
  const [shadowInfo, setShadowInfo] = useState<{ hasShadowData: boolean; buildingsAnalyzed: number } | null>(null);

  useEffect(() => {
    if (!selectedCafe) return;
    setIsLoadingForecast(true);
    setShadowInfo(null);
    fetch(`/api/cafes/${selectedCafe.id}/sun-forecast`)
      .then((r) => r.json()).then((d) => {
        setSelectedCafeForecast(d.forecast);
        setShadowInfo({ hasShadowData: d.hasShadowData ?? false, buildingsAnalyzed: d.buildingsAnalyzed ?? 0 });
      })
      .catch(() => setSelectedCafeForecast(null)).finally(() => setIsLoadingForecast(false));
  }, [selectedCafe, setSelectedCafeForecast, setIsLoadingForecast]);

  if (!selectedCafe) return null;
  const status = selectedCafe.sunScore?.status ?? 'shade';
  const score = selectedCafe.sunScore?.score ?? 0;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 animate-slide-up">
      <div className="glass-strong rounded-t-[1.5rem] shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-2 sticky top-0 glass-strong rounded-t-[1.5rem] z-10">
          <div className="w-8 h-1 rounded-full bg-sun-peach" />
        </div>

        <div className="px-5 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-lg font-bold text-sun-earth truncate">{selectedCafe.name}</h2>
              {selectedCafe.address && <p className="text-xs text-sun-muted truncate mt-0.5">{selectedCafe.address}</p>}
            </div>
            <button onClick={() => setSelectedCafe(null)} className="ml-3 w-7 h-7 flex items-center justify-center rounded-full bg-sun-cream text-sun-muted hover:bg-sun-peach/40 transition-colors text-xs">✕</button>
          </div>

          <div className="flex items-center gap-3 p-3 bg-sun-cream rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center">
              <span className="font-pixel text-[14px] text-sun-earth">{Math.round(score)}</span>
            </div>
            <div className="flex-1">
              <p className="font-pixel text-[11px] uppercase text-sun-earth">{STATUS_TEXT[status]}</p>
              <p className="text-xs text-sun-muted">{selectedCafe.sunScore?.cloudCover ?? 0}% cloud cover</p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-4">
          <h3 className="font-pixel text-[10px] text-sun-orange uppercase tracking-wider mb-2">Forecast</h3>
          {isLoadingForecast ? (
            <div className="flex items-center justify-center h-20"><div className="w-5 h-5 border-2 border-sun-orange border-t-transparent rounded-full animate-spin" /></div>
          ) : selectedCafeForecast ? (
            <SunForecastChart forecast={selectedCafeForecast} />
          ) : <p className="text-sm text-sun-muted py-4 text-center">Not available</p>}
        </div>

        {shadowInfo && (
          <div className="px-5 pb-3">
            <p className="font-pixel text-[9px] text-sun-muted/60 uppercase tracking-wider">
              {shadowInfo.hasShadowData ? `${shadowInfo.buildingsAnalyzed} buildings analyzed` : 'Computing shadows...'}
            </p>
          </div>
        )}

        <div className="px-5 pb-6">
          <h3 className="font-pixel text-[10px] text-sun-orange uppercase tracking-wider mb-2">Are you here right now?</h3>
          <VoteButtons cafeId={selectedCafe.id} />
        </div>
      </div>
    </div>
  );
}
