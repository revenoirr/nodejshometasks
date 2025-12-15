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

      <!-- Workspace selector только для списка статей -->
      <WorkspaceSelector 
        v-if="currentView === 'list'"
        :workspaces="workspaces"
        v-model="selectedWorkspaceId"
        @change="handleWorkspaceChange"
      />

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
        @back="backToList"
        @edit="editArticle"
        @delete="confirmDelete"
        @upload="showUploadModal = true"
        @delete-attachment="confirmDeleteAttachment"
        @refresh="refreshCurrentArticle"
        @load-version="loadArticleVersion"
      />

      <ArticleForm
        v-if="currentView === 'create' || currentView === 'edit'"
        :initial-data="form"
        :workspaces="workspaces"
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
import WorkspaceSelector from './components/WorkspaceSelector.vue';

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
    NotificationToast,
    WorkspaceSelector
  },
  data() {
    return {
      currentView: 'list',
      articles: [],
      selectedArticle: null,
      workspaces: [],
      selectedWorkspaceId: '',
      form: {
        title: '',
        content: '',
        workspaceId: ''
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
    this.fetchWorkspaces();
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
              
              // Handle workspace-related events
              if (['workspace_created', 'workspace_updated', 'workspace_deleted'].includes(data.type)) {
                this.fetchWorkspaces();
              }
              
              // Handle article events
              if (this.currentView === 'list' && 
                  ['article_created', 'article_deleted', 'article_updated'].includes(data.type)) {
                this.fetchArticles();
              }
              
              // Handle article view updates
              if (this.currentView === 'view' && 
                  this.selectedArticle && 
                  data.data && 
                  data.data.articleId === this.selectedArticle.id) {
                this.refreshCurrentArticle();
              }
              
              // Handle comment events
              if (['comment_added', 'comment_updated', 'comment_deleted'].includes(data.type)) {
                if (this.currentView === 'view' && this.selectedArticle) {
                  this.refreshCurrentArticle();
                }
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

    async fetchWorkspaces() {
      try {
        const response = await fetch(`${API_URL}/workspaces`);
        if (!response.ok) throw new Error('Failed to fetch workspaces');
        this.workspaces = await response.json();
      } catch (error) {
        console.error('Error fetching workspaces:', error);
        this.showAlert('Failed to load workspaces', 'error');
      }
    },

    handleWorkspaceChange(workspaceId) {
      // Обновляем selectedWorkspaceId и загружаем статьи для выбранного workspace
      this.selectedWorkspaceId = workspaceId;
      this.fetchArticles();
    },

    async fetchArticles() {
      this.loading = true;
      try {
        // Строим URL с фильтром по workspace если выбран
        let url = `${API_URL}/articles`;
        if (this.selectedWorkspaceId) {
          url += `?workspaceId=${this.selectedWorkspaceId}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch articles');
        this.articles = await response.json();
      } catch (error) {
        console.error('Error fetching articles:', error);
        this.showAlert('Failed to load articles', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    async viewArticle(id, versionNumber = null) {
      this.loading = true;
      this.currentView = 'view';
      try {
        const url = versionNumber 
          ? `${API_URL}/articles/${id}?version=${versionNumber}`
          : `${API_URL}/articles/${id}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Article not found');
        this.selectedArticle = await response.json();
      } catch (error) {
        console.error('Error loading article:', error);
        this.showAlert('Failed to load article', 'error');
        this.currentView = 'list';
      } finally {
        this.loading = false;
      }
    },

    async loadArticleVersion(articleId, versionNumber) {
      await this.viewArticle(articleId, versionNumber);
    },

    async refreshCurrentArticle() {
      if (this.selectedArticle) {
        const versionToLoad = this.selectedArticle.isCurrentVersion 
          ? null 
          : this.selectedArticle.currentVersion;
        
        await this.viewArticle(this.selectedArticle.id, versionToLoad);
      }
    },

    backToList() {
      this.currentView = 'list';
      // Перезагружаем список статей с текущим фильтром
      this.fetchArticles();
    },
    
    showCreateForm() {
      this.currentView = 'create';
      this.form = { 
        title: '', 
        content: '', 
        workspaceId: this.selectedWorkspaceId || '' // Используем текущий workspace если выбран
      };
      this.editingId = null;
    },
    
    async editArticle(id) {
      this.loading = true;
      try {
        const response = await fetch(`${API_URL}/articles/${id}`);
        if (!response.ok) throw new Error('Article not found');
        const article = await response.json();
        
        if (!article.isCurrentVersion) {
          this.showAlert('You can only edit the current version of an article', 'error');
          return;
        }
        
        this.form = {
          title: article.title,
          content: article.content,
          workspaceId: article.workspace ? article.workspace.id : ''
        };
        this.editingId = id;
        this.currentView = 'edit';
      } catch (error) {
        console.error('Error loading article for editing:', error);
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

        const result = await response.json();
        
        const message = this.currentView === 'edit' 
          ? `Article updated successfully (Version ${result.version} created)`
          : 'Article created successfully';
        
        this.showAlert(message, 'success');
        this.currentView = 'list';
        // Сбрасываем фильтр workspace при возврате к списку
        this.selectedWorkspaceId = '';
        this.fetchArticles();
      } catch (error) {
        console.error('Error saving article:', error);
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

        this.showAlert('Article deleted successfully (all versions removed)', 'success');
        this.showDeleteModal = false;
        this.articleToDelete = null;
        
        if (this.currentView === 'view') {
          this.currentView = 'list';
        }
        
        this.fetchArticles();
      } catch (error) {
        console.error('Error deleting article:', error);
        this.showAlert(error.message, 'error');
      }
    },

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
        
        await this.refreshCurrentArticle();
      } catch (error) {
        console.error('Error uploading file:', error);
        this.showAlert(error.message, 'error');
      } finally {
        this.uploading = false;
      }
    },

    confirmDeleteAttachment(articleId, attachmentId) {
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
        
        await this.refreshCurrentArticle();
      } catch (error) {
        console.error('Error deleting attachment:', error);
        this.showAlert(error.message, 'error');
      }
    },
    
    cancelForm() {
      this.currentView = 'list';
      this.form = { title: '', content: '', workspaceId: '' };
      this.editingId = null;
      this.fetchArticles();
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