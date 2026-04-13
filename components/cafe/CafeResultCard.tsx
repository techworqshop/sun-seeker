'use client';

import type { Cafe, SunStatus } from '@/lib/sun/types';

const STATUS_CONFIG: Record<SunStatus, { emoji: string; label: string; color: string }> = {
  sunny: { emoji: '☀️', label: 'Sunny', color: 'text-sun-amber' },
  partly: { emoji: '⛅', label: 'Partly sunny', color: 'text-sun-muted' },
  shade: { emoji: '☁️', label: 'Shaded', color: 'text-sun-muted' },
  night: { emoji: '🌙', label: 'Night', color: 'text-sun-muted' },
};

export default function CafeResultCard({ cafe, distance, onClick }: { cafe: Cafe; distance?: number; onClick?: () => void }) {
  const status = cafe.sunScore?.status ?? 'shade';
  const score = cafe.sunScore?.score ?? 0;
  const config = STATUS_CONFIG[status];

  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3 glass-strong rounded-xl hover:bg-white/80 transition-all text-left group">
      <div className="w-10 h-10 rounded-lg bg-sun-cream flex items-center justify-center shrink-0">
        <span className="text-lg">{config.emoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-bold text-sun-earth text-sm truncate">{cafe.name}</h3>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`font-pixel text-[9px] uppercase ${config.color}`}>{config.label}</span>
          <span className="text-[11px] text-sun-peach">·</span>
          <span className="text-[11px] text-sun-muted">{Math.round(score)}/100</span>
          {distance !== undefined && (
            <><span className="text-[11px] text-sun-peach">·</span><span className="text-[11px] text-sun-muted">{distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`}</span></>
          )}
        </div>
        {cafe.address && <p className="text-[11px] text-sun-muted/60 truncate mt-0.5">{cafe.address}</p>}
      </div>
      <svg className="w-4 h-4 text-sun-peach group-hover:text-sun-orange transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
