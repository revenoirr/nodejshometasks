<template>
  <div v-if="show" class="modal-overlay" @click="$emit('cancel')">
    <div class="modal" @click.stop>
      <h3>Confirm Delete</h3>
      <p>Are you sure you want to delete this article? This action cannot be undone.</p>
      <div class="modal-actions">
        <button @click="$emit('confirm')" class="btn-delete">Yes, Delete</button>
        <button @click="$emit('cancel')" class="btn-cancel">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeleteModal',
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  emits: ['confirm', 'cancel']
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}

.modal h3 {
  margin-bottom: 15px;
  color: #333;
}

.modal p {
  margin-bottom: 25px;
  color: #666;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-delete {
  background: #dc3545;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-delete:hover {
  background: #c82333;
}

.btn-cancel {
  background: #6c757d;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-cancel:hover {
  background: #5a6268;
}
</style>