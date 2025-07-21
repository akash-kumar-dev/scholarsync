import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG } from '../config';

export class GeminiClient {
  private client: GoogleGenerativeAI | null = null;
  private model: any = null;
  private initialized = false;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    try {
      const apiKey = AI_CONFIG.gemini.apiKey;
      
      if (!apiKey) {
        console.warn('Gemini API key not found. Gemini will be disabled.');
        return;
      }

      this.client = new GoogleGenerativeAI(apiKey);
      this.model = this.client.getGenerativeModel({ 
        model: AI_CONFIG.gemini.model,
        generationConfig: {
          temperature: AI_CONFIG.temperature,
          maxOutputTokens: AI_CONFIG.gemini.maxTokens,
        },
      });
      
      this.initialized = true;
      console.log('Gemini client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini client:', error);
      this.client = null;
      this.model = null;
      this.initialized = false;
    }
  }

  isAvailable(): boolean {
    return this.initialized && this.client !== null && this.model !== null;
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
      throw new Error('Gemini client not available');
    }

    try {
      // Convert messages to Gemini format
      const prompt = this.convertMessagesToPrompt(messages);
      
      const response = await Promise.race([
        this.model.generateContent(prompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini request timeout')), 
            options?.timeout ?? AI_CONFIG.gemini.timeout)
        )
      ]);

      const result = await response.response;
      return result.text() || null;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  private convertMessagesToPrompt(messages: Array<{ role: string; content: string }>): string {
    // Convert OpenAI-style messages to a single prompt for Gemini
    let prompt = '';
    
    for (const message of messages) {
      if (message.role === 'system') {
        prompt += `System Instructions: ${message.content}\n\n`;
      } else if (message.role === 'user') {
        prompt += `User: ${message.content}\n\n`;
      } else if (message.role === 'assistant') {
        prompt += `Assistant: ${message.content}\n\n`;
      }
    }
    
    return prompt.trim();
  }

  async parseJSON<T = any>(content: string): Promise<T | null> {
    try {
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      return JSON.parse(cleanContent);
    } catch (error) {
      console.error('Failed to parse Gemini response as JSON:', error);
      return null;
    }
  }
}