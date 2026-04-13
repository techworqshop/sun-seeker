'use client';

import { useState } from 'react';

export default function VoteButtons({ cafeId }: { cafeId: string }) {
  const [voted, setVoted] = useState<'sunny' | 'shade' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (vote: boolean) => {
    if (voted || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await fetch('/api/votes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cafeId, vote }) });
      setVoted(vote ? 'sunny' : 'shade');
    } catch { /* silent */ } finally { setIsSubmitting(false); }
  };

  if (voted) return <p className="font-pixel text-[10px] text-sun-muted uppercase tracking-wider py-2">Thanks for your feedback!</p>;

  return (
    <div className="flex gap-2">
      <button onClick={() => handleVote(true)} disabled={isSubmitting}
        className="flex-1 py-3 bg-sun-amber/15 hover:bg-sun-amber/25 border border-sun-amber/20 rounded-xl text-sm font-semibold text-sun-earth transition-colors disabled:opacity-50">
        Yes, it's sunny
      </button>
      <button onClick={() => handleVote(false)} disabled={isSubmitting}
        className="flex-1 py-3 bg-sun-earth/5 hover:bg-sun-earth/10 border border-sun-earth/10 rounded-xl text-sm font-semibold text-sun-earth transition-colors disabled:opacity-50">
        No, it's shaded
      </button>
    </div>
  );
}
