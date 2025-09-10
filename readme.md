# Ease-Commit

Tired of dull, generic commit messages that don’t reflect the work you've done? 

Introducing Ease-Commit – the tool that transforms your Git commit messages into meaningful, context-aware statements. Forget about **Fixed stuff** or **Made changes** – Ease-Commit uses the power of AI to analyze your Git diffs and recent commits, crafting clear, concise, and relevant messages every time.

By integrating with the Gemini API, it ensures your messages are tailored to your project’s tone and style, making your commit history more organized and meaningful. Say goodbye to the hassle of writing commit messages – let Ease-Commit do the work for you! ✨

## What Needs Fixing?

Writing good commit messages is crucial for maintaining a clean and understandable Git history. However, many developers struggle with crafting well-structured commit messages, often resulting in vague, inconsistent, or incomplete descriptions. **Ease-Commit** solves this problem by generating commit messages that:
- Accurately describe the changes made in the code.
- Follow the correct structure and style (e.g., using present tense, clear descriptions).
- Align with the tone of recent commit messages in your project.

## Features

- **Context-Aware Commit Messages**: Analyzes the Git diff and recent commit messages to generate relevant, actionable commit messages.
- **Multiple Commit Types**: Supports different types of commit messages, including short, concise, and creative options.
- **Git Integration**: Automatically fetches the recent Git commit history and provides context for the generated commit message.
- **Gemini API Integration**: Leverages Gemini's AI to ensure high-quality, human-like commit message generation.
- **Customizable**: Offers option to fine-tune the message format based on your needs.

## Installation

To install **Ease-Commit**, you can use npm:

```bash
npm install -g ease-commit
```

## Usage

### Basic Usage

The simplest way to use Ease-Commit is through its interactive CLI:

```bash
ease-commit
```

This will start an interactive session that:
1. Verifies your Gemini API key
2. Prompts you for commit message preferences
3. Generates and applies the commit message

### Interactive Workflow

Here's what the typical workflow looks like:

```bash
❯ ease-commit
✅ Gemini API key is set and loaded successfully.

? What type of commit message would you like to generate? 
  > short

? Do you want to provide a custom diff? (Default: use git diff)
  > No

Sending request to the Gemini API...
✔ Commit Message: Refactor: Update getRecentCommits to fetch fewer recent commits
  Modifies `getRecentCommits` to retrieve a smaller number of recent commits (3 instead of 5) 
  from the API, optimizing performance and reducing unnecessary data fetching.

? Would you like to use this commit message?
  > Yes

✅ Commit message applied successfully!
```

### Configuration

Before using ease-commit, you need to set up your Gemini API key. You can configure it using any of these methods:

1. **Environment Variable (Temporary)**:
   - For macOS/Linux
   ```bash
   export GEMINI_API_KEY=your_api_key_here
   ```
   - For Windows, for Command Prompt, run:
   ```bash
   set GEMINI_API_KEY=your_api_key
   ```
   - For Windows, for Powershell, run:
   ```bash
   $env:GEMINI_API_KEY="your_api_key"
   ```
   Alternatively, set it permanently using or in the System Properties.
    ```bash
   setx GEMINI_API_KEY
   ```

2. **Permanent Shell Configuration**:
   - For Linux (add to `~/.bashrc`):
     ```bash
     echo 'export GEMINI_API_KEY=your_api_key_here' >> ~/.bashrc
     source ~/.bashrc
     ```
   - For macOS (add to `~/.zshrc`):
     ```bash
     echo 'export GEMINI_API_KEY=your_api_key_here' >> ~/.zshrc
     source ~/.zshrc
     ```

3. **Using .env File**:
   - Create a `.env` file in your project directory:
     ```bash
     echo 'GEMINI_API_KEY=your_api_key_here' > .env
     ```
   - Install dotenv:
     ```bash
     npm install dotenv
     ```
   - Add to your JavaScript file:
     ```javascript
     require("dotenv").config();
     ```

4. **Interactive Configuration**:
   ```bash
   ease-commit-configure
   ```
   - To remove your api-key from the created configuration file, run
   ```bash
   ease-commit-configure --reset
   ```

If the API key is not configured, you'll receive an error message prompting you to set it up using one of these methods.

## Demo
[![Watch the demo](https://img.youtube.com/vi/enhOTrQUX3I/0.jpg)](https://www.youtube.com/watch?v=enhOTrQUX3I)

## Windows Users - Important Information (Potential Issue)

On Windows, you might need to ensure the directory containing globally installed npm package executables is in your system's PATH environment variable for `ease-commit` to work directly. This is a standard Windows/npm requirement, and while it often works automatically, there can sometimes be issues.  If `ease-commit` isn't recognized, follow these steps:

1. **Find your global npm installation directory:** Open either PowerShell or Command Prompt and run:

   ```bash
   npm config get prefix
   ```

   This will show you the directory where global packages are installed. For example: `C:\Users\YourUsername\AppData\Roaming\npm` (or it might be something different).  **This is the most critical step.  Do not assume a fixed path.** <br> <br>

2. **Add to PATH (If Necessary):** The directory you found in the previous step (the output of `npm config get prefix`) is the directory you need to add to your PATH, if it's not already added.  Do not assume it's in a `.bin` subfolder unless `npm config get prefix` shows a path that does not contain the executables directly. Add this path to your system's or user's PATH environment variable. <br> <br>

3. **Close and reopen your terminal:** After making the changes to your PATH, you must close and reopen your PowerShell or Command Prompt window for the changes to take effect. <br> <br>

4. **Test:** Now try running `ease-commit` again. It should work.

### LICENSE
This project is licensed under the MIT License - see the LICENSE file for details.
