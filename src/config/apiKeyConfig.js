const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from a .env file if it exists
dotenv.config();

// Retrieve the API key from environment variables
const getApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY || null;
  if (!apiKey) {
    console.error('❌ Error: Gemini API key not found. Please configure it.');
    console.error('You can set the API key in one of the following ways:');
    console.error('1. Export it in your shell: export GEMINI_API_KEY="your_api_key"');
    console.error('2. Add it to your .env file: GEMINI_API_KEY=your_api_key');
    console.error('3. Use the CLI to set it up interactively.');
    process.exit(1);
  }
  return apiKey;
};

// Load the API key and return it explicitly
const loadApiKey = () => {
  const apiKey = getApiKey();
  console.log('✅ Gemini API key successfully loaded.');
  return apiKey;
};

// Save the API key to a `.env` file
const saveApiKeyToEnv = (apiKey) => {
  const envPath = path.resolve(process.cwd(), '.env');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  }

  if (!envContent.includes('GEMINI_API_KEY')) {
    envContent += `\nGEMINI_API_KEY=${apiKey}\n`;
  } else {
    envContent = envContent.replace(/GEMINI_API_KEY=.*/, `GEMINI_API_KEY=${apiKey}`);
  }

  fs.writeFileSync(envPath, envContent.trim());
  console.log('✅ Gemini API key saved to .env file.');
};

module.exports = { getApiKey, saveApiKeyToEnv, loadApiKey };
