const DIFF_MARKERS = {
  OLD_FILE: '---',
  NEW_FILE: '+++',
  CHUNK_HEADER: '@@',
};

function parseDiff(diff) {
  if (!diff || typeof diff !== 'string') {
    throw new Error('Invalid diff input: diff must be a non-empty string');
  }

  let lines = diff.split('\n');

  lines = lines.filter(line => {
    return !Object.values(DIFF_MARKERS).some(marker => line.startsWith(marker));
  });

  lines = lines.filter(line => line.trim() !== '');

  const maxLines = 200;
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);  
  }

  return lines.join('\n').trim();
}

module.exports = {
  parseDiff,
};