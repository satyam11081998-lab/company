import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Payment verification not yet implemented.' },
    { status: 501 }
  );
}
