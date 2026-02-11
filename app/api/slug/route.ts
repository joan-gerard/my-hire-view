import { NextRequest, NextResponse } from 'next/server';
import { generateUniqueSlug } from '@/lib/utils/slug';

export async function POST(request: NextRequest) {
  try {
    const { company, role, excludeId } = await request.json();

    if (!company || !role) {
      return NextResponse.json(
        { error: 'Company and role are required' },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug(company, role, excludeId);
    return NextResponse.json({ slug });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate slug' },
      { status: 500 }
    );
  }
}
