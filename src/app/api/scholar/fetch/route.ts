import { NextRequest, NextResponse } from 'next/server';
import { ScholarParser } from '@/lib/parsers/scholar-parser';
import { ScholarData } from '@/lib/types/scholar';

export async function POST(request: NextRequest) {
  try {
    const { profileUrl } = await request.json();

    if (!profileUrl) {
      return NextResponse.json(
        { error: 'Google Scholar profile URL is required' },
        { status: 400 }
      );
    }

    if (!profileUrl.includes('scholar.google.com') && !profileUrl.match(/^[a-zA-Z0-9_-]+$/)) {
      return NextResponse.json(
        { error: 'Invalid Google Scholar URL format' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const parser = new ScholarParser(profileUrl);
    const scrapedData = await parser.fetchProfile();
    
    const skills = parser.extractSkills(scrapedData);
    
    const processingTime = Date.now() - startTime;

    const scholarData: ScholarData = {
      name: scrapedData.name,
      affiliation: scrapedData.affiliation,
      researchInterests: scrapedData.researchInterests,
      publications: scrapedData.publications,
      citationCount: scrapedData.citationCount,
      hIndex: scrapedData.hIndex,
      i10Index: scrapedData.i10Index,
      skills: skills,
      profileUrl: profileUrl,
      metadata: {
        scrapedAt: new Date().toISOString(),
        processingTime,
        publicationCount: scrapedData.publications.length
      }
    };

    return NextResponse.json({
      success: true,
      data: scholarData
    }, { status: 200 });

  } catch (error) {
    console.error('Google Scholar scraping error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Google Scholar profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}