import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '../views/ChatView.vue'

const routes = [
    { path: '/', redirect: '/chat' }, // 👈 Redirect root to /chat
    { path: '/chat', name: 'Chat', component: ChatView }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router

