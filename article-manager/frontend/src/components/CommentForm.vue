<template>
  <div class="comment-form">
    <h4>{{ isReply ? 'Add Reply' : 'Add Comment' }}</h4>
    <form @submit.prevent="handleSubmit">
      <div class="form-row">
        <div class="form-group">
          <input 
            v-model="form.authorName" 
            type="text" 
            placeholder="Your name *"
            required
            maxlength="100"
          />
        </div>
        <div class="form-group">
          <input 
            v-model="form.authorEmail" 
            type="email" 
            placeholder="Your email (optional)"
            maxlength="255"
          />
        </div>
      </div>
      <div class="form-group">
        <textarea 
          v-model="form.content" 
          placeholder="Write your comment..."
          rows="4"
          required
        ></textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-submit" :disabled="submitting">
          {{ submitting ? 'Posting...' : (isReply ? 'Post Reply' : 'Post Comment') }}
        </button>
        <button 
          v-if="isReply" 
          type="button" 
          class="btn-cancel" 
          @click="$emit('cancel')"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'CommentForm',
  props: {
    articleId: {
      type: String,
      required: true
    },
    parentCommentId: {
      type: String,
      default: null
    },
    isReply: {
      type: Boolean,
      default: false
    }
  },
  emits: ['submit', 'cancel'],
  data() {
    return {
      form: {
        authorName: '',
        authorEmail: '',
        content: ''
      },
      submitting: false
    };
  },
  methods: {
    async handleSubmit() {
      // Валидация
      if (!this.form.authorName.trim() || !this.form.content.trim()) {
        alert('Name and comment are required');
        return;
      }

      this.submitting = true;

      try {
        const commentData = {
          articleId: this.articleId,
          authorName: this.form.authorName.trim(),
          content: this.form.content.trim(),
          // Если email пустой, не отправляем его вообще (а не null)
          ...(this.form.authorEmail && this.form.authorEmail.trim() && { 
            authorEmail: this.form.authorEmail.trim() 
          }),
          ...(this.parentCommentId && { parentCommentId: this.parentCommentId })
        };

        // Отправляем данные напрямую здесь вместо emit
        const response = await fetch('http://localhost:3000/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(commentData)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to post comment');
        }

        const result = await response.json();
        
        // Сбрасываем форму только после успешной отправки
        this.form = {
          authorName: '',
          authorEmail: '',
          content: ''
        };

        // Уведомляем родителя об успехе
        this.$emit('submit', result);

      } catch (error) {
        console.error('Error posting comment:', error);
        alert(error.message || 'Failed to post comment. Please try again.');
      } finally {
        this.submitting = false;
      }
    }
  }
};
</script>

<style scoped>
.comment-form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.comment-form h4 {
  margin-bottom: 15px;
  color: #333;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.btn-submit {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.btn-submit:hover:not(:disabled) {
  background: #5568d3;
}

.btn-submit:disabled {
  background: #999;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.btn-cancel:hover {
  background: #5a6268;
}
</style>