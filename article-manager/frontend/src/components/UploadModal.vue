<template>
  <div v-if="show" class="modal-overlay" @click="$emit('cancel')">
    <div class="modal" @click.stop>
      <h3>Upload Attachment</h3>
      <p class="modal-description">
        Upload images (JPG, PNG, GIF, WEBP) or PDF files. Maximum file size: 10MB.
      </p>

      <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop">
        <input 
          type="file" 
          ref="fileInput"
          @change="handleFileSelect"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,image/*,application/pdf"
          class="file-input"
        />
        <div v-if="!selectedFile" class="upload-placeholder" @click="$refs.fileInput.click()">
          <div class="upload-icon">📎</div>
          <div class="upload-text">
            <strong>Click to browse</strong> or drag and drop
          </div>
          <div class="upload-hint">JPG, PNG, GIF, WEBP, PDF (max 10MB)</div>
        </div>
        <div v-else class="file-selected">
          <div class="file-preview">
            <img v-if="previewUrl" :src="previewUrl" alt="Preview" />
            <div v-else class="file-icon-large">📄</div>
          </div>
          <div class="file-info">
            <div class="file-name">{{ selectedFile.name }}</div>
            <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
          </div>
          <button @click="clearFile" class="btn-clear">Change File</button>
        </div>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>

      <div class="modal-actions">
        <button 
          @click="handleUpload" 
          class="btn-upload" 
          :disabled="!selectedFile || uploading"
        >
          {{ uploading ? 'Uploading...' : 'Upload' }}
        </button>
        <button @click="handleCancel" class="btn-cancel" :disabled="uploading">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UploadModal',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    uploading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['upload', 'cancel'],
  data() {
    return {
      selectedFile: null,
      previewUrl: null,
      error: null
    };
  },
  watch: {
    show(newVal) {
      if (!newVal) {
        this.clearFile();
      }
    }
  },
  methods: {
    handleFileSelect(event) {
      const file = event.target.files[0];
      this.validateAndSetFile(file);
    },
    handleDrop(event) {
      const file = event.dataTransfer.files[0];
      this.validateAndSetFile(file);
    },
    validateAndSetFile(file) {
      if (!file) return;

      this.error = null;

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.error = 'File size must be less than 10MB';
        return;
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 
        'image/gif', 'image/webp', 'application/pdf'
      ];
      if (!allowedTypes.includes(file.type)) {
        this.error = 'Invalid file type. Only images and PDFs are allowed.';
        return;
      }

      this.selectedFile = file;

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.previewUrl = null;
      }
    },
    clearFile() {
      this.selectedFile = null;
      this.previewUrl = null;
      this.error = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },
    handleUpload() {
      if (this.selectedFile) {
        this.$emit('upload', this.selectedFile);
      }
    },
    handleCancel() {
      this.clearFile();
      this.$emit('cancel');
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
  }
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
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}

.modal h3 {
  margin-bottom: 10px;
  color: #333;
}

.modal-description {
  margin-bottom: 20px;
  color: #666;
  font-size: 0.9rem;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #667eea;
  background: #f9f9ff;
}

.file-input {
  display: none;
}

.upload-placeholder {
  cursor: pointer;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.upload-text {
  margin-bottom: 8px;
  color: #333;
}

.upload-hint {
  font-size: 0.85rem;
  color: #999;
}

.file-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.file-preview {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon-large {
  font-size: 4rem;
}

.file-info {
  text-align: center;
}

.file-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
  word-break: break-word;
}

.file-size {
  font-size: 0.9rem;
  color: #999;
}

.btn-clear {
  background: #6c757d;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-clear:hover {
  background: #5a6268;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-upload {
  background: #28a745;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-upload:hover:not(:disabled) {
  background: #218838;
}

.btn-upload:disabled {
  background: #6c757d;
  cursor: not-allowed;
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

.btn-cancel:hover:not(:disabled) {
  background: #5a6268;
}

.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>