<template>
  <div class="comment-section">
    <h3>💬 Comments ({{ totalCommentCount }})</h3>

    <!-- Main comment form -->
    <CommentForm
      :article-id="articleId"
      @submit="handleAddComment"
    />

    <!-- Comments list -->
    <div v-if="comments.length === 0" class="no-comments">
      <p>No comments yet. Be the first to comment!</p>
    </div>

    <div v-else class="comments-list">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        @reply="handleReply"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <!-- Reply form (shown when replying) -->
    <div v-if="replyingTo" class="reply-form-container">
      <CommentForm
        :article-id="articleId"
        :parent-comment-id="replyingTo"
        :is-reply="true"
        @submit="handleAddReply"
        @cancel="replyingTo = null"
      />
    </div>
  </div>
</template>

<script>
import CommentForm from './CommentForm.vue';
import CommentItem from './CommentItem.vue';

export default {
  name: 'CommentSection',
  components: {
    CommentForm,
    CommentItem
  },
  props: {
    articleId: {
      type: String,
      required: true
    },
    initialComments: {
      type: Array,
      default: () => []
    }
  },
  emits: ['comment-added', 'comment-updated', 'comment-deleted'],
  data() {
    return {
      comments: this.initialComments,
      replyingTo: null
    };
  },
  computed: {
    totalCommentCount() {
      let count = this.comments.length;
      this.comments.forEach(comment => {
        if (comment.replies) {
          count += comment.replies.length;
          // Count nested replies
          comment.replies.forEach(reply => {
            if (reply.replies) {
              count += reply.replies.length;
            }
          });
        }
      });
      return count;
    }
  },
  watch: {
    initialComments(newComments) {
      this.comments = newComments;
    }
  },
  methods: {
    async handleAddComment(commentData) {
      try {
        const response = await fetch('http://localhost:3000/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(commentData)
        });

        if (!response.ok) throw new Error('Failed to add comment');

        const result = await response.json();
        this.$emit('comment-added', result);

        // Refresh comments
        await this.refreshComments();
      } catch (error) {
        console.error('Error adding comment:', error);
        alert('Failed to add comment');
      }
    },

    handleReply(commentId) {
      this.replyingTo = commentId;
      // Scroll to reply form
      this.$nextTick(() => {
        const replyForm = document.querySelector('.reply-form-container');
        if (replyForm) {
          replyForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    },

    async handleAddReply(commentData) {
      try {
        const response = await fetch('http://localhost:3000/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(commentData)
        });

        if (!response.ok) throw new Error('Failed to add reply');

        const result = await response.json();
        this.$emit('comment-added', result);

        // Clear reply form
        this.replyingTo = null;

        // Refresh comments
        await this.refreshComments();
      } catch (error) {
        console.error('Error adding reply:', error);
        alert('Failed to add reply');
      }
    },

    async handleEdit({ id, content }) {
      try {
        const response = await fetch(`http://localhost:3000/comments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        });

        if (!response.ok) throw new Error('Failed to update comment');

        const result = await response.json();
        this.$emit('comment-updated', result);

        // Refresh comments
        await this.refreshComments();
      } catch (error) {
        console.error('Error updating comment:', error);
        alert('Failed to update comment');
      }
    },

    async handleDelete(commentId) {
      if (!confirm('Are you sure you want to delete this comment?')) {
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/comments/${commentId}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete comment');

        this.$emit('comment-deleted', commentId);

        // Refresh comments
        await this.refreshComments();
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment');
      }
    },

    async refreshComments() {
      try {
        const response = await fetch(`http://localhost:3000/comments/article/${this.articleId}`);
        if (response.ok) {
          this.comments = await response.json();
        }
      } catch (error) {
        console.error('Error refreshing comments:', error);
      }
    }
  }
};
</script>

<style scoped>
.comment-section {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #e0e0e0;
}

.comment-section h3 {
  color: #333;
  margin-bottom: 25px;
  font-size: 1.5rem;
}

.no-comments {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  background: #f9f9f9;
  border-radius: 8px;
  margin: 20px 0;
}

.comments-list {
  margin-top: 20px;
}

.reply-form-container {
  margin-top: 20px;
  padding: 20px;
  background: #fff5e6;
  border-left: 4px solid #667eea;
  border-radius: 8px;
}
</style>