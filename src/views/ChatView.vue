<template>
  <div class="flex flex-col h-screen overflow-hidden bg-black text-white">
    <!-- Scrollable message area -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6">
      <MessageThread :messages="messages" />
    </div>

    <!-- Fixed input bar -->
    <div class="shrink-0 border-t border-purple-800 bg-black/30 backdrop-blur-md">
      <MessageInput @send="handleSend" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MessageThread from '../components/MessageThread.vue'
import MessageInput from '../components/MessageInput.vue'

const messages = ref([
  { role: 'assistant', content: 'Welcome to HelioSynth. Speak your inner world…' }
])

const handleSend = (userMessage) => {
  messages.value.push({ role: 'user', content: userMessage })

  // Optional: auto-reply for test
  setTimeout(() => {
    messages.value.push({ role: 'assistant', content: `You said: "${userMessage}"` })
  }, 500)
}
</script>

