<template>
  <div class="flex flex-col h-screen overflow-hidden bg-black text-white">
    <!-- Chat thread -->
    <div ref="scrollArea" class="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6">
      <MessageThread :messages="messages" />
    </div>

    <!-- Input bar -->
    <div class="shrink-0 border-t border-purple-800 bg-black/30 backdrop-blur-md">
      <MessageInput @send="handleSend" />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import MessageThread from '../components/MessageThread.vue'
import MessageInput from '../components/MessageInput.vue'
import { fetchAIResponse } from '../lib/openai.js'

const messages = ref([
  { role: 'assistant', content: 'Welcome to HelioSynth. Speak your inner world…' }
])

const scrollArea = ref(null)

const scrollToBottom = () => {
  nextTick(() => {
    scrollArea.value?.scrollTo({
      top: scrollArea.value.scrollHeight,
      behavior: 'smooth'
    })
  })
}

const handleSend = async (userMessage) => {
  messages.value.push({ role: 'user', content: userMessage })
  scrollToBottom()

  const placeholder = { role: 'assistant', content: '' }
  messages.value.push(placeholder)
  scrollToBottom()

  const fullReply = await fetchAIResponse([...messages.value.slice(0, -1)])

  for (let i = 0; i < fullReply.length; i++) {
    placeholder.content = fullReply.slice(0, i + 1)
    await new Promise(resolve => setTimeout(resolve, 15))
    scrollToBottom()
  }
}
</script>

