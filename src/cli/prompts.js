const inquirer = require('inquirer');
const { log } = require('./display');

// Function to prompt for setting the Gemini API key
async function promptForApiKey() {
  log('Please enter your Gemini API key.', 'info');

  const { apiKey } = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiKey',
      message: 'Gemini API Key:',
      validate(input) {
        if (input.trim() === '') {
          return 'API key cannot be empty.';
        }
        return true;
      },
    },
  ]);

  return apiKey;
}

// Function to confirm commit type selection (e.g., short, long, concise, creative)
async function promptForCommitType() {
  const { commitType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'commitType',
      message: 'Select the commit message style:',
      choices: [
        { name: 'Short', value: 'short' },
        { name: 'Long', value: 'long' },
        { name: 'Concise', value: 'concise' },
        { name: 'Creative', value: 'creative' },
      ],
    },
  ]);

  return commitType;
}

// Function to ask the user if they want to proceed with a particular commit message
async function promptToConfirmCommit(commitMessage) {
  const { confirmCommit } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmCommit',
      message: `Do you want to use the following commit message?\n\n${commitMessage}`,
      default: true,
    },
  ]);

  return confirmCommit;
}

// Function to confirm multiple commit suggestions
async function promptForMultipleCommitSelection(commitMessages) {
  const { selectedCommit } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedCommit',
      message: 'Select the commit message you want to use:',
      choices: commitMessages.map((msg, index) => ({
        name: `${index + 1}: ${msg}`,
        value: msg,
      })),
    },
  ]);

  return selectedCommit;
}

// Function to ask the user if they want to generate more commit suggestions
async function promptForMoreSuggestions() {
  const { moreSuggestions } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'moreSuggestions',
      message: 'Do you want to generate more commit suggestions?',
      default: false,
    },
  ]);

  return moreSuggestions;
}

// Function to ask the user if they want to set up their API key (for first-time setup)
async function promptForApiKeySetup() {
  const { setupApiKey } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'setupApiKey',
      message: 'You need to set up your Gemini API key. Do you want to set it up now?',
      default: true,
    },
  ]);

  return setupApiKey;
}

module.exports = {
  promptForApiKey,
  promptForCommitType,
  promptToConfirmCommit,
  promptForMultipleCommitSelection,
  promptForMoreSuggestions,
  promptForApiKeySetup,
};
