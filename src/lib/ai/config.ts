export const AI_PROVIDERS = {
  OPENAI: 'openai',
  GEMINI: 'gemini',
} as const;

export type AIProvider = typeof AI_PROVIDERS[keyof typeof AI_PROVIDERS];

export const AI_CONFIG = {
  // Global AI settings
  provider: (process.env.AI_PROVIDER as AIProvider) || AI_PROVIDERS.GEMINI,
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1500'),
  timeout: parseInt(process.env.AI_TIMEOUT || '10000'),
  temperature: 0.1,
  retryAttempts: 2,
  fallbackDelay: 5000,
  
  // OpenAI specific settings
  openai: {
    model: process.env.OPENAI_MODEL || 'gpt-4',
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1500'),
    timeout: parseInt(process.env.OPENAI_TIMEOUT || '10000'),
  },
  
  // Gemini specific settings
  gemini: {
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
    apiKey: process.env.GEMINI_API_KEY,
    maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '1500'),
    timeout: parseInt(process.env.GEMINI_TIMEOUT || '10000'),
  }
};

export const AI_ENDPOINTS = {
  openai: {
    chat: '/v1/chat/completions',
  },
  gemini: {
    generateContent: '/v1/models/{model}:generateContent',
  }
} as const;

export function validateAIConfig(): boolean {
  const provider = AI_CONFIG.provider;
  
  if (provider === AI_PROVIDERS.OPENAI) {
    return !!AI_CONFIG.openai.apiKey;
  } else if (provider === AI_PROVIDERS.GEMINI) {
    return !!AI_CONFIG.gemini.apiKey;
  }
  
  return false;
}

export function getActiveProviderConfig() {
  const provider = AI_CONFIG.provider;
  
  if (provider === AI_PROVIDERS.OPENAI) {
    return {
      provider: AI_PROVIDERS.OPENAI,
      ...AI_CONFIG.openai,
      temperature: AI_CONFIG.temperature,
      retryAttempts: AI_CONFIG.retryAttempts,
    };
  } else if (provider === AI_PROVIDERS.GEMINI) {
    return {
      provider: AI_PROVIDERS.GEMINI,
      ...AI_CONFIG.gemini,
      temperature: AI_CONFIG.temperature,
      retryAttempts: AI_CONFIG.retryAttempts,
    };
  }
  
  throw new Error(`Unsupported AI provider: ${provider}`);
}