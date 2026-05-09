import { createApp } from 'vue'
import { createVueMonitor } from '@company/monitor'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import BlankView from './views/BlankView.vue'
import HomeView from './views/HomeView.vue'

const { plugin: monitorPlugin } = createVueMonitor({
  appId: 'playground-vue',
  appName: 'Vue Playground',
  env: 'dev',
  dsn: '/api/collect',
  blankScreen: {
    detectOnRouteChange: true,
    delayMs: 3000,
    routeChangeDelayMs: 1500
  },
  beforeSend(event) {
    console.log('[monitor beforeSend]', event)
    return event
  }
})

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: HomeView
    },
    {
      path: '/blank',
      component: BlankView
    }
  ]
})

const app = createApp(App)

app.use(router)
app.use(monitorPlugin)
app.mount('#app')
