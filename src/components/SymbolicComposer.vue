<template>
  <div class="fixed bottom-14 left-0 right-0 px-4 z-20">
    <div class="w-full max-w-xl mx-auto p-4">
      <div class="flex items-end space-x-3 bg-indigo-950/60 border border-indigo-700 rounded-2xl p-4 shadow-lg backdrop-blur">
        <textarea
            v-model="message"
            rows="2"
            placeholder="Speak inward. Type your reflection..."
            class="flex-1 resize-none bg-transparent text-purple-100 placeholder-purple-400 focus:outline-none text-base leading-relaxed"
        />
        <button
            @click="handleSend"
            class="text-purple-300 hover:text-white transition-transform transform hover:scale-110"
            aria-label="Send Message"
        >
          <PaperAirplaneIcon class="w-6 h-6 rotate-45" />
        </button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { PaperAirplaneIcon } from '@heroicons/vue/24/outline'
import { fetchGPTReply } from '../lib/gpt'
import { supabase } from '../lib/supabase'

const emit = defineEmits(['message-pair'])

const message = ref('')
const isSending = ref(false)

const handleSend = async () => {
  const userMessage = message.value.trim()
  if (!userMessage || isSending.value) return

  isSending.value = true
  message.value = ''

  try {
    const gptReply = await fetchGPTReply(userMessage)

    const { error } = await supabase.from('messages').insert([
      {
        sender: 'user',
        content: userMessage,
        role: 'part',
        session_id: null // placeholder until session tracking is added
      },
      {
        sender: 'system',
        content: gptReply,
        role: 'guide',
        session_id: null
      }
    ])

    if (error) {
      console.error('❌ Supabase insert error:', error.message)
    }

    emit('message-pair', { userMessage, gptReply })
  } catch (err) {
    console.error('❌ GPT Error:', err.message)
    emit('message-pair', {
      userMessage,
      gptReply: '...the inner voice echoes without form.'
    })
  }

  isSending.value = false
}
</script>
npm run dev