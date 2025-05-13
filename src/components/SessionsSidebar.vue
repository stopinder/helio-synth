<template>
  <aside class="w-72 max-w-full bg-black bg-opacity-30 backdrop-blur-md text-white p-4 space-y-4 border-r border-purple-900 overflow-y-auto">
    <div class="text-xl font-semibold text-purple-300 flex justify-between items-center">
      <span>📜 Sessions</span>
      <button @click="fetchSessions" class="text-xs text-purple-400 hover:text-purple-200">⟳</button>
    </div>

    <ul class="space-y-2">
      <li
          v-for="session in sessions"
          :key="session.id"
          @click="selectSession(session)"
          class="cursor-pointer px-3 py-2 rounded-md hover:bg-purple-800/40 transition"
          :class="{ 'bg-purple-800/60': session.id === selectedSessionId }"
      >
        <div class="font-medium truncate">{{ session.title || '(untitled)' }}</div>
        <div class="text-xs text-purple-300">
          {{ formatDate(session.created_at) }}
        </div>
      </li>
    </ul>

    <button
        @click="startNewSession"
        class="w-full mt-4 px-4 py-2 text-sm bg-purple-700 hover:bg-purple-600 text-white rounded-md"
    >
      ➕ Start New Session
    </button>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const sessions = ref([])
const selectedSessionId = ref(null)

const fetchSessions = async () => {
  const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

  if (error) {
    console.error('Error fetching sessions:', error)
  } else {
    sessions.value = data
  }
}

const formatDate = (iso) => {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

const selectSession = (session) => {
  selectedSessionId.value = session.id
  console.log('Selected session:', session)
  // Optionally emit or load messages here
}

const startNewSession = async () => {
  const { data, error } = await supabase
      .from('sessions')
      .insert([{ title: 'New Session', created_at: new Date().toISOString() }])
      .select()
      .single()

  if (error) {
    console.error('Error creating session:', error)
    return
  }

  sessions.value.unshift(data)
  selectedSessionId.value = data.id
}
onMounted(fetchSessions)
</script>

<style scoped>
aside {
  height: 100vh;
}
</style>
