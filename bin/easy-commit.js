#!/usr/bin/env node

const inquirer = require("inquirer");
const { execSync } = require("child_process");
const { parseDiff } = require("../src/diffParser.js");
const { generateCommitMessage } = require("../src/geminiAPI.js");
const { loadApiKey } = require("../src/apiKeyConfig.js");
const {
  printCommitMessage,
  printError,
  printWarning,
  printInfo,
} = require("../src/display.js");

const COMMIT_TYPES = ["short", "long", "concise", "creative"];
const DEFAULT_COMMIT_TYPE = "short";

function isGitRepository() {
  try {
    execSync("git rev-parse --is-inside-work-tree", {
      encoding: "utf8",
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function getGitDiff() {
  try {
    const stagedDiff = execSync("git diff --cached", { encoding: "utf8" });

    if (stagedDiff.trim()) {
      return stagedDiff;
    }

    return null;
  } catch (error) {
    if (!isGitRepository()) {
      throw new Error(
        "Not a git repository. Please run this command inside a git repository."
      );
    }
    throw error;
  }
}

async function getCommitOptions() {
  return inquirer.prompt([
    {
      type: "list",
      name: "commitType",
      message: "What type of commit message would you like to generate?",
      choices: COMMIT_TYPES,
      default: DEFAULT_COMMIT_TYPE,
    },
    {
      type: "confirm",
      name: "confirmDiff",
      message: "Do you want to provide a custom diff? (Default: use git diff)",
      default: false,
    },
    {
      type: "editor",
      name: "diff",
      message: "Please provide the diff content:",
      when: (answers) => answers.confirmDiff,
      validate: (input) => {
        if (!input.trim()) {
          return "Diff content cannot be empty";
        }
        return true;
      },
    },
  ]);
}

async function generateCommitMessageHandler() {
  try {
    const apiKey = loadApiKey();
    if (!apiKey) {
      printError(
        "Gemini API key is not set. Please configure the GEMINI_API_KEY environment variable."
      );

      printWarning(
        "To configure the GEMINI_API_KEY environment variable, you can follow one of these methods:"
      );

      // For Windows
      if (process.platform === "win32") {
        printInfo("1. For Command Prompt, run:");
        printInfo('   set GEMINI_API_KEY="your_api_key"');
        printInfo("2. For PowerShell, run:");
        printInfo('   $env:GEMINI_API_KEY="your_api_key"');
        printInfo(
          'Alternatively, set it permanently using "setx GEMINI_API_KEY" or in the System Properties.'
        );

        // For macOS/Linux
      } else if (
        process.platform === "darwin" ||
        process.platform === "linux"
      ) {
        printInfo("1. For temporary session use, run:");
        console.log('   export GEMINI_API_KEY="your_api_key"');

        printInfo(
          "\n \n2. For permanent use, add the following line to your shell profile (~/.bashrc or ~/.bash_profile):"
        );
        console.log('   export GEMINI_API_KEY="your_api_key"');
        console.log("   Then run:");
        console.log("   source ~/.bashrc (Linux) or source ~/.zshrc (macOS)");

        // .env File Option
        printInfo(
          "\n \n3. Alternatively, create a .env file in your project directory with this content:"
        );
        console.log('   GEMINI_API_KEY="your_api_key"');
        console.log("   Then, install dotenv to load the variable:");
        console.log("   npm install dotenv");
        console.log("   In your JavaScript file, require dotenv at the top:");
        console.log('   require("dotenv").config();');
      } else {
        printInfo(
          "Unknown platform. Please configure the GEMINI_API_KEY manually."
        );
      }

      console.log(
        "\n \nAlternatively, you can set up the API key interactively using the CLI:"
      );
      printInfo(
        "Run `easy-commit configure` and follow the prompts to set the API key."
      );

      process.exit(1);
    }

    const stagedDiff = await getGitDiff();

    if (!stagedDiff) {
      printError(
        "No changes staged. Please stage your changes using `git add .` before generating a commit message."
      );
      process.exit(1);
    }

    const options = await getCommitOptions();

    const diff = options.confirmDiff ? options.diff : stagedDiff;

    const parsedDiff = parseDiff(diff);

    if (!parsedDiff.trim()) {
      throw new Error("Failed to generate prompt from diff");
    }

    const commitMessage = await generateCommitMessage(
      parsedDiff,
      options.commitType
    );

    printCommitMessage(commitMessage);

    const { applyCommit } = await inquirer.prompt([
      {
        type: "confirm",
        name: "applyCommit",
        message: "Would you like to use this commit message?",
        default: true,
      },
    ]);

    if (applyCommit) {
      try {
        execSync("git commit -m " + JSON.stringify(commitMessage), {
          stdio: "inherit",
        });
        console.log("✅ Commit message applied successfully!");
      } catch (error) {
        printError(
          "Failed to apply commit message. You can still copy and use it manually."
        );
      }
    }
  } catch (error) {
    printError(`Error: ${error.message}`);
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  console.log("\n\nOperation cancelled by user");
  process.exit(0);
});

generateCommitMessageHandler().catch((error) => {
  printError(`Unexpected error: ${error.message}`);
  process.exit(1);
});