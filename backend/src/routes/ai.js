const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// POST /api/ai/chat - AI Chatbot
router.post('/chat', aiController.chat);

// POST /api/ai/categorize - Automatic Issue Categorization
router.post('/categorize', aiController.categorize);

// POST /api/ai/enhance - AI Description Enhancement
router.post('/enhance', aiController.enhanceDescription);

module.exports = router;
