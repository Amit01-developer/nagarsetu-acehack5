import api from './axiosConfig';

interface ChatResponse {
  success: boolean;
  data: {
    response: string;
  };
}

interface CategorizeResponse {
  success: boolean;
  data: {
    category: string;
    confidence: number;
  };
}

interface EnhanceResponse {
  success: boolean;
  data: {
    enhanced: string;
  };
}

/**
 * AI Chatbot - Send a message and get AI response
 */
export const chatWithAI = async (message: string): Promise<ChatResponse> => {
  const response = await api.post<ChatResponse>('/ai/chat', { message });
  return response.data;
};

/**
 * Automatic Issue Categorization - Categorize issue based on description
 */
export const categorizeIssue = async (description: string): Promise<CategorizeResponse> => {
  const response = await api.post<CategorizeResponse>('/ai/categorize', { description });
  return response.data;
};

/**
 * AI Description Enhancement - Enhance issue description
 */
export const enhanceDescription = async (description: string, category?: string): Promise<EnhanceResponse> => {
  const response = await api.post<EnhanceResponse>('/ai/enhance', { description, category });
  return response.data;
};
