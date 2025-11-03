const express = require('express');
const router = express.Router();
const axios = require('axios');

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

// @route   POST /api/ml/analyze
// @desc    Analyze issue description and get ML recommendations
// @access  Public (can be protected with auth later)
router.post('/analyze', async (req, res) => {
  try {
    const { description, category, location } = req.body;

    // Validation
    if (!description || description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Description must be at least 10 characters',
      });
    }

    console.log(`ML Analysis requested for: "${description.substring(0, 50)}..."`);

    // Call Python ML service
    const response = await axios.post(
      `${ML_API_URL}/api/ml/recommend`,
      {
        description: description.trim(),
        category: category || null,
        location: location || null,
      },
      {
        timeout: 5000, // 5 second timeout
      }
    );

    console.log(`ML Analysis result: confidence=${response.data.confidence}, fallback=${response.data.fallback}`);

    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error('ML API error:', error.message);
    
    // Graceful fallback - don't fail the request
    // Frontend will use its own logic
    res.json({
      success: false,
      message: 'ML service unavailable, using fallback',
      data: {
        confidence: 'low',
        fallback: true,
        error: error.message,
      },
    });
  }
});

// @route   GET /api/ml/health
// @desc    Check ML service health
// @access  Public
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${ML_API_URL}/api/ml/health`, {
      timeout: 2000,
    });

    res.json({
      success: true,
      ml_service: response.data,
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'ML service is offline',
      ml_service: { 
        status: 'offline',
        error: error.message 
      },
    });
  }
});

module.exports = router;

