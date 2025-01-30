const fs = require("fs");
const path = require("path");
const os = require("os");
const dotenv = require("dotenv");

dotenv.config();

const CONFIG_PATH = path.join(os.homedir(), ".ease-commit-config.json");

const loadApiKey = () => {
  let apiKey = process.env.GEMINI_API_KEY || null;

  if (!apiKey && fs.existsSync(CONFIG_PATH)) {
    try {
      const configData = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
      apiKey = configData.apiKey || null;
    } catch {}
  }

  if (apiKey) 
    console.log('✅ Gemini API key is set and loaded successfully.');
  return apiKey;
};

const saveApiKey = (apiKey) => {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ apiKey }, null, 2));
  } catch {}
};

module.exports = { loadApiKey, saveApiKey };