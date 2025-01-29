const axios = require('axios');
const { execSync } = require('child_process');
require('dotenv').config();

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-1.5-flash';

// Helper function to get git diff of staged changes
const getGitDiff = () => {
  try {
    // Get the diff of staged changes
    const diff = execSync('git diff --cached').toString();
    
    // If there are no staged changes, get the diff of all changes
    if (!diff.trim()) {
      return execSync('git diff').toString();
    }
    
    return diff;
  } catch (error) {
    throw new Error('Failed to get git diff. Make sure you are in a git repository.');
  }
};

// Helper function to validate commit type
const validateCommitType = (commitType) => {
  const validTypes = ['concise', 'short', 'long', 'creative'];
  if (!validTypes.includes(commitType)) {
    throw new Error(`Invalid commit type. Must be one of: ${validTypes.join(', ')}`);
  }
};

// Helper function to fetch and validate the Gemini API key
const getApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please set GEMINI_API_KEY in .env or environment variable.');
  }
  return apiKey;
};

// Helper function to validate input parameters
const validateInputs = (diffs, previousCommits) => {
  if (typeof diffs !== 'string') {
    throw new Error('Diffs must be a string');
  }

  if (previousCommits && typeof previousCommits !== 'string') {
    throw new Error('Previous commits must be a string');
  }
};

// Function to generate a commit message using the Gemini API
const generateCommitMessage = async (diffs = '', previousCommits = '', commitType = 'concise') => {
  try {
    // If no diff is provided, get it from git
    const diffContent = diffs.trim() || getGitDiff();
    
    // Handle case where there are no changes at all
    if (!diffContent.trim()) {
      throw new Error('No changes detected. Please make some changes before generating a commit message.');
    }

    // Validate inputs
    validateInputs(diffContent, previousCommits);
    validateCommitType(commitType);
    const apiKey = getApiKey();

    // Format the content for the API request
    const content = {
      contents: [{
        parts: [{
          text: `Generate a ${commitType} commit message based on the following diff and previous commit messages:
            Diff: ${diffContent}
            Previous Commits: ${previousCommits}`
        }]
      }]
    };

    // Make the API request
    const response = await axios.post(
      `${GEMINI_API_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      content,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );

    // Validate and extract the response
    if (!response.data) {
      throw new Error('Empty response received from Gemini API');
    }

    if (!response.data.contents?.[0]?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    return response.data.contents[0].parts[0].text.trim();

  } catch (error) {
    // Handle specific axios errors
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please try again.');
      }
      if (error.response) {
        switch (error.response.status) {
          case 401:
            throw new Error('Invalid API key. Please check your Gemini API key.');
          case 429:
            throw new Error('Rate limit exceeded. Please try again later.');
          case 500:
            throw new Error('Gemini API server error. Please try again later.');
          default:
            throw new Error(`Gemini API error: ${error.response.status} - ${error.response.data?.error?.message || error.message}`);
        }
      }
      throw new Error(`Network error: ${error.message}`);
    }

    // Re-throw the error with the original message for known errors
    throw error;
  }
};

module.exports = {
  generateCommitMessage
};