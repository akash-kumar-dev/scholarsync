import { OpenAIClient } from './openai-client';
import { GeminiClient } from './gemini-client';
import { AI_CONFIG, AI_PROVIDERS, getActiveProviderConfig } from '../config';

export interface AIClientInterface {
  isAvailable(): boolean;
  createChatCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
      timeout?: number;
    }
  ): Promise<string | null>;
  parseJSON<T = any>(content: string): Promise<T | null>;
}

export class UnifiedAIClient implements AIClientInterface {
  private openaiClient: OpenAIClient;
  private geminiClient: GeminiClient;
  private activeProvider: string;

  constructor() {
    this.openaiClient = new OpenAIClient();
    this.geminiClient = new GeminiClient();
    this.activeProvider = AI_CONFIG.provider;
  }

  private getActiveClient(): AIClientInterface {
    switch (this.activeProvider) {
      case AI_PROVIDERS.OPENAI:
        return this.openaiClient;
      case AI_PROVIDERS.GEMINI:
        return this.geminiClient;
      default:
        throw new Error(`Unsupported AI provider: ${this.activeProvider}`);
    }
  }

  isAvailable(): boolean {
    try {
      const client = this.getActiveClient();
      return client.isAvailable();
    } catch (error) {
      console.error('Error checking AI client availability:', error);
      return false;
    }
  }

  async createChatCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
      timeout?: number;
    }
  ): Promise<string | null> {
    const client = this.getActiveClient();
    return client.createChatCompletion(messages, options);
  }

  async parseJSON<T = any>(content: string): Promise<T | null> {
    const client = this.getActiveClient();
    return client.parseJSON<T>(content);
  }

  getProviderInfo() {
    const config = getActiveProviderConfig();
    return {
      provider: this.activeProvider,
      model: config.model,
      available: this.isAvailable(),
    };
  }

  // Fallback mechanism
  async createChatCompletionWithFallback(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
      timeout?: number;
    }
  ): Promise<{ content: string | null; provider: string }> {
    try {
      const content = await this.createChatCompletion(messages, options);
      return { content, provider: this.activeProvider };
    } catch (error) {
      console.warn(`Primary provider (${this.activeProvider}) failed:`, error);
      
      const fallbackProvider = this.activeProvider === AI_PROVIDERS.OPENAI 
        ? AI_PROVIDERS.GEMINI 
        : AI_PROVIDERS.OPENAI;
      
      const fallbackClient = fallbackProvider === AI_PROVIDERS.OPENAI 
        ? this.openaiClient 
        : this.geminiClient;
      
      if (fallbackClient.isAvailable()) {
        try {
          console.log(`Falling back to ${fallbackProvider}`);
          const content = await fallbackClient.createChatCompletion(messages, options);
          return { content, provider: fallbackProvider };
        } catch (fallbackError) {
          console.error(`Fallback provider (${fallbackProvider}) also failed:`, fallbackError);
          throw new Error('Both AI providers failed');
        }
      } else {
        throw new Error(`Primary provider failed and fallback (${fallbackProvider}) is not available`);
      }
    }
  }
}

export const aiClient = new UnifiedAIClient();