import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Payment integration is being set up. Please check back soon.' },
    { status: 501 }
  );
}
