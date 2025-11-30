<template>
  <div class="article-form">
    <div class="form-container">
      <button @click="$emit('cancel')" class="btn-back">← Cancel</button>
      <h2>{{ isEditing ? 'Edit Article' : 'Create New Article' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="title">Title *</label>
          <input 
            id="title"
            v-model="localForm.title" 
            type="text" 
            placeholder="Enter article title"
            required
            maxlength="200"
          />
        </div>
        <div class="form-group">
          <label for="workspace">Workspace</label>
          <WorkspaceSelector
            :workspaces="workspaces"
            v-model="localForm.workspaceId"
            :show-label="false"
          />
        </div>
        <div class="form-group">
          <label for="content">Content *</label>
          <div class="editor-toolbar">
            <button type="button" @click="formatText('bold')" title="Bold">
              <strong>B</strong>
            </button>
            <button type="button" @click="formatText('italic')" title="Italic">
              <em>I</em>
            </button>
            <button type="button" @click="formatText('underline')" title="Underline">
              <u>U</u>
            </button>
            <button type="button" @click="formatText('insertUnorderedList')" title="Bullet List">
              • List
            </button>
            <button type="button" @click="formatText('formatBlock', 'h2')" title="Heading">
              H2
            </button>
          </div>
          <div 
            ref="editor"
            class="wysiwyg-editor" 
            contenteditable="true"
            @input="updateContent"
            @paste="handlePaste"
          ></div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-submit" :disabled="submitting">
            {{ submitting ? 'Saving...' : (isEditing ? 'Update Article' : 'Create Article') }}
          </button>
          <button type="button" @click="$emit('cancel')" class="btn-cancel">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import WorkspaceSelector from './WorkspaceSelector.vue';

export default {
  name: 'ArticleForm',
  components: {
    WorkspaceSelector
  },
  props: {
    initialData: {
      type: Object,
      default: () => ({ title: '', content: '' })
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    submitting: {
      type: Boolean,
      default: false
    },
    workspaces: {
      type: Array,
      default: () => []
    }
  },
  emits: ['submit', 'cancel'],
  data() {
    return {
      localForm: {
        title: this.initialData.title || '',
        content: this.initialData.content || '',
        workspaceId: this.initialData.workspaceId || ''
      }
    };
  },
  watch: {
    initialData: {
      handler(newData) {
        this.localForm = {
          title: newData.title || '',
          content: newData.content || '',
          workspaceId: newData.workspaceId || ''
        };
        this.$nextTick(() => {
          if (this.$refs.editor) {
            this.$refs.editor.innerHTML = newData.content || '';
          }
        });
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    if (this.$refs.editor) {
      this.$refs.editor.innerHTML = this.localForm.content;
    }
  },
  methods: {
    formatText(command, value = null) {
      document.execCommand(command, false, value);
      this.$refs.editor.focus();
    },
    
    updateContent() {
      this.localForm.content = this.$refs.editor.innerHTML;
    },
    
    handlePaste(e) {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    },
    
    handleSubmit() {
      if (!this.localForm.title.trim() || !this.localForm.content.trim()) {
        return;
      }
      this.$emit('submit', { 
        title: this.localForm.title,
        content: this.localForm.content,
        workspaceId: this.localForm.workspaceId || null
      });
    }
  }
};
</script>

<style scoped>
.article-form {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.form-container {
  background: #f9f9f9;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

h2 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
  font-size: 2rem;
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

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.editor-toolbar {
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px 6px 0 0;
}

.editor-toolbar button {
  padding: 8px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.editor-toolbar button:hover {
  background: #e9ecef;
}

.wysiwyg-editor {
  min-height: 400px;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 0 0 6px 6px;
  background: white;
  line-height: 1.6;
  color: #333;
  font-size: 1rem;
}

.wysiwyg-editor:focus {
  outline: none;
  border-color: #667eea;
}

.wysiwyg-editor:empty:before {
  content: "Start writing your article here...";
  color: #999;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 30px;
}

.btn-submit {
  background: #28a745;
  color: white;
  padding: 12px 30px;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-submit:hover:not(:disabled) {
  background: #218838;
}

.btn-submit:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-cancel {
  background: #6c757d;
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel:hover {
  background: #5a6268;
}
</style>