const axios = require('axios');

// Gemini API configuration
const DEFAULT_GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com';
const DEFAULT_GEMINI_API_VERSION = 'v1beta';
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

const getGeminiApiUrl = () => {
  const configuredUrl = process.env.GEMINI_API_URL;
  if (configuredUrl) {
    return configuredUrl;
  }

  const baseUrl = (process.env.GEMINI_API_BASE_URL || DEFAULT_GEMINI_BASE_URL).replace(/\/+$/, '');
  const apiVersion = (process.env.GEMINI_API_VERSION || DEFAULT_GEMINI_API_VERSION).replace(/^\/+|\/+$/g, '');
  const model = (process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL).replace(/^models\//, '');

  return `${baseUrl}/${apiVersion}/models/${model}:generateContent`;
};

const getApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return apiKey;
};

/**
 * Call Gemini API with a prompt
 */
const callGemini = async (prompt) => {
  try {
    const apiKey = getApiKey();

    const url = new URL(getGeminiApiUrl());
    url.searchParams.set('key', apiKey);

    const response = await axios.post(
      url.toString(),
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.95,
          topK: 40,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 20000, // improvement
      }
    );

    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates.length > 0 &&
      response.data.candidates[0].content.parts.length > 0
    ) {
      return response.data.candidates[0].content.parts[0].text;
    }

    throw new Error('No response from Gemini API');
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);

    throw new Error(
      error.response?.data?.error?.message || 'Failed to generate response'
    );
  }
};

/**
 * AI Chatbot
 */
const chatWithAI = async (question) => {
  const prompt = `You are a helpful citizen assistant for an urban issue reporting system called NagarSetu. 
Your role is to help citizens understand how to report issues, what categories are available, and answer general questions about the platform.
Respond in the same language the citizen uses (English, Hindi, or their local language) and keep answers concise.

Available issue categories:
- pothole: Road damage, cracks, holes
- garbage: Waste accumulation, littering, unclean areas
- water_leak: Water pipeline leaks, standing water
- street_light: Broken or non-functional street lights
- drainage: Blocked drains, flooding
- other: Any other civic issue

When users ask about reporting:
- They need to select a category, describe the issue, provide location, and upload photos
- They earn 10 points when their issue is verified
- They earn 20 more points when the issue is resolved

Keep your responses friendly, concise, and helpful. If you don't know something, suggest contacting the municipality.

User question: ${question}

Provide a helpful response:`;

  return await callGemini(prompt);
};

/**
 * Automatic Issue Categorization
 */
const categorizeIssue = async (description) => {
  const prompt = `Analyze the following issue description and categorize it into one of these categories:
- pothole: Road damage, cracks, holes
- garbage: Waste accumulation, littering, unclean areas
- water_leak: Water pipeline leaks, standing water
- street_light: Broken or non-functional street lights
- drainage: Blocked drains, flooding
- other: Any other civic issue

Respond ONLY with a JSON object in this format:
{"category": "category_name", "confidence": 0.95}

Issue description: ${description}`;

  const response = await callGemini(prompt);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);

      return {
        category: result.category || 'other',
        confidence: result.confidence || 0.5,
      };
    }

    return { category: 'other', confidence: 0.5 };
  } catch (error) {
    console.error('Failed to parse categorization response:', error);
    return { category: 'other', confidence: 0.5 };
  }
};

/**
 * AI Description Enhancement
 */
const enhanceDescription = async (description, category = 'other') => {
  const prompt = `You are helping a citizen enhance their issue description for an urban issue reporting system.

Original category: ${category}
Original description: ${description}

Improve the description to make it more clear, detailed, and actionable for municipal workers. 
Keep it under 300 characters. Maintain the original meaning but make it more professional and informative.

Respond ONLY with the enhanced description, no additional text:`;

  const response = await callGemini(prompt);
  return response.trim();
};

module.exports = {
  chatWithAI,
  categorizeIssue,
  enhanceDescription,
};
