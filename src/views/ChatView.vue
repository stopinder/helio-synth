<script setup>
import { ref, reactive, nextTick } from 'vue'
import MessageThread from '../components/MessageThread.vue'
import MessageInput from '../components/MessageInput.vue'
import { fetchAIResponseStream } from '../lib/openai.js'
import VOICES from '../voices.js'      // ✅ CORRECT


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

