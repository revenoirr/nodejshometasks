<template>
  <div class="article-view">
    <button @click="$emit('back')" class="btn-back">← Back to List</button>
    <div v-if="loading" class="loading">Loading article...</div>
    <div v-else-if="article" class="article-content">
      <!-- Workspace badge -->
      <div v-if="article.workspace" class="workspace-badge" :style="{ background: article.workspace.color }">
        {{ article.workspace.icon }} {{ article.workspace.name }}
      </div>

      <h2>{{ article.title }}</h2>
      <p class="date">Created: {{ formatDate(article.createdAt) }}</p>

      <!-- Attachments section (existing) -->
      <div v-if="article.attachments && article.attachments.length > 0" class="attachments-section">
        <h3>📎 Attachments ({{ article.attachments.length }})</h3>
        <div class="attachments-grid">
          <div 
            v-for="attachment in article.attachments" 
            :key="attachment.id"
            class="attachment-card"
          >
            <a 
              :href="`http://localhost:3000/uploads/${attachment.filename}`" 
              target="_blank"
              class="attachment-link"
            >
              <div v-if="isImage(attachment.mimetype)" class="attachment-preview">
                <img 
                  :src="`http://localhost:3000/uploads/${attachment.filename}`"
                  :alt="attachment.originalName"
                />
              </div>
              <div v-else class="attachment-icon">
                {{ getFileIcon(attachment.mimetype) }}
              </div>
              <div class="attachment-info">
                <p class="filename">{{ attachment.originalName }}</p>
                <p class="filesize">{{ formatFileSize(attachment.size) }}</p>
              </div>
            </a>
            <button 
              @click="$emit('delete-attachment', article.id, attachment.id)" 
              class="btn-delete-attachment"
              title="Delete attachment"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="content" v-html="article.content"></div>

      <!-- Article actions -->
      <div class="article-actions">
        <button @click="$emit('edit', article.id)" class="btn-edit">Edit Article</button>
        <button @click="$emit('upload', article.id)" class="btn-upload">📎 Add Attachment</button>
        <button @click="$emit('delete', article.id)" class="btn-delete">Delete Article</button>
      </div>

      <!-- Comments Section - NEW -->
      <CommentSection
        :article-id="article.id"
        :initial-comments="article.comments || []"
        @comment-added="handleCommentAdded"
        @comment-updated="handleCommentUpdated"
        @comment-deleted="handleCommentDeleted"
      />
    </div>
  </div>
</template>

<script>
import CommentSection from './CommentSection.vue';

export default {
  name: 'ArticleView',
  components: {
    CommentSection
  },
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
  emits: ['back', 'edit', 'delete', 'upload', 'delete-attachment', 'refresh'],
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    isImage(mimetype) {
      return mimetype && mimetype.startsWith('image/');
    },
    getFileIcon(mimetype) {
      if (mimetype.includes('pdf')) return '📄';
      if (mimetype.includes('word')) return '📝';
      if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return '📊';
      return '📎';
    },
    formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    },
    handleCommentAdded() {
      this.$emit('refresh');
    },
    handleCommentUpdated() {
      this.$emit('refresh');
    },
    handleCommentDeleted() {
      this.$emit('refresh');
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

.attachments-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.attachments-section h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 1.2rem;
}

.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
}

.attachment-card {
  position: relative;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.attachment-card:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.attachment-preview {
  width: 100%;
  height: 120px;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  font-size: 3rem;
}

.attachment-info {
  padding: 10px;
}

.attachment-name {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.attachment-meta {
  font-size: 0.75rem;
  color: #999;
}

.btn-delete-attachment {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  opacity: 0;
}

.attachment-card:hover .btn-delete-attachment {
  opacity: 1;
}

.btn-delete-attachment:hover {
  background: #dc3545;
  transform: scale(1.1);
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
  flex-wrap: wrap;
}

.btn-upload {
  background: #17a2b8;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-upload:hover {
  background: #138496;
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

.workspace-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
</style>