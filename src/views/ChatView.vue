<template>
  <div class="flex flex-col h-screen overflow-hidden bg-black text-white">
    <!-- Voice Selector -->
    <div class="flex justify-center space-x-3 p-3 border-b border-purple-900 bg-black/40 backdrop-blur-md">
      <div
          v-for="(voice, key) in voices"
          :key="key"
          class="relative flex flex-col items-center group transition-all duration-300"
      >
        <button
            @click="selectVoice(key)"
            :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            currentVoice === key
              ? 'bg-purple-700 text-white shadow-md'
              : 'bg-purple-900 text-purple-300 hover:bg-purple-800'
          ]"
        >
          {{ voice.name }}
        </button>

        <!-- Whisper text -->
        <span
            class="text-xs text-purple-300 mt-1 text-center max-w-[10rem] transition-opacity duration-300 ease-in-out"
            :class="{
            'opacity-100': currentVoice === key,
            'opacity-0 sm:group-hover:opacity-100 sm:block hidden': currentVoice !== key
          }"
        >
          {{ voice.whisper }}
        </span>
      </div>
    </div>

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
import { ref, reactive, nextTick } from 'vue'
import MessageThread from '../components/MessageThread.vue'
import MessageInput from '../components/MessageInput.vue'
import { fetchAIResponseStream } from '../lib/openai.js'
import VOICES from '../voices.js' // ✅ correct


const voices = VOICES
const currentVoice = ref('reflective')
const messages = ref([])
const scrollArea = ref(null)

const selectVoice = (key) => {
  currentVoice.value = key
  messages.value = [
    {
      role: 'system',
      content: voices[key].prompt.trim()
    },
    {
      role: 'assistant',
      content: `Welcome to HelioSynth. Let’s explore your inner world together.`
    }
  ]
  scrollToBottom()
}

const scrollToBottom = () => {
  nextTick(() => {
    scrollArea.value?.scrollTo({
      top: scrollArea.value.scrollHeight,
      behavior: 'smooth'
    })
  })
}

selectVoice(currentVoice.value)

const handleSend = async (userMessage) => {
  messages.value.push({ role: 'user', content: userMessage })
  scrollToBottom()

  const placeholder = reactive({ role: 'assistant', content: '...' })
  messages.value.push(placeholder)
  scrollToBottom()

  await fetchAIResponseStream([...messages.value], (updatedContent) => {
    placeholder.content = updatedContent
    scrollToBottom()
  })
}
</script>

