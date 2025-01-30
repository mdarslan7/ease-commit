#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const os = require('os');
const yargs = require('yargs');
const { saveApiKey } = require('../src/apiKeyConfig.js');
const { printError, printSuccess } = require('../src/display.js');

// Define the path where the API key is stored
const CONFIG_PATH = path.join(os.homedir(), '.easy-commit-config.json');

// Function to delete the API key (reset it)
const resetApiKey = async () => {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH); // Delete the config file containing the API key
      printSuccess('✅ API key has been reset successfully!');
    } else {
      printError('No existing API key found to reset.');
    }
  } catch (error) {
    printError(`Failed to reset API key: ${error.message}`);
  }
};

// Function to configure (save) the API key
const configureApiKey = async () => {
  try {
    const { apiKey } = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter your Gemini API key:',
        validate: (input) => input.trim() ? true : 'API key cannot be empty',
      },
    ]);

    saveApiKey(apiKey);
    printSuccess('✅ Gemini API key saved successfully!');
  } catch (error) {
    printError(`Failed to configure API key: ${error.message}`);
    process.exit(1);
  }
};

// Parse command line arguments using yargs
const argv = yargs
  .option('reset', {
    alias: 'r',
    type: 'boolean',
    description: 'Reset the Gemini API key',
    default: false,
  })
  .argv;

// Run the reset logic if --reset or -r is passed
if (argv.reset) {
  resetApiKey();
} else {
  // If no reset flag, run the configuration process
  configureApiKey();
}