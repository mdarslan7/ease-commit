// Constants for diff parsing
const DIFF_MARKERS = {
  OLD_FILE: '---',
  NEW_FILE: '+++',
  CHUNK_HEADER: '@@',
};

/**
 * Parses a Git diff and removes metadata while preserving essential change information.
 * It also filters out whitespace-only changes and limits the diff size to a reasonable length.
 * @param {string} diff - Raw Git diff content.
 * @returns {string} Cleaned and pre-processed diff content.
 */
function parseDiff(diff) {
  if (!diff || typeof diff !== 'string') {
    throw new Error('Invalid diff input: diff must be a non-empty string');
  }

  // Split the diff into lines
  let lines = diff.split('\n');

  // Remove lines that are metadata (file headers, chunk headers, etc.)
  lines = lines.filter(line => {
    return !Object.values(DIFF_MARKERS).some(marker => line.startsWith(marker));
  });

  // Remove whitespace-only lines (including blank lines)
  lines = lines.filter(line => line.trim() !== '');

  // Limit the number of lines to a reasonable constraint (200 lines)
  const maxLines = 200;
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);  // Truncate the diff to 200 lines
  }

  // Join the filtered lines back into a string and return
  return lines.join('\n').trim();
}

module.exports = {
  parseDiff,
};