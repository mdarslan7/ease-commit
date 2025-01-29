// Constants for diff parsing
const DIFF_MARKERS = {
  OLD_FILE: '---',
  NEW_FILE: '+++',
  CHUNK_HEADER: '@@',
};

/**
 * Parses a Git diff and removes metadata while preserving essential change information
 * @param {string} diff - Raw Git diff content
 * @returns {string} Cleaned diff content
 */
function parseDiff(diff) {
  if (!diff || typeof diff !== 'string') {
    throw new Error('Invalid diff input: diff must be a non-empty string');
  }

  const lines = diff.split('\n');
  
  // Filter out metadata while preserving file paths and changes
  return lines
    .filter(line => {
      // Keep lines that show actual changes
      const isMetadata = Object.values(DIFF_MARKERS).some(marker => 
        line.startsWith(marker)
      );
      return !isMetadata;
    })
    .join('\n')
    .trim();
}

/**
 * Generates a commit message prompt based on the diff and provided options
 * @param {string} diff - Git diff content
 * @param {Object} options - Configuration options
 * @param {string} [options.commitType='short'] - Type of commit message
 * @param {string} [options.language='English'] - Language for the commit message
 * @param {Object} [options.customMessageConvention] - Custom commit message rules
 * @returns {string} Formatted prompt for the API
 */
function generatePromptForCommit(diff, options = {}) {
  if (!diff) {
    throw new Error('Diff content is required');
  }

  const {
    commitType = 'short',
    language = 'English',
    customMessageConvention
  } = options;

  // Parse and clean the diff
  const parsedDiff = parseDiff(diff);

  // Build the prompt with template literals for better readability
  let prompt = `Write a professional Git commit message in ${language} for the following changes:\n\n${parsedDiff}\n`;

  // Add commit type instructions
  if (commitType) {
    const typeInstructions = {
      short: 'Keep the message concise and under 50 characters.',
      long: 'Provide a detailed explanation of the changes made, including the reason behind the change.',
      concise: 'Focus on the key changes only and make the message as brief as possible.',
      creative: 'Write an engaging but professional message that captures the essence of the changes.'
    };

    prompt += `\nCommit Type: ${commitType}\n`;
    prompt += typeInstructions[commitType] ? `Instructions: ${typeInstructions[commitType]}\n` : '';
  }

  // Add custom convention if provided
  if (customMessageConvention) {
    prompt += `\nApply these commit message rules:\n${JSON.stringify(customMessageConvention, null, 2)}\n`;
  }

  return prompt.trim();
}

/**
 * Prepares and formats diff data for API consumption
 * @param {string} diff - Raw diff content
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} Formatted prompt
 */
async function parseAndGenerateCommit(diff, options = {}) {
  try {
    const formattedDiff = parseDiff(diff);
    return generatePromptForCommit(formattedDiff, options);
  } catch (error) {
    throw new Error(`Failed to parse diff: ${error.message}`);
  }
}

module.exports = {
  parseDiff,
  generatePromptForCommit,
  parseAndGenerateCommit,
};