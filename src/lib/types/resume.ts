export interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface Education {
  institution?: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  location?: string;
}

export interface Experience {
  company?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  description?: string[];
}

export interface TechStackData {
  skills: string[];
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  rawText: string;
  metadata: {
    fileName: string;
    fileSize: number;
    fileType: string;
    totalPages?: number;
    totalCharacters: number;
    processingTime: number;
    parsingSource?: 'ai' | 'fallback';
    aiProcessingTime?: number;
  };
}

export interface ParserResponse {
  success: boolean;
  data?: TechStackData;
  error?: string;
  details?: string;
}
