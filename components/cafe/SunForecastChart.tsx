'use client';

import type { HourlySunForecast, SunStatus } from '@/lib/sun/types';
import SunCalc from 'suncalc';

const SEGMENT_COLORS: Record<SunStatus, string> = {
  sunny: '#C4682E',
  partly: '#D4956A',
  shade: '#D6D3D1',
  night: '#5C4F43',
};

export default function SunForecastChart({ forecast }: { forecast: HourlySunForecast[] }) {
  const now = new Date();
  const currentHour = now.getHours();
  const visible = forecast.slice(0, 14);

  const sunTimes = SunCalc.getTimes(now, 52.52, 13.405);
  const sunsetHour = sunTimes.sunset.getHours();
  const sunsetMin = sunTimes.sunset.getMinutes();
  const sunriseHour = sunTimes.sunrise.getHours();
  const sunriseMin = sunTimes.sunrise.getMinutes();

  // Find the index of "now" for the triangle marker
  const nowIdx = visible.findIndex((f, i) => f.hour === currentHour && i < 2);

  return (
    <div className="w-full">
      {/* Now triangle marker — above the strip */}
      <div className="flex mb-0.5 h-3">
        {visible.map((_, i) => (
          <div key={`tri-${i}`} className="flex-1 flex justify-center">
            {i === nowIdx && (
              <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-sun-orange" />
            )}
          </div>
        ))}
      </div>

      {/* Sun strip */}
      <div className="flex rounded-xl overflow-hidden h-10 mb-1.5 ring-1 ring-black/5">
        {visible.map((f, i) => {
          return (
            <div
              key={`${f.hour}-${i}`}
              className="flex-1 relative flex items-center justify-center"
              style={{ backgroundColor: SEGMENT_COLORS[f.status] }}
            >
              <span className={`text-[9px] font-medium relative z-10 ${
                f.status === 'night' ? 'text-white/70' : f.status === 'sunny' ? 'text-amber-900/60' : 'text-stone-500/70'
              }`}>
                {Math.round(f.temperature)}°C
              </span>
            </div>
          );
        })}
      </div>

      {/* Hour labels */}
      <div className="flex mb-2.5">
        {visible.map((f, i) => {
          const isCurrent = f.hour === currentHour && i < 2;
          const isSunset = f.hour === sunsetHour;
          const isSunrise = f.hour === sunriseHour;
          const showLabel = isCurrent || isSunset || isSunrise || i === 0 || i === visible.length - 1 || i % 3 === 0;

          return (
            <div key={`label-${f.hour}-${i}`} className="flex-1 text-center">
              {showLabel && (
                <span className={`text-[10px] ${
                  isCurrent ? 'font-bold text-sun-earth' :
                  isSunset ? 'font-bold text-sun-coral' :
                  isSunrise ? 'font-bold text-sun-orange' :
                  'text-sun-muted/50'
                }`}>
                  {isCurrent ? 'now' : `${f.hour}h`}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend — no emojis */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-sun-muted">
        <span className="flex items-center gap-1">
          <span className="w-3 h-2.5 rounded-sm" style={{ backgroundColor: SEGMENT_COLORS.sunny }} />
          <span className="font-pixel">SUN</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2.5 rounded-sm" style={{ backgroundColor: SEGMENT_COLORS.partly }} />
          <span className="font-pixel">PARTIAL</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2.5 rounded-sm" style={{ backgroundColor: SEGMENT_COLORS.shade }} />
          <span className="font-pixel">SHADE</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2.5 rounded-sm" style={{ backgroundColor: SEGMENT_COLORS.night }} />
          <span className="font-pixel">NIGHT</span>
        </span>
        <span className="font-pixel text-sun-orange">RISE {sunriseHour}:{String(sunriseMin).padStart(2, '0')}</span>
        <span className="font-pixel text-sun-coral">SET {sunsetHour}:{String(sunsetMin).padStart(2, '0')}</span>
      </div>
    </div>
  );
}
