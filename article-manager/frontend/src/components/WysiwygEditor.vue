<template>
  <div class="border rounded-lg overflow-hidden">
    <div class="bg-gray-100 border-b p-2 flex gap-2 flex-wrap">
      <button
        @click="execCommand('bold')"
        type="button"
        class="px-3 py-1 bg-white border rounded hover:bg-gray-50"
      >
        <strong>B</strong>
      </button>
      <button
        @click="execCommand('italic')"
        type="button"
        class="px-3 py-1 bg-white border rounded hover:bg-gray-50"
      >
        <em>I</em>
      </button>
      <button
        @click="execCommand('underline')"
        type="button"
        class="px-3 py-1 bg-white border rounded hover:bg-gray-50"
      >
        <u>U</u>
      </button>
      <button
        @click="execCommand('formatBlock', '<h2>')"
        type="button"
        class="px-3 py-1 bg-white border rounded hover:bg-gray-50"
      >
        H2
      </button>
      <button
        @click="execCommand('formatBlock', '<h3>')"
        type="button"
        class="px-3 py-1 bg-white border rounded hover:bg-gray-50"
      >
        H3
      </button>
      <button
        @click="execCommand('insertUnorderedList')"
        type="button"
        class="px-3 py-1 bg-white border rounded hover:bg-gray-50"
      >
        • List
      </button>
      <button
        @click="toggleMode"
        type="button"
        class="px-3 py-1 bg-white border rounded hover:bg-gray-50 ml-auto"
      >
        {{ mode === 'visual' ? 'HTML' : 'Visual' }}
      </button>
    </div>
    
    <div
      v-if="mode === 'visual'"
      ref="editor"
      contenteditable="true"
      class="p-4 min-h-[300px] focus:outline-none"
      @input="handleInput"
      v-html="modelValue"
    ></div>
    
    <textarea
      v-else
      :value="modelValue"
      @input="handleTextareaInput"
      class="w-full p-4 min-h-[300px] font-mono text-sm focus:outline-none"
    ></textarea>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'WysiwygEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const mode = ref('visual');
    const editor = ref(null);

    const execCommand = (command, value = null) => {
      document.execCommand(command, false, value);
    };

    const handleInput = (event) => {
      emit('update:modelValue', event.target.innerHTML);
    };

    const handleTextareaInput = (event) => {
      emit('update:modelValue', event.target.value);
    };

    const toggleMode = () => {
      mode.value = mode.value === 'visual' ? 'html' : 'visual';
    };

    return {
      mode,
      editor,
      execCommand,
      handleInput,
      handleTextareaInput,
      toggleMode
    };
  }
};
</script>