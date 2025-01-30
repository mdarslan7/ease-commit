// Constants for diff parsing
const DIFF_MARKERS = {
  OLD_FILE: '---',
  NEW_FILE: '+++',
  CHUNK_HEADER: '@@',
};

/**
 * Parses a Git diff and removes metadata while preserving essential change information.
 * @param {string} diff - Raw Git diff content.
 * @returns {string} Cleaned diff content with only meaningful changes.
 */
function parseDiff(diff) {
  if (!diff || typeof diff !== 'string') {
    throw new Error('Invalid diff input: diff must be a non-empty string');
  }

  return diff
    .split('\n')
    .filter(line => {
      // Remove metadata lines but keep actual code changes
      return !Object.values(DIFF_MARKERS).some(marker => line.startsWith(marker));
    })
    .join('\n')
    .trim();
}

module.exports = {
  parseDiff,
};
