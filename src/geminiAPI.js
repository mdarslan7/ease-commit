const axios = require('axios');
const { execSync } = require('child_process');
require('dotenv').config();

const API_CONFIG = {
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
  MODEL: 'gemini-1.0-pro',  
  TIMEOUT: 30000, 
};

/**
 * Fetch recent commit messages from Git history
 * @param {number} count - Number of recent commits to fetch
 * @returns {string} Concatenated commit messages
 */
const getRecentCommits = (count = 5) => {
  try {
    const result = execSync(`git log --oneline --max-count=${count}`).toString();
    return result.split('\n').join(' ').trim();  // Return all recent commits in a single string
  } catch (error) {
    console.error('Error fetching Git history:', error.message);
    return '';
  }
};

/**
 * Create the API request payload
 * @param {string} diffContent - Git diff content
 * @param {string} commitType - Type of commit message
 * @param {string} recentCommits - Recent commit messages (context)
 * @returns {Object} Formatted request payload
 */
const createRequestPayload = (diffContent, commitType, recentCommits) => ({
  contents: [{
    parts: [{
      text: `
        Generate a ${commitType} commit message for these changes. The message should be in present tense, start with a verb, and clearly describe what the changes do. Focus on the specifics of what was changed (e.g., added new tests, fixed bug in user login, removed unnecessary code, updated variable names, etc.) and why. Ensure that the message accurately reflects the changes made, such as modifying or deleting comments rather than removing actual code.

        Git Diff:
        ${diffContent}

        Recent Commits (for reference only, do not directly influence message content):
        ${recentCommits}

        Instructions:
        - If a custom diff was provided, prioritize that for generating the commit message.
        - If no custom diff is provided, focus on the actual changes made in the code.
        - The recent commit messages are provided for reference to ensure alignment with the project's style and tone, but they should not directly influence the content of the new commit message.
        - Use present tense (e.g., "fix" instead of "fixed").
        - Start with a lowercase verb.
        - Be specific and clear. Focus on WHAT changed (e.g., fixed a bug, refactored code, updated documentation) and WHY it was necessary.
        - Avoid generic terms like "tool" or "feature" without context. Instead, specify what part of the code was affected.
        - Ensure that the commit message reflects the actual changes (e.g., if only comments were modified, do not suggest code removal).
        - Avoid vague terms like "updated" or "improved" without explaining what was updated or improved.
        - Make sure the message is concise, actionable, and meaningful.
        - Do not use bullet points or quotes.
        - Avoid using the word "commit" in the message.
      `
    }]
  }],
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  }
});

/**
 * Generate a commit message using the Gemini API
 * @param {string} diffs - Git diff content
 * @param {string} [commitType='short'] - Type of commit message
 * @returns {Promise<string>} Generated commit message
 */
const generateCommitMessage = async (diffs = '', commitType = 'short') => {
  try {
    commitType = commitType || 'short';
    // Fetch recent commit history
    const recentCommits = getRecentCommits(5);

    // Input validation
    if (!diffs || typeof diffs !== 'string') {
      throw new Error('Invalid diff content provided');
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
  
    // Create request payload with Git diff and recent commit history
    const requestPayload = createRequestPayload(diffs, commitType, recentCommits);

    // Log the request payload (prompt) for debugging
    console.log('Request Payload (Prompt):');
    console.log(JSON.stringify(requestPayload, null, 2));

    // Make API request
    console.log('Sending request to Gemini API...'); // Debug log
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/models/${API_CONFIG.MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      requestPayload,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: API_CONFIG.TIMEOUT
      }
    );

    // Debug logging
    console.log('Response received from Gemini API'); // Debug log
    
    // Validate response structure
    if (!response.data) {
      throw new Error('Empty response received from Gemini API');
    }

    // Access the generated text safely
    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No valid text generated in API response');
    }

    // Clean up the generated message
    return generatedText
      .trim()
      .replace(/^["']|["']$/g, '') // Remove quotes if present
      .replace(/^commit: /i, '')    // Remove 'commit:' prefix if present
      .replace(/\n+/g, ' ')         // Replace multiple newlines with space
      .trim();

  } catch (error) {
    // Enhanced error handling
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request to Gemini API timed out. Please try again.');
      }
      
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.error?.message || error.message;
        
        // Log the full error response for debugging
        console.error('Full API Error Response:', JSON.stringify(error.response.data, null, 2));
        
        switch (status) {
          case 400:
            throw new Error(`Invalid request: ${errorMessage}`);
          case 401:
            throw new Error('Invalid API key. Please check your GEMINI_API_KEY.');
          case 429:
            throw new Error('Rate limit exceeded. Please try again later.');
          case 500:
            throw new Error('Gemini API server error. Please try again later.');
          default:
            throw new Error(`API error (${status}): ${errorMessage}`);
        }
      }
      
      throw new Error(`Network error: ${error.message}`);
    }
    
    // Re-throw other errors with context
    throw new Error(`Failed to generate commit message: ${error.message}`);
  }
};

module.exports = {
  generateCommitMessage
};