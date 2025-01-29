const chalk = require('chalk');

// Utility function to log messages with different colors based on severity
function log(message, level = 'info') {
  switch (level) {
    case 'success':
      console.log(chalk.green(`✔ ${message}`));
      break;
    case 'error':
      console.log(chalk.red(`✘ ${message}`));
      break;
    case 'warning':
      console.log(chalk.yellow(`⚠ ${message}`));
      break;
    case 'info':
    default:
      console.log(chalk.blue(`ℹ ${message}`));
      break;
  }
}

// Function to display commit suggestions
function displayCommitSuggestions(commitMessages) {
  if (commitMessages.length === 1) {
    log(`Generated commit message: ${commitMessages[0]}`, 'success');
  } else {
    log('Generated commit suggestions:', 'success');
    commitMessages.forEach((msg, index) => {
      log(`${index + 1}: ${msg}`, 'info');
    });
  }
}

// Function to prompt for API key setup success
function displayApiKeySetupSuccess() {
  log('Gemini API key has been saved successfully!', 'success');
}

// Function to prompt for errors related to API key
function displayApiKeyError() {
  log('Error: Missing or invalid Gemini API key.', 'error');
}

// Function to prompt for missing git diff
function displayGitDiffError() {
  log('No git diff found. Please make sure you have changes staged for commit.', 'error');
}

// Function to confirm actions
function displayConfirmation(message) {
  log(message, 'info');
}

// Exporting functions for use in other files
module.exports = {
  log,
  displayCommitSuggestions,
  displayApiKeySetupSuccess,
  displayApiKeyError,
  displayGitDiffError,
  displayConfirmation,
};
