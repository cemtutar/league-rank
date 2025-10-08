import { NextRequest, NextResponse } from 'next/server';
import { resolvePlayer } from '@/lib/riot';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameName, tagLine, region } = body as {
      gameName?: string;
      tagLine?: string;
      region?: string;
    };

    if (!gameName || !tagLine || !region) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const player = await resolvePlayer({ gameName, tagLine, region });
    return NextResponse.json(player);
  } catch (error) {
    console.error('Resolve player failed', error);
    return NextResponse.json({ message: 'Unable to resolve player.' }, { status: 500 });
  }
}
