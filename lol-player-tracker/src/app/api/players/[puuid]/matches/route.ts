import { NextRequest, NextResponse } from 'next/server';
import { getPlayerMatches } from '@/lib/riot';

export async function GET(request: NextRequest, { params }: { params: { puuid: string } }) {
  const region = request.nextUrl.searchParams.get('region');

  if (!region) {
    return NextResponse.json({ message: 'Missing region.' }, { status: 400 });
  }

  try {
    const matches = await getPlayerMatches({ puuid: params.puuid, region });
    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Get matches failed', error);
    return NextResponse.json({ message: 'Unable to load matches.' }, { status: 500 });
  }
}
