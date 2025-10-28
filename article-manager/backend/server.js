const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');

app.use(cors());
app.use(express.json());

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

function validateArticle(req, res, next) {
  const { title, content } = req.body;
  
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
  }
  
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return res.status(400).json({ error: 'Content is required and must be a non-empty string' });
  }
  
  if (title.length > 200) {
    return res.status(400).json({ error: 'Title must be less than 200 characters' });
  }
  
  next();
}

// GET /api/articles - Get all articles
app.get('/api/articles', async (req, res) => {
  try {
    await ensureDataDir();
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const articles = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(DATA_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const article = JSON.parse(content);
        return {
          id: article.id,
          title: article.title,
          createdAt: article.createdAt
        };
      })
    );
    
    // Sort by creation date, newest first
    articles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET /api/articles/:id - Get specific article
app.get('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(DATA_DIR, `${id}.json`);
    
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    const content = await fs.readFile(filePath, 'utf-8');
    const article = JSON.parse(content);
    
    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// POST /api/articles - Create new article
app.post('/api/articles', validateArticle, async (req, res) => {
  try {
    await ensureDataDir();
    
    const { title, content } = req.body;
    const id = uuidv4();
    const article = {
      id,
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString()
    };
    
    const filePath = path.join(DATA_DIR, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(article, null, 2), 'utf-8');
    
    res.status(201).json({
      message: 'Article created successfully',
      article: {
        id: article.id,
        title: article.title,
        createdAt: article.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

app.listen(PORT, async () => {
  await ensureDataDir();
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Data directory: ${DATA_DIR}`);
});