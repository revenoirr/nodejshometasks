<template>
  <transition-group name="notification" tag="div" class="notification-container">
    <div 
      v-for="notification in notifications" 
      :key="notification.id"
      :class="['notification-toast', `notification-${notification.type}`]"
      @click="removeNotification(notification.id)"
    >
      <div class="notification-icon">
        <span v-if="notification.type === 'article_created'">✨</span>
        <span v-else-if="notification.type === 'article_updated'">📝</span>
        <span v-else-if="notification.type === 'article_deleted'">🗑️</span>
        <span v-else-if="notification.type === 'file_attached'">📎</span>
        <span v-else-if="notification.type === 'file_deleted'">❌</span>
        <span v-else>🔔</span>
      </div>
      <div class="notification-content">
        <div class="notification-message">{{ notification.message }}</div>
        <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
      </div>
      <button class="notification-close" @click.stop="removeNotification(notification.id)">×</button>
    </div>
  </transition-group>
</template>

<script>
export default {
  name: 'NotificationToast',
  props: {
    notifications: {
      type: Array,
      required: true
    }
  },
  emits: ['remove'],
  methods: {
    removeNotification(id) {
      this.$emit('remove', id);
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  }
};
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

.notification-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #667eea;
  cursor: pointer;
  transition: all 0.3s;
}

.notification-toast:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  transform: translateX(-5px);
}

.notification-article_created {
  border-left-color: #28a745;
}

.notification-article_updated {
  border-left-color: #ffc107;
}

.notification-article_deleted {
  border-left-color: #dc3545;
}

.notification-file_attached {
  border-left-color: #17a2b8;
}

.notification-file_deleted {
  border-left-color: #dc3545;
}

.notification-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  word-wrap: break-word;
}

.notification-time {
  font-size: 0.75rem;
  color: #999;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: color 0.3s;
}

.notification-close:hover {
  color: #333;
}

/* Animations */
.notification-enter-active {
  animation: slideIn 0.3s ease-out;
}

.notification-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .notification-container {
    left: 20px;
    right: 20px;
    max-width: none;
  }
}
</style>