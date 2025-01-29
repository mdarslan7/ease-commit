const axios = require('axios');
const { GEMINI_API_KEY } = require('../config/apiKeyConfig');
const { promptForCommitType } = require('../cli/prompts');
const { log } = require('../cli/display');
const { generatePromptForCommit } = require('./diffParser');

// Function to generate commit messages using the Gemini API
async function generateCommitMessage(diff, options) {
  try {
    const { commitType, language = 'English' } = options;
    const prompt = generatePromptForCommit(diff, options);

    // Generate commit message using Gemini API
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
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
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GEMINI_API_KEY}`,
        },
      }
    );

    // Extract commit messages from the Gemini API response
    const commitMessages = response.data.contents[0].parts.map((part) => part.text.trim());
    return commitMessages;
  } catch (error) {
    log('Error generating commit message:', 'error');
    console.error(error);
    return [];
  }
}

// Function to generate multiple commit message suggestions
async function generateMultipleCommitSuggestions(diff, options) {
  const { numSuggestions = 3 } = options;
  const commitMessages = [];

  // Generate multiple commit suggestions
  for (let i = 0; i < numSuggestions; i++) {
    const newOptions = { ...options, numOptions: i + 1 };
    const messages = await generateCommitMessage(diff, newOptions);
    commitMessages.push(...messages);
  }

  return commitMessages;
}

// Function to generate commit message prompt based on commit type and diff
async function generateCommitMessagePrompt(diff, options) {
  const { commitType = 'short', language = 'English' } = options;

  let prompt = `Write a ${commitType} commit message in ${language} based on the following diff:\n\n${diff}\n`;

  // Add additional commit-specific context
  if (commitType === 'long') {
    prompt += '\nPlease provide a detailed explanation of the changes made.';
  } else if (commitType === 'concise') {
    prompt += '\nPlease keep the commit message short and to the point.';
  } else if (commitType === 'creative') {
    prompt += '\nPlease add a creative touch to the commit message while maintaining professionalism.';
  }

  return prompt;
}

// Function to generate the prompt for a commit message based on diff and options
function generatePromptForCommit(diff, options) {
  const { commitType = 'short', language = 'English', customMessageConvention } = options;

  let prompt = `Write a professional Git commit message in ${language} for the following diff:\n\n${diff}\n`;

  // Add commit type specific adjustments
  if (commitType) {
    prompt += `Commit type: ${commitType}\n`;
  }

  // Include custom message convention if provided
  if (customMessageConvention) {
    prompt += `Apply the following rules to the commit message: ${JSON.stringify(customMessageConvention)}\n`;
  }

  return prompt;
}

// Main function to get the appropriate commit message based on options
async function getCommitMessage(diff, options) {
  const { numOptions = 1, commitType = 'short' } = options;

  let commitMessages = await generateCommitMessage(diff, options);

  // If more than one option is requested, generate multiple options
  if (numOptions > 1) {
    commitMessages = await generateMultipleCommitSuggestions(diff, options);
  }

  // If no commit messages were generated, return an error message
  if (commitMessages.length === 0) {
    return 'Error: No commit messages generated.';
  }

  // Return the generated commit messages
  return commitMessages;
}

module.exports = {
  generateCommitMessage,
  generateMultipleCommitSuggestions,
  generateCommitMessagePrompt,
  getCommitMessage,
};
