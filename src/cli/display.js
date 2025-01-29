const { green, red, yellow, blue } = require('colorette');

// Utility function to log messages with different colors based on severity
function log(message, level = 'info') {
  switch (level) {
    case 'success':
      console.log(green(`✔ ${message}`));
      break;
    case 'error':
      console.log(red(`✘ ${message}`));
      break;
    case 'warning':
      console.log(yellow(`⚠ ${message}`));
      break;
    case 'info':
    default:
      console.log(blue(`ℹ ${message}`));
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

// Function to print commit message
function printCommitMessage(commitMessage) {
  log(`Commit Message: ${commitMessage}`, 'info');
}

// Function to print error message
function printError(errorMessage) {
  log(`Error: ${errorMessage}`, 'error');
}

// Function to print warning message
function printWarning(warningMessage) {
  log(`Warning: ${warningMessage}`, 'warning');
}

// Exporting functions for use in other files
module.exports = {
  log,
  displayCommitSuggestions,
  displayApiKeySetupSuccess,
  displayApiKeyError,
  displayGitDiffError,
  displayConfirmation,
  printCommitMessage,
  printError,
  printWarning,
};
