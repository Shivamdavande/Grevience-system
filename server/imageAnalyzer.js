// imageAnalyzer.js - helper to analyze images via external AI service with graceful fallback

const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Analyze an image file using the external AI service.
 * Returns an object containing at least a `description` field.
 * Falls back to a simple placeholder description based on the filename when the AI service is unavailable.
 *
 * @param {string} filePath - Absolute path to the image file on disk.
 * @param {string} originalName - Original filename (including extension) as uploaded by the client.
 * @returns {Promise<Object>} - AI response or fallback data.
 */
async function analyzeImage(filePath, originalName) {
  // Build multipart/form-data payload
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));

  try {
    const response = await axios.post(`${AI_SERVICE_URL}/analyze-image`, formData, {
      headers: formData.getHeaders(),
      timeout: 60000, // 60 seconds timeout for heavy AI models
    });
    // Return whatever the AI service provides (expected fields: description, category, priority, confidence)
    return response.data;
  } catch (err) {
    console.error('⚠️ Image analysis via AI service failed:', err.message);
    // Fallback: use an empty string as description and generic metadata
    return {
      description: '',
      category: 'Others',
      priority: 'Low',
      confidence: 0,
    };
  }
}

module.exports = {
  analyzeImage,
};
