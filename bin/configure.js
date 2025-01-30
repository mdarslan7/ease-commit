#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const os = require('os');
const yargs = require('yargs');
const { saveApiKey } = require('../src/apiKeyConfig.js');
const { printError, printSuccess } = require('../src/display.js');

const CONFIG_PATH = path.join(os.homedir(), '.ease-commit-config.json');

const resetApiKey = async () => {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH); 
      printSuccess('✅ API key has been reset successfully!');
    } else {
      printError('No existing API key found to reset.');
    }
  } catch (error) {
    printError(`Failed to reset API key: ${error.message}`);
  }
};

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

const argv = yargs
  .option('reset', {
    alias: 'r',
    type: 'boolean',
    description: 'Reset the Gemini API key',
    default: false,
  })
  .argv;

if (argv.reset) {
  resetApiKey();
} else {
  configureApiKey();
}