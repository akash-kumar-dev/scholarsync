import mammoth from 'mammoth';

export interface DOCXParseResult {
  text: string;
  messages: any[];
}

export async function parseDOCX(buffer: Buffer): Promise<DOCXParseResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    
    return {
      text: result.value,
      messages: result.messages
    };
  } catch (error) {
    throw new Error(`DOCX parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}