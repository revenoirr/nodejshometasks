<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <!-- List View -->
      <div v-if="currentView === 'list'">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-gray-800">Articles</h1>
          <button
            @click="currentView = 'create'"
            class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            New Article
          </button>
        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {{ error }}
        </div>

        <div v-if="loading" class="text-center py-12 text-gray-500">
          Loading...
        </div>

        <div v-else-if="articles.length === 0" class="text-center py-12 text-gray-500">
          No articles yet. Create your first article!
        </div>

        <div v-else class="grid gap-4">
          <div
            v-for="article in articles"
            :key="article.id"
            @click="fetchArticle(article.id)"
            class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div class="flex items-start gap-4">
              <svg class="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <div class="flex-1">
                <h2 class="text-xl font-semibold text-gray-800 mb-2">
                  {{ article.title }}
                </h2>
                <p class="text-sm text-gray-500">
                  Created: {{ formatDate(article.createdAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- View Article -->
      <div v-if="currentView === 'view'">
        <button
          @click="backToList"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to list
        </button>

        <article v-if="selectedArticle" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-4">
            {{ selectedArticle.title }}
          </h1>
          <p class="text-sm text-gray-500 mb-6">
            Created: {{ formatDate(selectedArticle.createdAt) }}
          </p>
          <div class="prose max-w-none" v-html="selectedArticle.content"></div>
        </article>
      </div>

      <!-- Create Article -->
      <div v-if="currentView === 'create'">
        <button
          @click="currentView = 'list'"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to list
        </button>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-6">Create New Article</h1>

          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {{ error }}
          </div>

          <div>
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                v-model="newArticle.title"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter article title"
              />
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <WysiwygEditor v-model="newArticle.content" />
            </div>

            <button
              @click="handleCreateArticle"
              :disabled="loading"
              class="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
              </svg>
              {{ loading ? 'Saving...' : 'Save Article' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import WysiwygEditor from './components/WysiwygEditor.vue';

export default {
  name: 'ArticleManager',
  components: {
    WysiwygEditor
  },
  setup() {
    const API_URL = 'http://localhost:3000/api';
    
    const articles = ref([]);
    const currentView = ref('list');
    const selectedArticle = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const newArticle = ref({
      title: '',
      content: ''
    });

    const fetchArticles = async () => {
      try {
        loading.value = true;
        error.value = null;
        const response = await fetch(`${API_URL}/articles`);
        if (!response.ok) throw new Error('Failed to fetch articles');
        const data = await response.json();
        articles.value = data;
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const fetchArticle = async (id) => {
      try {
        loading.value = true;
        error.value = null;
        const response = await fetch(`${API_URL}/articles/${id}`);
        if (!response.ok) throw new Error('Failed to fetch article');
        const data = await response.json();
        selectedArticle.value = data;
        currentView.value = 'view';
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const handleCreateArticle = async () => {
      if (!newArticle.value.title.trim() || !newArticle.value.content.trim()) {
        error.value = 'Title and content are required';
        return;
      }

      try {
        loading.value = true;
        error.value = null;
        const response = await fetch(`${API_URL}/articles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newArticle.value),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create article');
        }
        
        newArticle.value = { title: '', content: '' };
        currentView.value = 'list';
        await fetchArticles();
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const backToList = () => {
      currentView.value = 'list';
      selectedArticle.value = null;
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString();
    };

    onMounted(() => {
      fetchArticles();
    });

    return {
      articles,
      currentView,
      selectedArticle,
      loading,
      error,
      newArticle,
      fetchArticles,
      fetchArticle,
      handleCreateArticle,
      backToList,
      formatDate
    };
  }
};
</script>

<style scoped>
.prose {
  line-height: 1.75;
}

.prose h2 {
  font-size: 1.5em;
  font-weight: 700;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.prose h3 {
  font-size: 1.25em;
  font-weight: 600;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.prose p {
  margin-bottom: 1em;
}

.prose ul {
  list-style-type: disc;
  margin-left: 1.5em;
  margin-bottom: 1em;
}

.prose strong {
  font-weight: 700;
}

.prose em {
  font-style: italic;
}

.prose u {
  text-decoration: underline;
}
</style>