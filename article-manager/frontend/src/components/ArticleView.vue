<template>
  <div class="article-view">
    <button @click="$emit('back')" class="btn-back">← Back to List</button>
    <div v-if="loading" class="loading">Loading article...</div>
    <div v-else-if="article" class="article-content">
      <div v-if="!article.isCurrentVersion" class="version-warning">
        ⚠️ You are viewing an old version (v{{ article.currentVersion }} of {{ article.totalVersions }})
        <button @click="loadCurrentVersion" class="btn-current">View Current Version</button>
      </div>

      <div class="version-info">
        <span class="version-badge">
          📝 Version {{ article.currentVersion }} of {{ article.totalVersions }}
        </span>
        <button 
          v-if="article.totalVersions > 1" 
          @click="showVersions = !showVersions" 
          class="btn-toggle-versions"
        >
          {{ showVersions ? '▼ Hide' : '▶ Show' }} Version History
        </button>
      </div>

      <div v-if="showVersions && article.versions" class="versions-list">
        <h3>📚 Version History</h3>
        <div class="versions-grid">
          <div 
            v-for="version in article.versions" 
            :key="version.versionNumber"
            :class="['version-item', { 'current': version.isCurrent, 'selected': article.currentVersion === version.versionNumber }]"
            @click="loadVersion(version.versionNumber)"
          >
            <div class="version-header">
              <span class="version-number">v{{ version.versionNumber }}</span>
              <span v-if="version.isCurrent" class="current-badge">Current</span>
            </div>
            <div class="version-date">{{ formatDate(version.createdAt) }}</div>
          </div>
        </div>
      </div>

      <div v-if="article.workspace" class="workspace-badge" :style="{ background: article.workspace.color }">
        {{ article.workspace.icon }} {{ article.workspace.name }}
      </div>

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
              v-if="article.isCurrentVersion"
              @click="$emit('delete-attachment', article.id, attachment.id)" 
              class="btn-delete-attachment"
              title="Delete attachment"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <div class="content" v-html="article.content"></div>

      <div v-if="article.isCurrentVersion" class="article-actions">
        <template v-if="canEdit">
          <button @click="$emit('edit', article.id)" class="btn-edit">Edit Article</button>
          <button @click="$emit('delete', article.id)" class="btn-delete">Delete Article</button>
        </template>
        
        <button @click="$emit('upload', article.id)" class="btn-upload">📎 Add Attachment</button>
        
        <button 
          @click="exportPDF" 
          :disabled="exporting"
          class="btn-export-pdf"
        >
          {{ exporting ? '⏳ Generating PDF...' : '📄 Export PDF' }}
        </button>
      </div>

      <div v-else class="readonly-notice">
        <p>🔒 This is a read-only version. To make changes, switch to the current version.</p>
      </div>

      <CommentSection
        v-if="article.isCurrentVersion"
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
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    canEdit: {  
      type: Boolean,
      default: true
    }
  },
  emits: ['back', 'edit', 'delete', 'upload', 'delete-attachment', 'refresh', 'load-version', 'show-alert'],
  data() {
    return {
      showVersions: false,
      exporting: false
    };
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
    loadVersion(versionNumber) {
      this.$emit('load-version', this.article.id, versionNumber);
    },
    loadCurrentVersion() {
      this.$emit('load-version', this.article.id, null);
    },
    handleCommentAdded() {
      this.$emit('refresh');
    },
    handleCommentUpdated() {
      this.$emit('refresh');
    },
    handleCommentDeleted() {
      this.$emit('refresh');
    },
    async exportPDF() {
      this.exporting = true;
      
      try {
        const token = localStorage.getItem('jwt_token');
        
        const response = await fetch(
          `http://localhost:3000/articles/${this.article.id}/export-pdf`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to export PDF');
        }
        
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'article.pdf';
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        const blob = await response.blob();
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.$emit('show-alert', 'PDF exported successfully!', 'success');
      } catch (error) {
        console.error('Error exporting PDF:', error);
        this.$emit('show-alert', 'Failed to export PDF. Please try again.', 'error');
      } finally {
        this.exporting = false;
      }
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

.version-warning {
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
  color: #856404;
}

.btn-current {
  background: #ffc107;
  color: #333;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-current:hover {
  background: #e0a800;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.version-badge {
  background: #667eea;
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.btn-toggle-versions {
  background: #6c757d;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.btn-toggle-versions:hover {
  background: #5a6268;
}

.versions-list {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.versions-list h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 1.1rem;
}

.versions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.version-item {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.version-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.version-item.selected {
  border-color: #667eea;
  background: #f0f3ff;
}

.version-item.current {
  border-color: #28a745;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.version-number {
  font-weight: 700;
  color: #333;
  font-size: 1rem;
}

.current-badge {
  background: #28a745;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
}

.version-date {
  font-size: 0.75rem;
  color: #666;
}

.readonly-notice {
  background: #e9ecef;
  border: 2px dashed #6c757d;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin-top: 30px;
}

.readonly-notice p {
  margin: 0;
  color: #495057;
  font-weight: 500;
  font-size: 1.1rem;
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

.attachment-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attachment-icon {
  font-size: 3rem;
  text-align: center;
  padding: 30px 0;
}

.attachment-info {
  padding: 10px;
}

.filename {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.filesize {
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

.btn-export-pdf {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  font-weight: 500;
}

.btn-export-pdf:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-export-pdf:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
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