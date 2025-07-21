import { parsePDF } from './pdf-parser';
import { parseDOCX } from './docx-parser';
import { parseResumeWithAI } from './ai-enhanced-parser';
import { ResumeExtractor } from './resume-extractor';
import { TechStackData, ParserResponse } from '../types/resume';
import { validateFile, getFileType } from '../utils/file-validator';

export async function parseResume(file: File): Promise<ParserResponse> {
  const startTime = Date.now();

  try {
    const validation = validateFile(file);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = getFileType(file.type);

    let extractedText: string = '';
    let numPages: number | undefined;

    switch (fileType) {
      case 'pdf': {
        const pdfResult = await parsePDF(buffer);
        extractedText = pdfResult.text;
        numPages = pdfResult.numPages;
        break;
      }
      case 'docx': {
        const docxResult = await parseDOCX(buffer);
        extractedText = docxResult.text;
        break;
      }
      default:
        return {
          success: false,
          error: 'Unsupported file type'
        };
    }

    // Use AI-enhanced parsing with fallback
    const parseResult = await parseResumeWithAI(extractedText, {
      useAI: true,
      aiStrategy: 'full',
      fallbackOnError: true,
      timeout: 8000
    });

    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error || 'Failed to parse resume'
      };
    }

    const processingTime = Date.now() - startTime;
    
    const techStackData: TechStackData = {
      ...parseResult.data!,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: fileType,
        totalPages: numPages,
        totalCharacters: extractedText.length,
        processingTime,
        parsingSource: parseResult.source,
        aiProcessingTime: parseResult.aiProcessingTime
      }
    };

    return {
      success: true,
      data: techStackData
    };

  } catch (error) {
    return {
      success: false,
      error: 'Failed to parse resume',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export * from './pdf-parser';
export * from './docx-parser';
export * from './resume-extractor';
export * from './ai-enhanced-parser';