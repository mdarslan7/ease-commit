#!/usr/bin/env node

const inquirer = require('inquirer');
const { execSync } = require('child_process');
const { generatePromptForCommit } = require('../src/commit/diffParser');
const { generateCommitMessage } = require('../src/api/geminiAPI');
const { loadApiKey } = require('../src/config/apiKeyConfig');
const { printCommitMessage, printError, printWarning, printInfo } = require('../src/cli/display.js');

const COMMIT_TYPES = ['short', 'long', 'concise', 'creative'];
const DEFAULT_COMMIT_TYPE = 'short';

function isGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { encoding: 'utf8', stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getGitDiff() {
  try {
    const stagedDiff = execSync('git diff --cached', { encoding: 'utf8' });

    if (stagedDiff.trim()) {
      return stagedDiff;
    }

    // If no staged changes are found, return null
    return null;

  } catch (error) {
    if (!isGitRepository()) {
      throw new Error('Not a git repository. Please run this command inside a git repository.');
    }
    throw error;
  }
}

async function getCommitOptions() {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'commitType',
      message: 'What type of commit message would you like to generate?',
      choices: COMMIT_TYPES,
      default: DEFAULT_COMMIT_TYPE,
    },
    {
      type: 'confirm',
      name: 'confirmDiff',
      message: 'Do you want to provide a custom diff? (Default: use git diff)',
      default: false,
    },
    {
      type: 'editor',
      name: 'diff',
      message: 'Please provide the diff content:',
      when: (answers) => answers.confirmDiff,
      validate: (input) => {
        if (!input.trim()) {
          return 'Diff content cannot be empty';
        }
        return true;
      },
    },
  ]);
}

async function generateCommitMessageHandler() {
  try {
    // Verify API key first
    const apiKey = loadApiKey();
    if (!apiKey) {
      printError('Gemini API key is not set. Please configure the GEMINI_API_KEY environment variable.');

      // Instructions for setting the GEMINI_API_KEY based on OS and .env setup
      printWarning('To configure the GEMINI_API_KEY environment variable, you can follow one of these methods:');

      // For Windows
      if (process.platform === 'win32') {
        printInfo('1. For Command Prompt, run:');
        printInfo('   set GEMINI_API_KEY="your_api_key"');
        printInfo('2. For PowerShell, run:');
        printInfo('   $env:GEMINI_API_KEY="your_api_key"');
        printInfo('Alternatively, set it permanently using "setx GEMINI_API_KEY" or in the System Properties.');

      // For macOS/Linux
      } else if (process.platform === 'darwin' || process.platform === 'linux') {
        printInfo('1. For temporary session use, run:');
        printInfo('   export GEMINI_API_KEY="your_api_key"');
        printInfo('2. For permanent use, add the following line to your shell profile (~/.bashrc or ~/.bash_profile):');
        printInfo('   export GEMINI_API_KEY="your_api_key"');
        printInfo('   Then run:');
        printInfo('   source ~/.bashrc (Linux) or source ~/.zshrc (macOS)');
        
        // .env File Option
        printInfo('3. Alternatively, create a .env file in your project directory with this content:');
        printInfo('   GEMINI_API_KEY="your_api_key"');
        printInfo('   Then, install dotenv to load the variable:');
        printInfo('   npm install dotenv');
        printInfo('   In your JavaScript file, require dotenv at the top:');
        printInfo('   require("dotenv").config();');
      } else {
        printInfo('Unknown platform. Please configure the GEMINI_API_KEY manually.');
      }

      // Provide guidance for interactive CLI setup
      printInfo('\nAlternatively, you can set up the API key interactively using the CLI:');
      printInfo('Run `easy-commit configure` and follow the prompts to set the API key.');

      process.exit(1); // Stop execution if API key is not found
    }

    // First, check for staged changes
    const stagedDiff = await getGitDiff();

    if (!stagedDiff) {
      const { stageChanges } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'stageChanges',
          message: 'No staged changes found. Would you like to stage all changes before generating a commit message?',
          default: true,
        },
      ]);

      if (stageChanges) {
        console.log('Staging all changes...');
        execSync('git add .', { stdio: 'inherit' });
        console.log('✅ All changes have been staged.');
      } else {
        throw new Error('No staged changes detected. Please stage changes before generating a commit message.');
      }
    }

    const options = await getCommitOptions();

    // Use staged diff if user does not want to provide custom diff
    const diff = options.confirmDiff ? options.diff : stagedDiff;

    const prompt = generatePromptForCommit(diff, options);
    if (!prompt.trim()) {
      throw new Error('Failed to generate prompt from diff');
    }

    const commitMessage = await generateCommitMessage(diff, options.commitType);
    
    printCommitMessage(commitMessage);

    const { applyCommit } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'applyCommit',
        message: 'Would you like to use this commit message?',
        default: true,
      },
    ]);

    if (applyCommit) {
      try {
        execSync('git commit -m ' + JSON.stringify(commitMessage), { stdio: 'inherit' });
        console.log('✅ Commit message applied successfully!');
      } catch (error) {
        printError('Failed to apply commit message. You can still copy and use it manually.');
      }
    }

  } catch (error) {
    printError(`Error: ${error.message}`);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log('\n\nOperation cancelled by user');
  process.exit(0);
});

generateCommitMessageHandler().catch((error) => {
  printError(`Unexpected error: ${error.message}`);
  process.exit(1);
});