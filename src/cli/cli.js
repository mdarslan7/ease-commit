// #!/usr/bin/env node

// const { program } = require('commander');
// const inquirer = require('inquirer');
// const { log, checkEnvVar, validateCommitType, confirmAction } = require('../api/utils');
// const { generateCommitMessage } = require('../commit/commitGenerator');
// const { getGeminiAPIKey } = require('../config/apiKeyConfig');

// checkEnvVar('GEMINI_API_KEY');

// program
//   .name('easy-commit')
//   .description('A tool to generate professional git commit messages with AI')
//   .version('1.0.0');

// program
//   .command('generate')
//   .description('Generate a commit message based on your git diff')
//   .option('-t, --type <type>', 'Specify the commit type (e.g., feat, fix, docs, etc.)')
//   .option('-l, --language <language>', 'Specify the language for the commit message (e.g., JavaScript, Python, etc.)', 'English')
//   .option('-n, --num <number>', 'Number of commit suggestions', '1')
//   .option('-c, --concise', 'Generate concise commit message')
//   .option('-s, --short', 'Generate short commit message')
//   .option('-o, --creative', 'Generate creative commit message')
//   .action(async (options) => {
//     const { num } = options;
//     if (parseInt(num) > 5) {
//       log('Warning: Generating too many commit suggestions may increase API usage costs.', 'error');
//       const proceed = await confirmAction('Do you want to continue?');
//       if (!proceed) return;
//     }

//     const validTypes = ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'];
//     if (options.type && !validTypes.includes(options.type)) {
//       log(`Error: Invalid commit type "${options.type}". Valid types are: ${validTypes.join(', ')}`, 'error');
//       return;
//     }

//     const diff = await getGitDiff();

//     if (!diff) {
//       log('No git diff found. Please make sure you have changes staged for commit.', 'error');
//       return;
//     }

//     const commitMessages = await generateCommitMessage(diff, options);

//     if (commitMessages.length === 1) {
//       log(`Generated commit message: ${commitMessages[0]}`, 'success');
//     } else {
//       log('Generated commit suggestions:', 'success');
//       commitMessages.forEach((msg, index) => {
//         log(`${index + 1}: ${msg}`, 'info');
//       });
//     }
//   });

// program
//   .command('setup')
//   .description('Set up the Gemini API key for the project')
//   .action(async () => {
//     const apiKey = await inquirer.prompt({
//       type: 'input',
//       name: 'apiKey',
//       message: 'Please enter your Gemini API key:',
//     });

//     await getGeminiAPIKey(apiKey.apiKey);
//     log('Gemini API key has been saved successfully!', 'success');
//   });

// program.parse(process.argv);

// async function getGitDiff() {
//   const { exec } = require('child_process');
//   return new Promise((resolve, reject) => {
//     exec('git diff --cached', (err, stdout, stderr) => {
//       if (err || stderr) {
//         reject('Error fetching git diff.');
//       }
//       resolve(stdout.trim());
//     });
//   });
// }
