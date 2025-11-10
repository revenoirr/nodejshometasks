const fs = require('fs').promises;

const generateFilename = (title) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.json';
};

const getArticleFiles = async (dataDir) => {
  const files = await fs.readdir(dataDir);
  return files.filter(f => f.endsWith('.json'));
};

const ensureDirectoryExists = async (dir) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

module.exports = {
  generateFilename,
  getArticleFiles,
  ensureDirectoryExists
};