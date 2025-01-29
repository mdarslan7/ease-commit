// Function to parse the diff and format it for the API
function parseDiff(diff) {
    // Remove any unwanted lines or formatting (e.g., Git diff metadata)
    const lines = diff.split('\n');
  
    // Filter out lines that don't contain actual code changes
    const filteredLines = lines.filter(line => !line.startsWith('---') && !line.startsWith('+++') && !line.startsWith('@@'));
  
    // Join the filtered lines back together to send to the Gemini API
    return filteredLines.join('\n');
  }
  
  // Function to generate a commit message prompt based on the diff and options
  function generatePromptForCommit(diff, options) {
    const { commitType = 'short', language = 'English', customMessageConvention } = options;
  
    // Parse and clean the diff
    const parsedDiff = parseDiff(diff);
  
    // Generate the base commit message prompt
    let prompt = `Write a professional Git commit message in ${language} for the following diff:\n\n${parsedDiff}\n`;
  
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
  
  // Function to prepare and send the diff data to the API for commit message generation
  async function parseAndGenerateCommit(diff, options) {
    // Clean and prepare the diff data
    const formattedDiff = parseDiff(diff);
  
    // Generate commit message prompt
    const prompt = generatePromptForCommit(formattedDiff, options);
  
    return prompt;
  }
  
  module.exports = {
    parseDiff,
    generatePromptForCommit,
    parseAndGenerateCommit,
  };
  