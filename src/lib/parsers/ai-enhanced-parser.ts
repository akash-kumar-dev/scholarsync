import { AIResumeParser, AIParsingResult } from '../ai/resume-parser';
import { PARSING_STRATEGIES } from '../ai/prompts';
import { TechStackData, ParserResponse } from '../types/resume';

export interface EnhancedParserOptions {
  useAI?: boolean;
  aiStrategy?: 'full' | 'skills' | 'validation';
  fallbackOnError?: boolean;
  timeout?: number;
}

export async function parseResumeWithAI(
  extractedText: string, 
  options: EnhancedParserOptions = {}
): Promise<ParserResponse & { source: 'ai' | 'fallback'; aiProcessingTime?: number }> {
  
  const {
    useAI = true,
    aiStrategy = 'full',
    fallbackOnError = true,
    timeout = 10000
  } = options;

  const startTime = Date.now();

  // If AI is disabled, use fallback immediately
  if (!useAI) {
    const { ResumeExtractor } = await import('./resume-extractor');
    const extractor = new ResumeExtractor(extractedText);
    const data = extractor.extract();
    
    return {
      success: true,
      data: { ...data, rawText: extractedText } as TechStackData,
      source: 'fallback'
    };
  }

  try {
    const aiParser = new AIResumeParser(extractedText);
    
    // Map strategy
    let parsingStrategy;
    switch (aiStrategy) {
      case 'skills':
        parsingStrategy = PARSING_STRATEGIES.SKILLS_ONLY;
        break;
      case 'validation':
        parsingStrategy = PARSING_STRATEGIES.VALIDATION_ONLY;
        break;
      default:
        parsingStrategy = PARSING_STRATEGIES.FULL_PARSE;
    }

    const result: AIParsingResult = await Promise.race([
      aiParser.parseResume(parsingStrategy),
      new Promise<AIParsingResult>((_, reject) =>
        setTimeout(() => reject(new Error('AI parsing timeout')), timeout)
      )
    ]);

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data as TechStackData,
        source: result.source,
        aiProcessingTime: result.processingTime
      };
    } else {
      throw new Error(result.error || 'AI parsing failed');
    }

  } catch (error) {
    console.error('AI parsing error:', error);
    
    if (!fallbackOnError) {
      return {
        success: false,
        error: 'AI parsing failed and fallback disabled',
        source: 'ai'
      };
    }

    // Fallback to regex parsing
    console.log('Falling back to regex parsing...');
    const { ResumeExtractor } = await import('./resume-extractor');
    const extractor = new ResumeExtractor(extractedText);
    const data = extractor.extract();
    
    return {
      success: true,
      data: { ...data, rawText: extractedText } as TechStackData,
      source: 'fallback'
    };
  }
}