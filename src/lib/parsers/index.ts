import { parsePDF } from './pdf-parser';
import { parseDOCX } from './docx-parser';
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

    const extractor = new ResumeExtractor(extractedText);
    const extractedData = extractor.extract();

    const processingTime = Date.now() - startTime;
    const techStackData: TechStackData = {
      ...extractedData,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: fileType,
        totalPages: numPages,
        totalCharacters: extractedText.length,
        processingTime
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