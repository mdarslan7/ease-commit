# Easy-Commit

Tired of dull, generic commit messages that don’t reflect the work you've done? 🚀

Introducing Easy-Commit – the tool that transforms your Git commit messages into meaningful, context-aware statements. Forget about **Fixed stuff** or **Made changes** – Easy-Commit uses the power of AI to analyze your Git diffs and recent commits, crafting clear, concise, and relevant messages every time.

By integrating with the Gemini API, it ensures your messages are tailored to your project’s tone and style, making your commit history more organized and meaningful. Say goodbye to the hassle of writing commit messages – let Easy-Commit do the work for you! ✨

## What Needs Fixing?

Writing good commit messages is crucial for maintaining a clean and understandable Git history. However, many developers struggle with crafting well-structured commit messages, often resulting in vague, inconsistent, or incomplete descriptions. **Easy-Commit** solves this problem by generating commit messages that:
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

To install **Easy-Commit**, you can use npm:

```bash
npm install easy-commit
```

## Usage

### Basic Usage

The simplest way to use Easy-Commit is through its interactive CLI:

```bash
easy-commit
```

This will start an interactive session that:
1. Verifies your Gemini API key
2. Prompts you for commit message preferences
3. Generates and applies the commit message

### Interactive Workflow

Here's what the typical workflow looks like:

```bash
❯ easy-commit
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

Before using easy-commit, you need to set up your Gemini API key. You can configure it using any of these methods:

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
   easy-commit configure
   ```
   - To remove your api-key from the created configuration file, run
   ```bash
   easy-commit configure --reset
   ```

If the API key is not configured, you'll receive an error message prompting you to set it up using one of these methods.

### LICENSE
This project is licensed under the MIT License - see the LICENSE file for details.