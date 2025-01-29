#!/usr/bin/env node

const inquirer = require('inquirer');
const { execSync } = require('child_process');
const { generatePromptForCommit } = require('../src/commit/diffParser');
const { generateCommitMessage } = require('../src/api/geminiAPI');
const { loadApiKey } = require('../src/config/apiKeyConfig');
const { printCommitMessage, printError, printWarning } = require('../src/cli/display.js');

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
    
    const unstagedDiff = execSync('git diff', { encoding: 'utf8' });
    
    if (unstagedDiff.trim()) {
      printWarning('No staged changes found. Using unstaged changes instead.');
      return unstagedDiff;
    }
    
    throw new Error('No changes detected. Please make some changes before generating a commit message.');
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
      printError('Gemini API key is not set. Please set the GEMINI_API_KEY environment variable.');
      process.exit(1);
    }

    const options = await getCommitOptions();

    const diff = options.confirmDiff ? options.diff : await getGitDiff();

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