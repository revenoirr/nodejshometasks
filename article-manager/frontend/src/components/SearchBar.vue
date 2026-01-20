<template>
  <div class="search-bar">
    <div class="search-input-wrapper">
      <span class="search-icon">🔍</span>
      <input
        v-model="searchQuery"
        @input="onSearchInput"
        @focus="showSuggestions = true"
        @blur="hideSuggestionsDelayed"
        type="text"
        placeholder="Search articles by title or content..."
        class="search-input"
      />
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="clear-button"
        title="Clear search"
      >
        ✕
      </button>
    </div>

    <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
      <div
        v-for="suggestion in suggestions"
        :key="suggestion.id"
        @mousedown.prevent="selectSuggestion(suggestion)"
        class="suggestion-item"
      >
        <span class="suggestion-icon">📄</span>
        <span class="suggestion-title">{{ suggestion.title }}</span>
      </div>
    </div>

    <div v-if="searching" class="search-status">
      Searching...
    </div>
    <div v-else-if="hasSearched && searchResults.length === 0" class="search-status no-results">
      No results found for "{{ lastSearchQuery }}"
    </div>
    <div v-else-if="hasSearched && searchResults.length > 0" class="search-status">
      Found {{ searchResults.length }} result{{ searchResults.length !== 1 ? 's' : '' }} for "{{ lastSearchQuery }}"
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  props: {
    searching: {
      type: Boolean,
      default: false
    },
    searchResults: {
      type: Array,
      default: () => []
    },
    hasSearched: {
      type: Boolean,
      default: false
    },
    lastSearchQuery: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      searchQuery: '',
      suggestions: [],
      showSuggestions: false,
      debounceTimer: null,
      suggestionTimer: null
    };
  },
  methods: {
    onSearchInput() {
      // Clear previous timers
      clearTimeout(this.debounceTimer);
      clearTimeout(this.suggestionTimer);

      const query = this.searchQuery.trim();

      if (!query) {
        this.$emit('clear-search');
        this.suggestions = [];
        return;
      }

      // Debounce search (500ms)
      this.debounceTimer = setTimeout(() => {
        if (query.length >= 2) {
          this.$emit('search', query);
        }
      }, 500);

      // Fetch suggestions (300ms)
      if (query.length >= 2) {
        this.suggestionTimer = setTimeout(() => {
          this.fetchSuggestions(query);
        }, 300);
      } else {
        this.suggestions = [];
      }
    },

    async fetchSuggestions(query) {
      try {
        const response = await fetch(
          `http://localhost:3000/search/suggestions?q=${encodeURIComponent(query)}`,
          {
            headers: this.getAuthHeaders()
          }
        );

        if (response.ok) {
          this.suggestions = await response.json();
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    },

    selectSuggestion(suggestion) {
      this.searchQuery = suggestion.title;
      this.showSuggestions = false;
      this.$emit('search', suggestion.title);
      this.$emit('select-article', suggestion.id);
    },

    clearSearch() {
      this.searchQuery = '';
      this.suggestions = [];
      this.$emit('clear-search');
    },

    hideSuggestionsDelayed() {
      setTimeout(() => {
        this.showSuggestions = false;
      }, 200);
    },

    getAuthHeaders() {
      const token = localStorage.getItem('jwt_token');
      return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
  },
  beforeUnmount() {
    clearTimeout(this.debounceTimer);
    clearTimeout(this.suggestionTimer);
  }
};
</script>

<style scoped>
.search-bar {
  position: relative;
  margin-bottom: 20px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.3s;
}

.search-input-wrapper:focus-within {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.search-icon {
  font-size: 1.2rem;
  margin-right: 10px;
  color: #999;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  color: #333;
}

.search-input::placeholder {
  color: #aaa;
}

.clear-button {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px 8px;
  transition: color 0.3s;
}

.clear-button:hover {
  color: #333;
}

.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 100;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.suggestion-item:hover {
  background: #f8f9fa;
}

.suggestion-icon {
  margin-right: 10px;
  font-size: 1.1rem;
}

.suggestion-title {
  color: #333;
  font-size: 0.95rem;
}

.search-status {
  margin-top: 12px;
  padding: 8px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

.search-status.no-results {
  background: #fff3e0;
  color: #e65100;
}

@media (max-width: 768px) {
  .search-input-wrapper {
    padding: 10px 14px;
  }

  .search-input {
    font-size: 0.9rem;
  }
}
</style>