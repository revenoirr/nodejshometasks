<template>
  <div class="article-view">
    <button @click="$emit('back')" class="btn-back">← Back to List</button>
    <div v-if="loading" class="loading">Loading article...</div>
    <div v-else-if="article" class="article-content">
      <h2>{{ article.title }}</h2>
      <p class="date">Created: {{ formatDate(article.createdAt) }}</p>
      <div class="content" v-html="article.content"></div>
      <div class="article-actions">
        <button @click="$emit('edit', article.id)" class="btn-edit">Edit Article</button>
        <button @click="$emit('delete', article.id)" class="btn-delete">Delete Article</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArticleView',
  props: {
    article: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['back', 'edit', 'delete'],
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
.article-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.btn-back {
  background: #6c757d;
  color: white;
  margin-bottom: 20px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-back:hover {
  background: #5a6268;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
}

.article-content h2 {
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-align: center;
}

.date {
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 30px;
  text-align: center;
}

.content {
  line-height: 1.8;
  color: #444;
  margin: 30px 0;
  padding: 30px;
  background: #f9f9f9;
  border-radius: 8px;
  min-height: 200px;
  font-size: 1.1rem;
}

.article-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
  justify-content: center;
}

.btn-edit {
  background: #ffc107;
  color: #333;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-edit:hover {
  background: #e0a800;
}

.btn-delete {
  background: #dc3545;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-delete:hover {
  background: #c82333;
}
</style>