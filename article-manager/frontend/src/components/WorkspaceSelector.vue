<template>
  <div class="workspace-selector">
    <label v-if="showLabel">Workspace</label>
    <div class="selector-container">
      <select 
        v-model="selectedWorkspace" 
        @change="handleChange"
        class="workspace-select"
      >
        <option value="">All Workspaces</option>
        <option 
          v-for="workspace in workspaces" 
          :key="workspace.id" 
          :value="workspace.id"
        >
          {{ workspace.icon }} {{ workspace.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkspaceSelector',
  props: {
    workspaces: {
      type: Array,
      required: true
    },
    modelValue: {
      type: String,
      default: ''
    },
    showLabel: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      selectedWorkspace: this.modelValue
    };
  },
  watch: {
    modelValue(newVal) {
      this.selectedWorkspace = newVal;
    }
  },
  methods: {
    handleChange() {
      this.$emit('update:modelValue', this.selectedWorkspace);
      this.$emit('change', this.selectedWorkspace);
    }
  }
};
</script>

<style scoped>
.workspace-selector {
  margin-bottom: 20px;
}

.workspace-selector label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.selector-container {
  position: relative;
}

.workspace-select {
  width: 100%;
  padding: 12px 40px 12px 12px;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  appearance: none;
  transition: all 0.3s;
}

.workspace-select:hover {
  border-color: #667eea;
}

.workspace-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.workspace-select option {
  padding: 10px;
}


.selector-container::after {
  content: '▼';
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #666;
  font-size: 0.8rem;
}
</style>