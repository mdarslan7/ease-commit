#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const { generatePromptForCommit } = require('../src/commit/diffParser');
const { generateCommitMessage } = require('../src/api/geminiAPI'); // Updated function name
const { loadApiKey } = require('../src/config/apiKeyConfig');
const { printCommitMessage, printError } = require('../src/cli/display');

// Load the Gemini API key from environment variables or .env file
const apiKey = loadApiKey();

if (!apiKey) {
  printError("Gemini API key is not set. Please provide the API key.");
  process.exit(1);
}

// Function to parse the diff and get the commit options from the user
async function getCommitOptions() {
  const options = await inquirer.prompt([
    {
      type: 'input',
      name: 'commitType',
      message: 'What type of commit would you like to generate? (short, long, concise, creative)',
      default: 'short',
    },
    {
      type: 'confirm',
      name: 'confirmDiff',
      message: 'Do you want to add a custom commit diff? (Press Enter to skip)',
      default: false,
    },
    {
      type: 'input',
      name: 'diff',
      message: 'Please paste the commit diff:',
      when: (answers) => answers.confirmDiff,
    },
  ]);

  return options;
}

// Main function to generate and display commit messages
async function generateCommitMessageHandler() {
  try {
    // Get the commit options from the user
    const options = await getCommitOptions();

    let diff = '';
    if (options.confirmDiff) {
      diff = options.diff;
    } else {
      // Use the current Git diff (git diff --cached)
      // Ensure Git diff is fetched and stored in `diff`
      const execSync = require('child_process').execSync;
      try {
        diff = execSync('git diff --cached', { encoding: 'utf8' });
      } catch (error) {
        console.error("❌ Error fetching Git diff. Make sure you're in a Git repository and have staged changes.");
        process.exit(1);
      }
    }

    // Generate the commit message prompt
    const prompt = generatePromptForCommit(diff, options);

    // Fetch commit message from Gemini API
    const commitMessage = await generateCommitMessage(diff, null, options.commitType);

    // Display the commit message to the user
    printCommitMessage(commitMessage);

  } catch (error) {
    console.error("An error occurred while generating the commit message: " + error.message);
    process.exit(1);
  }
}

// Run the CLI tool
generateCommitMessageHandler();
