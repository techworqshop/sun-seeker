'use client';

/* eslint-disable @next/next/no-img-element */

export function SunSeekerLogo({ size = 'md', variant = 'default', layout = 'horizontal' }: {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  variant?: 'default' | 'white' | 'dark';
  layout?: 'horizontal' | 'stacked';
}) {
  const iconH = size === 'sm' ? 28 : size === 'hero' ? 72 : size === 'lg' ? 52 : 38;
  const textClass = size === 'sm' ? 'text-lg' : size === 'hero' ? 'text-base' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  const textColor = variant === 'white' ? 'text-white/80' : variant === 'dark' ? 'text-sun-earth' : 'text-sun-earth';
  const imgStyle = variant === 'white' ? { filter: 'brightness(0) invert(1)' } : undefined;

  if (layout === 'stacked') {
    return (
      <div className="flex flex-col items-start">
        <img
          src="/helios-logo.svg"
          alt="Sun Seeker"
          width={iconH * 1.3}
          height={iconH}
          className="object-contain"
          style={imgStyle}
        />
        <span className={`font-display ${textClass} font-bold tracking-tight ${textColor} mt-1`}>
          Sun Seeker
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/helios-logo.svg"
        alt="Sun Seeker"
        width={iconH * 1.3}
        height={iconH}
        className="object-contain"
        style={imgStyle}
      />
      <span className={`font-display ${size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl'} font-bold tracking-tight ${textColor}`}>
        Sun Seeker
      </span>
    </div>
  );
}
