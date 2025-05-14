<template>
  <div class="space-y-4">
    <div
        v-for="(msg, i) in messages"
        :key="i"
        :class="msg.role === 'user' ? 'text-right' : 'text-left'"
    >
      <div
          class="inline-block px-4 py-2 rounded-md max-w-md break-words whitespace-pre-wrap"
          :class="msg.role === 'user' ? 'bg-purple-800 text-white' : 'bg-indigo-950 text-purple-200'"
      >
        {{ msg.content }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ messages: Array })
</script>
