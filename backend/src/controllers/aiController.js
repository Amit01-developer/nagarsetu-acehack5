const geminiService = require('../services/geminiService');

/**
 * POST /api/ai/chat
 * AI Chatbot - Answer citizen questions
 */
const chat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const response = await geminiService.chatWithAI(message);

    res.json({
      success: true,
      data: {
        response,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/categorize
 * Automatic Issue Categorization
 */
const categorize = async (req, res, next) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required',
      });
    }

    const result = await geminiService.categorizeIssue(description);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/enhance
 * AI Description Enhancement
 */
const enhanceDescription = async (req, res, next) => {
  try {
    const { description, category } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required',
      });
    }

    const enhanced = await geminiService.enhanceDescription(description, category);

    res.json({
      success: true,
      data: {
        enhanced,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chat,
  categorize,
  enhanceDescription,
};
