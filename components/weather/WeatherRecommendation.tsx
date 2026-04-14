'use client';

export default function WeatherRecommendation({
  headline,
  subtext,
}: {
  headline: string;
  subtext: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <h2 className="font-display text-lg font-bold text-sun-earth">{headline}</h2>
        <p className="text-sm text-sun-muted">{subtext}</p>
      </div>
    </div>
  );
}
