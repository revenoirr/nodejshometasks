const puppeteer = require('puppeteer');

/**
 * Generate PDF from article data
 * @param {Object} article - Article data with title, content, metadata
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateArticlePDF = async (article) => {
  let browser;
  
  try {
    // Launch headless browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    const htmlContent = generateArticleHTML(article);

    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '40px',
        right: '40px',
        bottom: '40px',
        left: '40px'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
          <span>${escapeHtmlSimple(article.title)}</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; color: #666; padding: 5px;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/**
 * Simple HTML escape for metadata only (not for content)
 */
const escapeHtmlSimple = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Generate HTML template for article PDF
 * @param {Object} article - Article data
 * @returns {string} HTML string
 */
const generateArticleHTML = (article) => {
  const {
    title,
    content,
    createdAt,
    updatedAt,
    workspace,
    author
  } = article;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Clean dangerous scripts but keep HTML formatting
  const cleanContent = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtmlSimple(title)}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Georgia', 'Times New Roman', serif;
          line-height: 1.8;
          color: #333;
          background: white;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .header {
          border-bottom: 3px solid #667eea;
          padding-bottom: 30px;
          margin-bottom: 40px;
        }

        .title {
          font-size: 36px;
          font-weight: bold;
          color: #1a1a1a;
          margin-bottom: 20px;
          line-height: 1.3;
        }

        .metadata {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          font-size: 14px;
          color: #666;
          margin-top: 15px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .meta-label {
          font-weight: 600;
          color: #667eea;
        }

        .workspace-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 600;
          color: white;
        }

        .content {
          font-size: 16px;
          line-height: 1.8;
          color: #333;
        }

        .content h1,
        .content h2,
        .content h3,
        .content h4,
        .content h5,
        .content h6 {
          margin-top: 32px;
          margin-bottom: 16px;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.4;
        }

        .content h1 { font-size: 32px; }
        .content h2 { font-size: 28px; }
        .content h3 { font-size: 24px; }
        .content h4 { font-size: 20px; }

        .content p {
          margin-bottom: 16px;
        }

        .content ul,
        .content ol {
          margin-left: 24px;
          margin-bottom: 16px;
        }

        .content li {
          margin-bottom: 8px;
        }

        .content blockquote {
          border-left: 4px solid #667eea;
          padding-left: 20px;
          margin: 24px 0;
          font-style: italic;
          color: #555;
        }

        .content code {
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
        }

        .content pre {
          background: #f5f5f5;
          padding: 16px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 16px 0;
        }

        .content pre code {
          background: none;
          padding: 0;
        }

        .content img {
          max-width: 100%;
          height: auto;
          margin: 20px 0;
          border-radius: 8px;
        }

        .content a {
          color: #667eea;
          text-decoration: none;
        }

        .content a:hover {
          text-decoration: underline;
        }

        .content table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }

        .content table th,
        .content table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }

        .content table th {
          background: #f5f5f5;
          font-weight: 600;
        }

        .footer {
          margin-top: 60px;
          padding-top: 30px;
          border-top: 2px solid #e0e0e0;
          text-align: center;
          font-size: 12px;
          color: #999;
        }

        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">${escapeHtmlSimple(title)}</h1>
          
          <div class="metadata">
            ${workspace ? `
              <div class="meta-item">
                <span class="workspace-badge" style="background: ${workspace.color || '#667eea'}">
                  ${workspace.icon || '📁'} ${escapeHtmlSimple(workspace.name)}
                </span>
              </div>
            ` : ''}
            
            ${author ? `
              <div class="meta-item">
                <span class="meta-label">Author:</span>
                <span>${escapeHtmlSimple(author.name || author.email)}</span>
              </div>
            ` : ''}
            
            <div class="meta-item">
              <span class="meta-label">Created:</span>
              <span>${formatDate(createdAt)}</span>
            </div>
            
            ${updatedAt !== createdAt ? `
              <div class="meta-item">
                <span class="meta-label">Updated:</span>
                <span>${formatDate(updatedAt)}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="content">
          ${cleanContent}
        </div>

        <div class="footer">
          <p>Generated from Article Management System</p>
          <p>Exported on ${formatDate(new Date().toISOString())}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate filename for PDF export
 * @param {string} title - Article title
 * @returns {string} Safe filename
 */
const generatePDFFilename = (title) => {
  const sanitized = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
  
  const timestamp = Date.now();
  
  return `article-${sanitized}-${timestamp}.pdf`;
};

module.exports = {
  generateArticlePDF,
  generatePDFFilename
};