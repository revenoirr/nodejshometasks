<template>
  <div id="app">
    <header>
      <h1>📝 Article Management System</h1>
      <div class="connection-status">
        <span :class="['status-indicator', wsConnected ? 'connected' : 'disconnected']"></span>
        {{ wsConnected ? 'Connected' : 'Disconnected' }}
      </div>
    </header>

    <main>
      <div class="navigation">
        <button 
          @click="currentView = 'list'" 
          :class="{ active: currentView === 'list' }"
        >
          📚 All Articles
        </button>
        <button 
          @click="showCreateForm" 
          :class="{ active: currentView === 'create' }"
        >
          ➕ Create New
        </button>
      </div>

      <div v-if="alert.show" :class="['alert', alert.type]">
        {{ alert.message }}
      </div>

      <ArticleList
        v-if="currentView === 'list'"
        :articles="articles"
        :loading="loading"
        @view="viewArticle"
        @edit="editArticle"
        @delete="confirmDelete"
      />

      <ArticleView
        v-if="currentView === 'view'"
        :article="selectedArticle"
        :loading="loading"
        @back="currentView = 'list'"
        @edit="editArticle"
        @delete="confirmDelete"
        @delete-attachment="confirmDeleteAttachment"
        @upload-file="showUploadModal = true"
      />

      <ArticleForm
        v-if="currentView === 'create' || currentView === 'edit'"
        :initial-data="form"
        :is-editing="currentView === 'edit'"
        :submitting="submitting"
        @submit="submitArticle"
        @cancel="cancelForm"
      />

      <DeleteModal
        :show="showDeleteModal"
        @confirm="deleteArticle"
        @cancel="showDeleteModal = false"
      />

      <DeleteModal
        :show="showDeleteAttachmentModal"
        @confirm="deleteAttachment"
        @cancel="showDeleteAttachmentModal = false"
      />

      <UploadModal
        :show="showUploadModal"
        :uploading="uploading"
        @upload="uploadFile"
        @cancel="showUploadModal = false"
      />

      <NotificationToast 
        :notifications="notifications"
        @remove="removeNotification"
      />
    </main>
  </div>
</template>

<script>
import ArticleList from './components/ArticleList.vue';
import ArticleView from './components/ArticleView.vue';
import ArticleForm from './components/ArticleForm.vue';
import DeleteModal from './components/DeleteModal.vue';
import UploadModal from './components/UploadModal.vue';
import NotificationToast from './components/NotificationToast.vue';

const API_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000';

export default {
  name: 'App',
  components: {
    ArticleList,
    ArticleView,
    ArticleForm,
    DeleteModal,
    UploadModal,
    NotificationToast
  },
  data() {
    return {
      currentView: 'list',
      articles: [],
      selectedArticle: null,
      form: {
        title: '',
        content: ''
      },
      loading: false,
      submitting: false,
      uploading: false,
      alert: {
        show: false,
        message: '',
        type: 'success'
      },
      showDeleteModal: false,
      showDeleteAttachmentModal: false,
      showUploadModal: false,
      articleToDelete: null,
      attachmentToDelete: null,
      editingId: null,
      ws: null,
      wsConnected: false,
      notifications: []
    };
  },
  mounted() {
    this.fetchArticles();
    this.connectWebSocket();
  },
  beforeUnmount() {
    if (this.ws) {
      this.ws.close();
    }
  },
  methods: {
    connectWebSocket() {
      try {
        this.ws = new WebSocket(WS_URL);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.wsConnected = true;
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message:', data);
            
            if (data.type !== 'connection') {
              this.addNotification(data);
              if (this.currentView === 'list' && 
                  ['article_created', 'article_deleted'].includes(data.type)) {
                this.fetchArticles();
              }
              if (this.currentView === 'view' && 
                  this.selectedArticle && 
                  data.data && 
                  data.data.articleId === this.selectedArticle.id) {
                this.viewArticle(this.selectedArticle.id);
              }
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.wsConnected = false;
          setTimeout(() => this.connectWebSocket(), 3000);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.wsConnected = false;
        };
      } catch (err) {
        console.error('Failed to connect WebSocket:', err);
      }
    },

    addNotification(data) {
      const notification = {
        id: Date.now() + Math.random(),
        type: data.type,
        message: data.message,
        timestamp: data.timestamp
      };
      this.notifications.push(notification);
      
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, 5000);
    },

    removeNotification(id) {
      const index = this.notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        this.notifications.splice(index, 1);
      }
    },

    async fetchArticles() {
      this.loading = true;
      try {
        const response = await fetch(`${API_URL}/articles`);
        if (!response.ok) throw new Error('Failed to fetch articles');
        this.articles = await response.json();
      } catch (error) {
        this.showAlert('Failed to load articles', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    async viewArticle(id) {
      this.loading = true;
      this.currentView = 'view';
      try {
        const response = await fetch(`${API_URL}/articles/${id}`);
        if (!response.ok) throw new Error('Article not found');
        this.selectedArticle = await response.json();
      } catch (error) {
        this.showAlert('Failed to load article', 'error');
        this.currentView = 'list';
      } finally {
        this.loading = false;
      }
    },
    
    showCreateForm() {
      this.currentView = 'create';
      this.form = { title: '', content: '' };
      this.editingId = null;
    },
    
    async editArticle(id) {
      this.loading = true;
      try {
        const response = await fetch(`${API_URL}/articles/${id}`);
        if (!response.ok) throw new Error('Article not found');
        const article = await response.json();
        
        this.form = {
          title: article.title,
          content: article.content
        };
        this.editingId = id;
        this.currentView = 'edit';
      } catch (error) {
        this.showAlert('Failed to load article for editing', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    async submitArticle(formData) {
      if (!formData.title.trim() || !formData.content.trim()) {
        this.showAlert('Title and content are required', 'error');
        return;
      }

      this.submitting = true;
      try {
        const url = this.currentView === 'edit' 
          ? `${API_URL}/articles/${this.editingId}`
          : `${API_URL}/articles`;
        
        const method = this.currentView === 'edit' ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save article');
        }

        this.showAlert(
          this.currentView === 'edit' ? 'Article updated successfully' : 'Article created successfully',
          'success'
        );
        this.currentView = 'list';
        this.fetchArticles();
      } catch (error) {
        this.showAlert(error.message, 'error');
      } finally {
        this.submitting = false;
      }
    },
    
    confirmDelete(id) {
      this.articleToDelete = id;
      this.showDeleteModal = true;
    },
    
    async deleteArticle() {
      try {
        const response = await fetch(`${API_URL}/articles/${this.articleToDelete}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete article');
        }

        this.showAlert('Article deleted successfully', 'success');
        this.showDeleteModal = false;
        this.articleToDelete = null;
        
        if (this.currentView === 'view') {
          this.currentView = 'list';
        }
        
        this.fetchArticles();
      } catch (error) {
        this.showAlert(error.message, 'error');
      }
    },

    // File Upload Methods
    async uploadFile(file) {
      if (!this.selectedArticle) return;

      this.uploading = true;
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
          `${API_URL}/articles/${this.selectedArticle.id}/attachments`,
          {
            method: 'POST',
            body: formData
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to upload file');
        }

        this.showAlert('File uploaded successfully', 'success');
        this.showUploadModal = false;
        
        // Refresh article to show new attachment
        await this.viewArticle(this.selectedArticle.id);
      } catch (error) {
        this.showAlert(error.message, 'error');
      } finally {
        this.uploading = false;
      }
    },

    confirmDeleteAttachment(attachmentId) {
      this.attachmentToDelete = attachmentId;
      this.showDeleteAttachmentModal = true;
    },

    async deleteAttachment() {
      if (!this.selectedArticle || !this.attachmentToDelete) return;

      try {
        const response = await fetch(
          `${API_URL}/articles/${this.selectedArticle.id}/attachments/${this.attachmentToDelete}`,
          { method: 'DELETE' }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete attachment');
        }

        this.showAlert('Attachment deleted successfully', 'success');
        this.showDeleteAttachmentModal = false;
        this.attachmentToDelete = null;
        
        // Refresh article
        await this.viewArticle(this.selectedArticle.id);
      } catch (error) {
        this.showAlert(error.message, 'error');
      }
    },
    
    cancelForm() {
      this.currentView = 'list';
      this.form = { title: '', content: '' };
      this.editingId = null;
    },
    
    showAlert(message, type = 'success') {
      this.alert = { show: true, message, type };
      setTimeout(() => {
        this.alert.show = false;
      }, 4000);
    }
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
  width: 100%;
  position: relative;
}

header h1 {
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.connection-status {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-indicator.connected {
  background: #28a745;
}

.status-indicator.disconnected {
  background: #dc3545;
  animation: none;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

main {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  min-height: 70vh;
  width: 100%;
  max-width: 1200px;
}

.navigation {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
  justify-content: center;
}

.navigation button {
  padding: 12px 30px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  font-weight: 500;
}

.navigation button:hover {
  background: #f5f5f5;
}

.navigation button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.alert {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
  text-align: center;
}

.alert.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .connection-status {
    position: static;
    margin-top: 15px;
    justify-content: center;
  }
}
</style>