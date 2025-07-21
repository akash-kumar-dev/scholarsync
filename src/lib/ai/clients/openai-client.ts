import OpenAI from 'openai';
import { AI_CONFIG } from '../config';

export class OpenAIClient {
  private client: OpenAI | null = null;
  private initialized = false;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    try {
      const apiKey = AI_CONFIG.openai.apiKey;
      
      if (!apiKey) {
        console.warn('OpenAI API key not found. OpenAI will be disabled.');
        return;
      }

      this.client = new OpenAI({
        apiKey: apiKey,
        baseURL: AI_CONFIG.openai.baseURL,
      });
      
      this.initialized = true;
      console.log('OpenAI client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error);
      this.client = null;
      this.initialized = false;
    }
  }

  isAvailable(): boolean {
    return this.initialized && this.client !== null;
  }

  async createChatCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
      timeout?: number;
    }
  ): Promise<string | null> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI client not available');
    }

    try {
      const response = await Promise.race([
        this.client!.chat.completions.create({
          model: AI_CONFIG.openai.model,
          messages,
          temperature: options?.temperature ?? AI_CONFIG.temperature,
          max_tokens: options?.maxTokens ?? AI_CONFIG.openai.maxTokens,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('OpenAI request timeout')), 
            options?.timeout ?? AI_CONFIG.openai.timeout)
        )
      ]);

      return response.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async parseJSON<T = any>(content: string): Promise<T | null> {
    try {
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      return JSON.parse(cleanContent);
    } catch (error) {
      console.error('Failed to parse OpenAI response as JSON:', error);
      return null;
    }
  }
}