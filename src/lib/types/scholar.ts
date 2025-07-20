export interface Publication {
  title: string;
  authors: string;
  venue: string;
  year: string;
  citations: number;
  description?: string;
}

export interface ScholarData {
  name: string;
  affiliation: string;
  researchInterests: string[];
  publications: Publication[];
  citationCount: number;
  hIndex: number;
  i10Index: number;
  skills: string[];
  profileUrl: string;
  metadata: {
    scrapedAt: string;
    processingTime: number;
    publicationCount: number;
  };
}

export interface ScholarResponse {
  success: boolean;
  data?: ScholarData;
  error?: string;
  details?: string;
}