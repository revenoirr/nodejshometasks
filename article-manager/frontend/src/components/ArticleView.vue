<template>
  <div class="article-view">
    <button @click="$emit('back')" class="btn-back">← Back to List</button>
    <div v-if="loading" class="loading">Loading article...</div>
    <div v-else-if="article" class="article-content">
      <h2>{{ article.title }}</h2>
      <p class="date">Created: {{ formatDate(article.createdAt) }}</p>
      
      <div v-if="article.attachments && article.attachments.length > 0" class="attachments-section">
        <h3>📎 Attachments ({{ article.attachments.length }})</h3>
        <div class="attachments-grid">
          <div 
            v-for="attachment in article.attachments" 
            :key="attachment.id"
            class="attachment-card"
          >
            <div class="attachment-preview" @click="openAttachment(attachment)">
              <div v-if="isImage(attachment.mimetype)" class="image-preview">
                <img :src="getAttachmentUrl(attachment.filename)" :alt="attachment.originalName" />
              </div>
              <div v-else class="file-icon">
                <span v-if="attachment.mimetype === 'application/pdf'">📄</span>
                <span v-else>📎</span>
              </div>
            </div>
            <div class="attachment-info">
              <div class="attachment-name" :title="attachment.originalName">
                {{ attachment.originalName }}
              </div>
              <div class="attachment-meta">
                {{ formatFileSize(attachment.size) }} • {{ formatDate(attachment.uploadedAt) }}
              </div>
            </div>
            <button 
              @click="$emit('delete-attachment', attachment.id)" 
              class="btn-delete-attachment"
              title="Delete attachment"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <div class="content" v-html="article.content"></div>

      <div class="article-actions">
        <button @click="$emit('upload-file')" class="btn-upload">📎 Add Attachment</button>
        <button @click="$emit('edit', article.id)" class="btn-edit">Edit Article</button>
        <button @click="$emit('delete', article.id)" class="btn-delete">Delete Article</button>
      </div>
    </div>
  </div>
</template>

<script>
const API_URL = 'http://localhost:3000';

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
  emits: ['back', 'edit', 'delete', 'delete-attachment', 'upload-file'],
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },
    isImage(mimetype) {
      return mimetype && mimetype.startsWith('image/');
    },
    getAttachmentUrl(filename) {
      return `${API_URL}/uploads/${filename}`;
    },
    openAttachment(attachment) {
      window.open(this.getAttachmentUrl(attachment.filename), '_blank');
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
</style>