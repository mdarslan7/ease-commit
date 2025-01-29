// const fs = require('fs');
// const path = require('path');

// // Function to check if the environment variable is set
// const checkEnvVar = (envVar) => {
//   if (!process.env[envVar]) {
//     console.error(`Error: ${envVar} is not set. Please ensure it's added in the .env file or as an environment variable.`);
//     process.exit(1); // Exit the process if environment variable is not found
//   }
// };

// // Function to ensure the .env file exists
// const ensureEnvFile = () => {
//   const envPath = path.resolve(__dirname, '.env');
//   if (!fs.existsSync(envPath)) {
//     console.log('.env file is missing. Creating a new one...');
//     fs.copyFileSync(path.resolve(__dirname, '.env.example'), envPath);
//     console.log('.env file has been created. Please add your GEMINI_API_KEY.');
//   }
// };

// // Function to validate user input for commit types
// const validateCommitType = (commitType, validTypes) => {
//   if (!validTypes.includes(commitType)) {
//     console.error(`Error: Invalid commit type "${commitType}". Valid types are: ${validTypes.join(', ')}`);
//     process.exit(1); // Exit the process if commit type is invalid
//   }
// };

// // Utility function to handle logging
// const log = (message, type = 'info') => {
//   const logTypes = {
//     info: '\x1b[36m%s\x1b[0m', // cyan
//     success: '\x1b[32m%s\x1b[0m', // green
//     error: '\x1b[31m%s\x1b[0m', // red
//   };

//   console.log(logTypes[type] || logTypes.info, message);
// };

// // Function to handle user confirmation (used for actions like continuing with costs, etc.)
// const confirmAction = async (question) => {
//   const inquirer = require('inquirer');
//   const { confirm } = await inquirer.prompt([
//     {
//       type: 'confirm',
//       name: 'confirm',
//       message: question,
//       default: true,
//     },
//   ]);
//   return confirm;
// };

// module.exports = {
//   checkEnvVar,
//   ensureEnvFile,
//   validateCommitType,
//   log,
//   confirmAction
// };