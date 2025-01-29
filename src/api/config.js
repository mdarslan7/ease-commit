require('dotenv').config(); // Loads environment variables from .env file

// Function to load the Gemini API key from environment variables
const getGeminiApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: Gemini API key is missing. Please set GEMINI_API_KEY in .env or as an environment variable.');
    process.exit(1); // Exit the process if API key is not provided
  }
  return apiKey;
};

// Default options for commit messages
const defaultCommitOptions = {
  commitTypes: ['short', 'long', 'concise', 'creative'],
  defaultCommitType: 'concise', // Default commit type if none is provided
  numOptions: 3,               // Number of commit message suggestions to return
  language: 'English',         // Language for generating commit messages
};

// Function to load commit options (could be customized based on user input or config file)
const getCommitOptions = () => {
  return defaultCommitOptions;
};

module.exports = {
  getGeminiApiKey,
  getCommitOptions
};
