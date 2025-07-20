import { NextRequest, NextResponse } from 'next/server';
import { parseResume } from '@/lib/parsers';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const result = await parseResume(file);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error,
          details: result.details 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });

  } catch (error) {
    console.error('Resume parsing error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}