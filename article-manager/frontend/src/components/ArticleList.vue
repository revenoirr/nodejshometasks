<template>
  <div class="article-list">
    <h2>Articles</h2>
    <div v-if="loading" class="loading">Loading articles...</div>
    <div v-else-if="articles.length === 0" class="empty-state">
      <p>No articles yet. Create your first article!</p>
    </div>
    <div v-else class="articles-grid">
      <div 
        v-for="article in articles" 
        :key="article.id" 
        class="article-card"
      >
        <h3>{{ article.title }}</h3>
        <p class="date">{{ formatDate(article.createdAt) }}</p>
        <div class="card-actions">
          <button @click="$emit('view', article.id)" class="btn-view">View</button>
          <button @click="$emit('edit', article.id)" class="btn-edit">Edit</button>
          <button @click="$emit('delete', article.id)" class="btn-delete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArticleList',
  props: {
    articles: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['view', 'edit', 'delete'],
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }
};
</script>

<style scoped>
.article-list h2 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
  font-size: 2rem;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.article-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
  background: white;
}

.article-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.article-card h3 {
  color: #333;
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.date {
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-view {
  background: #667eea;
  color: white;
}

.btn-view:hover {
  background: #5568d3;
}

.btn-edit {
  background: #ffc107;
  color: #333;
}

.btn-edit:hover {
  background: #e0a800;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn-delete:hover {
  background: #c82333;
}
</style>