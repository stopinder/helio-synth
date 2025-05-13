<template>
  <div class="flex flex-col min-h-screen relative bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white animate-fadein">

    <!-- Main Celestial Canvas -->
    <main class="flex-1 flex flex-col items-center justify-center text-center p-6 overflow-y-auto">
      <div class="space-y-6 max-w-xl w-full">

        <!-- Title -->
        <h1 class="text-4xl md:text-6xl font-light tracking-wide opacity-0 animate-fadein-delay-0">
          Heliosynthesis
        </h1>

        <!-- Subtitle -->
        <p class="text-lg md:text-xl text-purple-200 opacity-0 animate-fadein-delay-1">
          A poetic interface for inner alignment and celestial rhythm.
        </p>

        <!-- Typing message output -->
        <div
            class="text-purple-300 text-base md:text-lg mt-8 min-h-[2rem] transition-opacity duration-500"
            :class="{ 'opacity-100': typedMessage, 'opacity-0': !typedMessage }"
        >
          {{ typedMessage }}
        </div>

      </div>
    </main>

    <!-- Symbolic Composer with bottom spacing -->
    <div class="pb-28">
      <SymbolicComposer @message-pair="handleMessagePair" />
    </div>



  </div>
</template>

<script setup>
import { ref } from 'vue'
import SymbolicComposer from '../components/SymbolicComposer.vue'
import { supabase } from '../lib/supabase'

const typedMessage = ref('')

// Replace with your real UUID from Supabase session table
const activeSessionId = 'e8d47f0e-3c2b-4e25-9f4f-9a6d2462f9de'

function handleMessagePair({ userMessage, gptReply }) {
  console.log('📝 Incoming messages:', { userMessage, gptReply })
  saveMessage(userMessage, 'user')
  saveMessage(gptReply, 'system')
  typeOutMessage(gptReply)
}

function typeOutMessage(text) {
  typedMessage.value = ''
  let i = 0
  const speed = 30
  const interval = setInterval(() => {
    typedMessage.value += text.charAt(i)
    i++
    if (i >= text.length) clearInterval(interval)
  }, speed)
}

async function saveMessage(content, sender) {
  const { error } = await supabase.from('messages').insert([
    {
      session_id: activeSessionId,
      sender: sender,
      content: content,
      role: sender === 'user' ? 'part' : 'guide'
    }
  ])

  if (error) {
    console.error(`❌ Supabase Error (${sender}):`, error.message)
  }
}
</script>

<style>
@keyframes fadein {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadein {
  animation: fadein 1s ease-out forwards;
}
.animate-fadein-delay-0 {
  animation: fadein 1s ease-out 0s forwards;
}
.animate-fadein-delay-1 {
  animation: fadein 1s ease-out 0.3s forwards;
}
.animate-fadein-delay-4 {
  animation: fadein 1s ease-out 1.1s forwards;
}
</style>
