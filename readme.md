# Easy-Commit

Easy-Commit is a tool designed to help developers generate context-aware commit messages for Git. It simplifies the process of writing clear, concise, and meaningful commit messages by using AI to analyze Git diffs and recent commit history. This package integrates with the Gemini API to ensure your commit messages align with your project's tone and style.

## Problem We Are Solving

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