import { aiClient } from './clients/ai-client';
import { RESUME_PARSING_PROMPTS, ParsingStrategy, PARSING_STRATEGIES } from './prompts';
import { TechStackData, PersonalInfo, Education, Experience } from '../types/resume';
import { ResumeExtractor } from '../parsers/resume-extractor';

export interface AIParsingResult {
  success: boolean;
  data?: Partial<TechStackData>;
  error?: string;
  source: 'ai' | 'fallback';
  provider?: string;
  processingTime: number;
}

export class AIResumeParser {
  private fallbackExtractor: ResumeExtractor;
  private resumeText: string;

  constructor(resumeText: string) {
    this.resumeText = resumeText;
    this.fallbackExtractor = new ResumeExtractor(resumeText);
  }

  async parseResume(strategy: ParsingStrategy = PARSING_STRATEGIES.FULL_PARSE): Promise<AIParsingResult> {
    const startTime = Date.now();

    // Check if AI is available
    if (!aiClient.isAvailable()) {
      console.log('AI not available, using fallback parsing');
      return this.getFallbackResult(startTime);
    }

    try {
      switch (strategy) {
        case PARSING_STRATEGIES.FULL_PARSE:
          return await this.fullAIParse(startTime);
        
        case PARSING_STRATEGIES.SKILLS_ONLY:
          return await this.enhanceSkillsOnly(startTime);
        
        case PARSING_STRATEGIES.VALIDATION_ONLY:
          return await this.validateWithAI(startTime);
        
        default:
          return await this.fullAIParse(startTime);
      }
    } catch (error) {
      console.error('AI parsing failed, falling back to regex:', error);
      return this.getFallbackResult(startTime);
    }
  }

  private async fullAIParse(startTime: number): Promise<AIParsingResult> {
    try {
      const messages = [
        { role: 'system' as const, content: RESUME_PARSING_PROMPTS.SYSTEM_PROMPT },
        { role: 'user' as const, content: RESUME_PARSING_PROMPTS.USER_PROMPT(this.resumeText) }
      ];

      // Use the unified client with fallback
      const result = await aiClient.createChatCompletionWithFallback(messages);
      
      if (!result.content) {
        throw new Error('No response from AI');
      }

      const parsedData = await aiClient.parseJSON<Partial<TechStackData>>(result.content);
      
      if (!parsedData) {
        throw new Error('Failed to parse AI response as JSON');
      }

      const validatedData = this.validateAIResponse(parsedData);

      return {
        success: true,
        data: validatedData,
        source: 'ai',
        provider: result.provider,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('Full AI parse failed:', error);
      return this.getFallbackResult(startTime);
    }
  }

  private async enhanceSkillsOnly(startTime: number): Promise<AIParsingResult> {
    try {
      const fallbackData = this.fallbackExtractor.extract();
      
      // Enhance skills with AI
      const messages = [
        { role: 'system' as const, content: 'You are a technical skill standardization expert.' },
        { 
          role: 'user' as const, 
          content: RESUME_PARSING_PROMPTS.SKILLS_ENHANCEMENT_PROMPT(
            fallbackData.skills, 
            this.resumeText
          )
        }
      ];

      const result = await aiClient.createChatCompletionWithFallback(messages);
      
      if (!result.content) {
        throw new Error('No response from AI for skills enhancement');
      }

      const enhancedSkills = await aiClient.parseJSON<string[]>(result.content);
      
      if (!Array.isArray(enhancedSkills)) {
        throw new Error('AI did not return valid skills array');
      }

      return {
        success: true,
        data: {
          ...fallbackData,
          skills: enhancedSkills
        },
        source: 'ai',
        provider: result.provider,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('Skills enhancement failed:', error);
      return this.getFallbackResult(startTime);
    }
  }

  private async validateWithAI(startTime: number): Promise<AIParsingResult> {
    try {
      const fallbackData = this.fallbackExtractor.extract();
      
      const messages = [
        { role: 'system' as const, content: 'You are a data validation expert.' },
        { role: 'user' as const, content: RESUME_PARSING_PROMPTS.VALIDATION_PROMPT(fallbackData) }
      ];

      const result = await aiClient.createChatCompletionWithFallback(messages);
      
      if (!result.content) {
        throw new Error('No response from AI for validation');
      }

      const validatedData = await aiClient.parseJSON<Partial<TechStackData>>(result.content);
      
      if (!validatedData) {
        throw new Error('AI validation failed');
      }

      return {
        success: true,
        data: this.validateAIResponse(validatedData),
        source: 'ai',
        provider: result.provider,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('AI validation failed:', error);
      return this.getFallbackResult(startTime);
    }
  }

  private getFallbackResult(startTime: number): AIParsingResult {
    try {
      const fallbackData = this.fallbackExtractor.extract();
      
      return {
        success: true,
        data: fallbackData,
        source: 'fallback',
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: 'Both AI and fallback parsing failed',
        source: 'fallback',
        processingTime: Date.now() - startTime
      };
    }
  }

  private validateAIResponse(data: Partial<TechStackData>): Partial<TechStackData> {
    const validated: Partial<TechStackData> = {
      personalInfo: data.personalInfo || {},
      skills: Array.isArray(data.skills) ? data.skills : [],
      education: Array.isArray(data.education) ? data.education : [],
      experience: Array.isArray(data.experience) ? data.experience : [],
      rawText: this.resumeText
    };

    if (validated.skills) {
      validated.skills = validated.skills
        .filter(skill => typeof skill === 'string' && skill.trim().length > 0)
        .map(skill => skill.trim())
        .filter((skill, index, arr) => arr.indexOf(skill) === index); // Remove duplicates
    }

    if (validated.personalInfo) {
      const personalInfo = validated.personalInfo as PersonalInfo;
      
      if (personalInfo.email && !personalInfo.email.includes('@')) {
        personalInfo.email = undefined;
      }
      
      ['linkedin', 'github', 'website'].forEach(field => {
        const url = personalInfo[field as keyof PersonalInfo] as string;
        if (url && !url.startsWith('http')) {
          (personalInfo as any)[field] = `https://${url}`;
        }
      });
    }

    return validated;
  }
}