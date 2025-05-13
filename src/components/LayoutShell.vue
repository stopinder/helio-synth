<template>
  <div class="flex flex-col min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white relative">

    <!-- Top Bar -->
    <header class="fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-4 h-14 bg-black/30 backdrop-blur-md border-b border-purple-800 shadow-sm">
      <button @click="toggleLeft" class="text-purple-300 hover:text-white transition">
        ☰
      </button>
      <div class="flex gap-4 items-center">
        <div class="bg-purple-800/30 px-3 py-1 rounded-md">▼ Mode</div>
        <div class="bg-purple-800/30 px-3 py-1 rounded-md">▼ Voice</div>
      </div>
      <button @click="toggleRight" class="text-purple-300 hover:text-white transition">
        ☰
      </button>
    </header>

    <!-- Layout Body -->
    <div class="pt-14 pb-12 flex flex-1 relative overflow-hidden">

      <!-- Left Sidebar -->
      <aside v-show="leftOpen" class="absolute md:static w-64 h-full bg-indigo-950/90 backdrop-blur-md z-30 border-r border-purple-800 transition-all duration-300">
        <div class="p-4 space-y-4">
          <h2 class="text-purple-200 text-lg font-semibold">Sessions</h2>
          <button class="w-full bg-purple-800/50 hover:bg-purple-700 text-white py-2 px-4 rounded transition">
            + New Session
          </button>
          <ul class="space-y-2 text-purple-300">
            <li class="hover:text-white cursor-pointer">The Temple of Echoes</li>
            <li class="hover:text-white cursor-pointer">Night Ocean Dialogue</li>
            <li class="hover:text-white cursor-pointer">Part: The Watcher</li>
          </ul>
        </div>
      </aside>

      <!-- Center View -->
      <main class="flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-10">
        <slot />
      </main>

      <!-- Right Sidebar -->
      <aside v-show="rightOpen" class="absolute md:static right-0 w-64 h-full bg-indigo-950/90 backdrop-blur-md z-30 border-l border-purple-800 transition-all duration-300">
        <div class="p-4 space-y-6">
          <h2 class="text-purple-200 text-lg font-semibold">Tools</h2>
          <div class="space-y-2">
            <button class="w-full bg-purple-800/50 hover:bg-purple-700 text-white py-2 px-4 rounded transition">
              🔮 Tarot
            </button>
            <button class="w-full bg-purple-800/50 hover:bg-purple-700 text-white py-2 px-4 rounded transition">
              🎧 HemiSync
            </button>
            <button class="w-full bg-purple-800/50 hover:bg-purple-700 text-white py-2 px-4 rounded transition">
              🗣️ Voices
            </button>
          </div>
        </div>
      </aside>

    </div>

    <!-- Bottom Bar -->
    <footer class="fixed bottom-0 left-0 right-0 z-40 flex justify-center items-center gap-8 h-12 bg-black/30 backdrop-blur-md border-t border-purple-800 text-purple-300 text-sm">
      <button class="hover:text-white transition">⚙ Settings</button>
      <button class="hover:text-white transition">🧰 Tools</button>
      <button class="hover:text-white transition">🛟 Support</button>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const leftOpen = ref(false)
const rightOpen = ref(false)

const toggleLeft = () => {
  leftOpen.value = !leftOpen.value
}

const toggleRight = () => {
  rightOpen.value = !rightOpen.value
}
</script>
