<template>
  <div id="app">
    <header>
      <h1>📝 Article Management System</h1>
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
    </main>
  </div>
</template>

<script>
import ArticleList from './components/ArticleList.vue';
import ArticleView from './components/ArticleView.vue';
import ArticleForm from './components/ArticleForm.vue';
import DeleteModal from './components/DeleteModal.vue';

const API_URL = 'http://localhost:3000';

export default {
  name: 'App',
  components: {
    ArticleList,
    ArticleView,
    ArticleForm,
    DeleteModal
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
      alert: {
        show: false,
        message: '',
        type: 'success'
      },
      showDeleteModal: false,
      articleToDelete: null,
      editingId: null
    };
  },
  mounted() {
    this.fetchArticles();
  },
  methods: {
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
}

header h1 {
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
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
</style>