const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const loadApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY || null;
  if (apiKey) 
    console.log('✅ Gemini API key is set and loaded successfully.');
  return apiKey;
};

module.exports = { loadApiKey };