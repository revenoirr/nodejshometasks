const db = require('../models');
const { Article, Workspace } = db;
const { generateArticlePDF, generatePDFFilename } = require('../services/pdfService');

const exportArticlePDF = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch article with workspace
    const article = await Article.findByPk(id, {
      include: [
        {
          model: Workspace,
          as: 'workspace',
          attributes: ['id', 'name', 'icon', 'color']
        }
      ]
    });

    if (!article) {
      return res.status(404).json({
        error: 'Article not found'
      });
    }

    // Prepare article data for PDF
    const articleData = {
      title: article.title,
      content: article.content,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      workspace: article.workspace ? {
        name: article.workspace.name,
        icon: article.workspace.icon,
        color: article.workspace.color
      } : null,
      author: null
    };

    console.log(`📄 Generating PDF for article: ${article.title}`);

    const pdfBuffer = await generateArticlePDF(articleData);
    const filename = generatePDFFilename(article.title);

    console.log(`✅ PDF generated successfully: ${filename}`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error exporting article to PDF:', error);
    
    if (res.headersSent) {
      return;
    }

    res.status(500).json({
      error: 'Failed to export article as PDF',
      message: error.message
    });
  }
};

module.exports = {
  exportArticlePDF
};