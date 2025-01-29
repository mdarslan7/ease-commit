const { green, red, yellow, blue } = require('colorette');

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
      console.log(blue(`${message}`));
      break;
  }
}

function printInfo(infoMessage) {
  log(`${infoMessage}`, 'info');
}

function printCommitMessage(commitMessage) {
  log(`Commit Message: ${commitMessage}`, 'success');
}

function printError(errorMessage) {
  log(`Error: ${errorMessage}`, 'error');
}

function printWarning(warningMessage) {
  log(`Warning: ${warningMessage}`, 'warning');
}

module.exports = {
  printCommitMessage,
  printError,
  printWarning,
  printInfo
};
