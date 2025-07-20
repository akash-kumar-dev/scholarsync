// @ts-ignore
import pdf from 'pdf-parse/lib/pdf-parse.js';

export interface PDFParseResult {
  text: string;
  numPages: number;
  metadata?: any;
  info?: any;
}

export async function parsePDF(buffer: Buffer): Promise<PDFParseResult> {
  try {
    const data = await pdf(buffer);
    
    return {
      text: data.text,
      numPages: data.numpages,
      metadata: data.metadata,
      info: data.info
    };
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}