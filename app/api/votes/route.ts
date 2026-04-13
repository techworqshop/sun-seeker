import { NextResponse } from 'next/server';

// In-memory vote store (replace with Supabase later)
const votes: Map<string, { vote: boolean; votedAt: Date; sessionId: string }[]> = new Map();

export async function POST(request: Request) {
  try {
    const { cafeId, vote } = await request.json();

    if (typeof cafeId !== 'string' || typeof vote !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const existing = votes.get(cafeId) ?? [];
    existing.push({
      vote,
      votedAt: new Date(),
      sessionId: 'anonymous',
    });
    votes.set(cafeId, existing);

    // Clean old votes (older than 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    votes.set(cafeId, existing.filter((v) => v.votedAt > twoHoursAgo));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cafeId = searchParams.get('cafeId');

  if (!cafeId) {
    return NextResponse.json({ error: 'cafeId required' }, { status: 400 });
  }

  const cafeVotes = votes.get(cafeId) ?? [];
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const recent = cafeVotes.filter((v) => v.votedAt > twoHoursAgo);

  return NextResponse.json({
    sunny: recent.filter((v) => v.vote).length,
    shade: recent.filter((v) => !v.vote).length,
    total: recent.length,
  });
}
