<template>
  <div class="comment-item" :class="{ 'is-reply': isReply }">
    <div class="comment-header">
      <div class="comment-author">
        <div class="author-avatar">{{ authorInitial }}</div>
        <div class="author-info">
          <span class="author-name">{{ comment.authorName }}</span>
          <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
          <span v-if="comment.isEdited" class="edited-badge">(edited)</span>
        </div>
      </div>
      <div class="comment-actions">
        <button 
          @click="$emit('reply', comment.id)" 
          class="btn-action"
          title="Reply"
        >
          💬 Reply
        </button>
        <button 
          @click="toggleEdit" 
          class="btn-action"
          title="Edit"
        >
          ✏️
        </button>
        <button 
          @click="$emit('delete', comment.id)" 
          class="btn-action btn-delete"
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>

    <div class="comment-content">
      <div v-if="!editing" class="content-text">
        {{ comment.content }}
      </div>
      <div v-else class="edit-form">
        <textarea 
          v-model="editedContent" 
          rows="3"
          class="edit-textarea"
        ></textarea>
        <div class="edit-actions">
          <button @click="saveEdit" class="btn-save">Save</button>
          <button @click="cancelEdit" class="btn-cancel">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Nested replies -->
    <div v-if="comment.replies && comment.replies.length > 0" class="replies">
      <CommentItem
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        :is-reply="true"
        @reply="$emit('reply', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommentItem',
  props: {
    comment: {
      type: Object,
      required: true
    },
    isReply: {
      type: Boolean,
      default: false
    }
  },
  emits: ['reply', 'edit', 'delete'],
  data() {
    return {
      editing: false,
      editedContent: this.comment.content
    };
  },
  computed: {
    authorInitial() {
      return this.comment.authorName.charAt(0).toUpperCase();
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    toggleEdit() {
      this.editing = !this.editing;
      this.editedContent = this.comment.content;
    },
    saveEdit() {
      if (this.editedContent.trim()) {
        this.$emit('edit', {
          id: this.comment.id,
          content: this.editedContent
        });
        this.editing = false;
      }
    },
    cancelEdit() {
      this.editing = false;
      this.editedContent = this.comment.content;
    }
  }
};
</script>

<style scoped>
.comment-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.comment-item.is-reply {
  margin-left: 40px;
  background: #f9f9f9;
  border-left: 3px solid #667eea;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.comment-author {
  display: flex;
  gap: 12px;
  align-items: center;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.comment-date {
  font-size: 0.85rem;
  color: #999;
}

.edited-badge {
  font-size: 0.8rem;
  color: #666;
  font-style: italic;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.btn-action:hover {
  background: #f5f5f5;
  border-color: #667eea;
}

.btn-action.btn-delete:hover {
  background: #fee;
  border-color: #dc3545;
}

.comment-content {
  color: #444;
  line-height: 1.6;
  font-size: 0.95rem;
}

.content-text {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.edit-form {
  margin-top: 10px;
}

.edit-textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
}

.edit-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.btn-save {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-save:hover {
  background: #218838;
}

.btn-cancel {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-cancel:hover {
  background: #5a6268;
}

.replies {
  margin-top: 15px;
}
</style>