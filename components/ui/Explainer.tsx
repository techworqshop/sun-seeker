'use client';

import { useState } from 'react';

export default function Explainer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-strong rounded-2xl overflow-hidden glow">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="font-display text-sm font-bold text-sun-earth">How does it work?</span>
        <svg
          className={`w-4 h-4 text-sun-muted transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3 text-[13px] text-sun-muted leading-relaxed animate-fade-in">
          <p><span className="font-semibold text-sun-earth">Sun position.</span> We calculate exactly where the sun sits in the sky — altitude and direction — for every spot in Berlin, updated every second.</p>
          <p><span className="font-semibold text-sun-earth">Weather.</span> Every 30 minutes we pull live cloud cover and solar radiation data from the German Weather Service. Heavy clouds = less sun, no matter how high the sun is.</p>
          <p><span className="font-semibold text-sun-earth">Buildings.</span> We analyze building heights around each cafe. Tall buildings nearby can block the sun even on a clear day — we compute this using 3D data from OpenStreetMap.</p>
          <p><span className="font-semibold text-sun-earth">Community.</span> Your feedback counts! If you&#39;re sitting at a cafe, tell us whether the sun actually shines. It makes predictions better for everyone.</p>
          <div className="pt-3 border-t border-sun-peach/20">
            <p className="font-pixel text-[9px] text-sun-muted/60 uppercase tracking-wider">
              OpenStreetMap · Open-Meteo DWD ICON · suncalc
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
