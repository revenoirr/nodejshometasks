const db = require('./models');
const { Article, ArticleVersion } = db;

async function migrateExistingArticles() {
  try {
    console.log('🚀 Starting migration of existing articles to versioning system...\n');
    
    // Получаем все существующие статьи
    const articles = await Article.findAll();
    
    if (articles.length === 0) {
      console.log('ℹ️  No existing articles found. Migration not needed.');
      process.exit(0);
    }
    
    console.log(`📊 Found ${articles.length} articles to migrate\n`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const article of articles) {
      // Проверяем, есть ли уже версия для этой статьи
      const existingVersion = await ArticleVersion.findOne({
        where: { articleId: article.id }
      });
      
      if (existingVersion) {
        console.log(`⏭️  Skipped: "${article.title}" (already has versions)`);
        skippedCount++;
      } else {
        // Создаем первую версию для существующей статьи
        await ArticleVersion.create({
          articleId: article.id,
          versionNumber: 1,
          title: article.title,
          content: article.content,
          isCurrent: true
        });
        console.log(`✅ Migrated: "${article.title}" → Version 1 created`);
        migratedCount++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📈 Migration Summary:');
    console.log(`   Total articles: ${articles.length}`);
    console.log(`   ✅ Migrated: ${migratedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log('='.repeat(50));
    console.log('\n✨ Migration completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Запускаем миграцию
migrateExistingArticles();