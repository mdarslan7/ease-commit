const axios = require("axios");
const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");
const os = require("os");
require("dotenv").config(); 

const API_CONFIG = {
  BASE_URL: "https://generativelanguage.googleapis.com/v1beta",
  MODEL: "gemini-1.0-pro",
  TIMEOUT: 30000,
};

const getRecentCommits = (count = 3) => {
  try {
    const result = execSync(
      `git log --oneline --max-count=${count}`
    ).toString();
    return result.split("\n").join(" ").trim(); 
  } catch (error) {
    console.error("Error fetching Git history:", error.message);
    return "";
  }
};

const createRequestPayload = (diffContent, commitType, recentCommits) => ({
  contents: [
    {
      parts: [
        {
          text: `
        Generate a ${commitType} commit message for these changes. The message should be in present tense, start with a verb, and clearly describe what the changes do. Focus on the specifics of what was changed and where it was changed as in which file (e.g., added new tests, fixed bug in user login, removed unnecessary code, updated variable names, etc.) and why. Ensure that the message accurately reflects the changes made, such as modifying or deleting comments rather than removing actual code.

        Git Diff:
        ${diffContent}

        Recent Commits (for reference only, do not directly influence message content):
        ${recentCommits}

        Instructions:
        - Prioritize the content of the diff for generating the commit message.
        - Also make sure if a short commit message has been asked, it should be a in a single line and actionable. And accordingly generate the message for long, concise and creative.
        - If a custom diff was provided, prioritize that for generating the commit message.
        - If no custom diff is provided, focus on the actual changes made in the code.
        - The recent commit messages are provided for reference to ensure alignment with the project's style and tone, but they should not directly influence the content of the new commit message.
        - Use present tense (e.g., "fix" instead of "fixed").
        - Start with a lowercase verb.
        - Be specific and clear. Focus on WHAT changed (e.g., fixed a bug, refactored code, updated documentation) and WHY it was necessary.
        - Ensure that the commit message reflects the actual changes (e.g., if only comments were modified, do not suggest code removal).
        - Make sure the message is concise, actionable, and meaningful.
        - Do not use bullet points or quotes.
        - Avoid using the word "commit" in the message.
        - Pay attention to spelling, grammar, and punctuation. `,
        },
      ],
    },
  ],
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  },
});

const generateCommitMessage = async (diffs = "", commitType = "short") => {
  try {
    commitType = commitType || "short";
    const recentCommits = getRecentCommits(5);

    if (!diffs || typeof diffs !== "string") {
      throw new Error("Invalid diff content provided");
    }

    const CONFIG_PATH = path.join(os.homedir(), ".easy-commit-config.json");

    const apiKey =
      process.env.GEMINI_API_KEY ||
      (fs.existsSync(CONFIG_PATH)
        ? JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")).apiKey
        : null);

    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY environment variable or config file is not set"
      );
    }

    const requestPayload = createRequestPayload(
      diffs,
      commitType,
      recentCommits
    );

    // Make API request
    console.log("Sending request to the Gemini API..."); 
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/models/${API_CONFIG.MODEL}:generateContent?key=${apiKey}`,
      requestPayload,
      {
        headers: { "Content-Type": "application/json" },
        timeout: API_CONFIG.TIMEOUT,
      }
    );

    if (!response.data) {
      throw new Error("Empty response received from Gemini API");
    }

    const generatedText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No valid text generated in API response");
    }

    // Clean up the generated text
    return generatedText
      .trim()
      .replace(/^["']|["']$/g, "") // Remove quotes if present
      .replace(/^commit: /i, "") // Remove 'commit:' prefix if present
      .replace(/\n+/g, " ") // Replace multiple newlines with space
      .trim();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        throw new Error("Request to Gemini API timed out. Please try again.");
      }

      if (error.response) {
        const status = error.response.status;
        const errorMessage =
          error.response.data?.error?.message || error.message;

        console.error(
          "Full API Error Response:",
          JSON.stringify(error.response.data, null, 2)
        );

        switch (status) {
          case 400:
            throw new Error(`Invalid request: ${errorMessage}`);
          case 401:
            throw new Error(
              "Invalid API key. Please check your GEMINI_API_KEY."
            );
          case 429:
            throw new Error("Rate limit exceeded. Please try again later.");
          case 500:
            throw new Error("Gemini API server error. Please try again later.");
          default:
            throw new Error(`API error (${status}): ${errorMessage}`);
        }
      }

      throw new Error(`Network error: ${error.message}`);
    }

    throw new Error(`Failed to generate commit message: ${error.message}`);
  }
};

module.exports = {
  generateCommitMessage,
};