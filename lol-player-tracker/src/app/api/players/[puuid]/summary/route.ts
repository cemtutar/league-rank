import { NextRequest, NextResponse } from 'next/server';
import { getPlayerSummary } from '@/lib/riot';

export async function GET(request: NextRequest, { params }: { params: { puuid: string } }) {
  const region = request.nextUrl.searchParams.get('region');

  if (!region) {
    return NextResponse.json({ message: 'Missing region.' }, { status: 400 });
  }

  try {
    const summary = await getPlayerSummary({ puuid: params.puuid, region });
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Get summary failed', error);
    return NextResponse.json({ message: 'Unable to load summary.' }, { status: 500 });
  }
}
