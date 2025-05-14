<template>
  <div class="p-4">
    <form @submit.prevent="emitMessage" class="flex items-center gap-4">
      <input
          v-model="input"
          type="text"
          class="flex-1 px-4 py-2 rounded-md bg-purple-950 text-white placeholder-purple-400"
          placeholder="Speak or type your inner world..."
      />
      <button type="submit" class="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded">
        ➤
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const input = ref('')
const emit = defineEmits(['send'])

const emitMessage = () => {
  if (input.value.trim() !== '') {
    emit('send', input.value.trim())
    input.value = ''
  }
}
</script>

