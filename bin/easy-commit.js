#!/usr/bin/env node

const inquirer = require('inquirer');
const { execSync } = require('child_process');
const { parseDiff } = require('../src/diffParser.js');
const { generateCommitMessage } = require('../src/geminiAPI.js');
const { loadApiKey } = require('../src/apiKeyConfig.js');
const { printCommitMessage, printError, printWarning, printInfo } = require('../src/display.js');

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
    if (!isGitRepository()) {
      throw new Error('Not a git repository. Please run this command inside a git repository.');
    }

    const execOptions = { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 }; // Increase buffer size

    // Check if there are any staged changes
    const stagedFiles = execSync('git diff --cached --name-only', execOptions).trim();
    if (!stagedFiles) {
      return null; // No staged changes
    }

    // Get full staged diff (including whitespace changes)
    const fullDiff = execSync('git diff --cached', execOptions).trim();

    // Get diff ignoring only whitespace
    const diffWithoutWhitespace = execSync('git diff --cached --ignore-all-space', execOptions).trim();

    // Edge Case: Only whitespace changes detected
    if (!diffWithoutWhitespace && fullDiff) {
      return 'Only whitespace changes detected:\n' + fullDiff;
    }

    // Edge Case: Empty files added or deleted
    const stagedFilesStatus = execSync('git diff --cached --name-status', execOptions).trim();
    const emptyFileChanges = stagedFilesStatus.split('\n').filter(line => {
      const [status, file] = line.split('\t');
      if (!file || !status) return false;
      
      try {
        if (status === 'A') {
          // For new files, check if they're empty
          const fileContent = execSync(`git cat-file -p :${file}`, execOptions).trim();
          return !fileContent;
        } else if (status === 'D') {
          // For deleted files, check if they were empty in HEAD
          try {
            const fileContent = execSync(`git cat-file -p HEAD:${file}`, execOptions).trim();
            return !fileContent;
          } catch (e) {
            // File might not exist in HEAD
            return false;
          }
        }
        return false;
      } catch (e) {
        return false; // Skip if there's an error reading the file
      }
    });

    if (emptyFileChanges.length) {
      return 'Empty files added or removed:\n' + emptyFileChanges.join('\n');
    }

    // Edge Case: File renames or moves
    const renameChanges = execSync('git diff --cached -M --name-status --diff-filter=R', execOptions).trim();
    if (renameChanges) {
      return 'File renames/moves detected:\n' + renameChanges;
    }

    // Edge Case: File permission changes - Fixed to handle no permission changes
    try {
      const permissionChanges = execSync('git diff --cached --summary', execOptions)
        .trim()
        .split('\n')
        .filter(line => line.includes('mode change'))
        .join('\n');

      if (permissionChanges) {
        return 'File permission changes detected:\n' + permissionChanges;
      }
    } catch (e) {
      // Ignore permission check errors
    }

    // Edge Case: Binary file changes
    const binaryChanges = execSync('git diff --cached --numstat', execOptions).trim();
    const binaryFiles = binaryChanges.split('\n').filter(line => {
      const [added, deleted, file] = line.split('\t');
      return file && (!added || !deleted || added === '-' || deleted === '-');
    });

    if (binaryFiles.length) {
      return 'Binary file changes detected:\n' + binaryFiles.join('\n');
    }

    // Edge Case: Merge conflict resolutions
    const mergeConflicts = execSync('git diff --cached --check', execOptions).trim();
    if (mergeConflicts.includes('conflict')) {
      return 'Merge conflict resolutions detected:\n' + mergeConflicts;
    }

    // Return full diff for normal changes
    return fullDiff || null;
  } catch (error) {
    throw new Error(`Error getting staged diff: ${error.message}`);
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
        console.log('   export GEMINI_API_KEY="your_api_key"');

        printInfo('\n \n2. For permanent use, add the following line to your shell profile (~/.bashrc or ~/.bash_profile):');
        console.log('   export GEMINI_API_KEY="your_api_key"');
        console.log('   Then run:');
        console.log('   source ~/.bashrc (Linux) or source ~/.zshrc (macOS)');
        
        // .env File Option
        printInfo('\n \n3. Alternatively, create a .env file in your project directory with this content:');
        console.log('   GEMINI_API_KEY="your_api_key"');
        console.log('   Then, install dotenv to load the variable:');
        console.log('   npm install dotenv');
        console.log('   In your JavaScript file, require dotenv at the top:');
        console.log('   require("dotenv").config();');
      } else {
        printInfo('Unknown platform. Please configure the GEMINI_API_KEY manually.');
      }

      // Provide guidance for interactive CLI setup
      console.log('\n \nAlternatively, you can set up the API key interactively using the CLI:');
      printInfo('Run `easy-commit configure` and follow the prompts to set the API key.');

      process.exit(1); // Stop execution if API key is not found
    }

    // First, check for staged changes
    const stagedDiff = await getGitDiff();

    if (!stagedDiff) {
      printError('No changes staged. Please stage your changes using `git add .` before generating a commit message.');
      process.exit(1); // Stop the process if no changes are staged
    }

    const options = await getCommitOptions();

    // Use staged diff if user does not want to provide custom diff
    const diff = options.confirmDiff ? options.diff : stagedDiff;

    // console.log(diff);

    const parsedDiff = parseDiff(diff)

    console.log(parsedDiff);

    if (!parsedDiff.trim()) {
      throw new Error('Failed to generate prompt from diff');
    }

    const commitMessage = await generateCommitMessage(parsedDiff, options.commitType);
    
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
