# @company/monitor Vue 接入

## 极简接入

```ts
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createVueMonitor } from '@company/monitor'
import App from './App.vue'

const { plugin: monitorPlugin, monitor } = createVueMonitor({
  appId: 'my-vue-app',
  appName: 'My Vue App',
  env: 'prod',
  dsn: '/api/collect'
})

const router = createRouter({
  history: createWebHistory(),
  routes: []
})

const app = createApp(App)
app.use(router)
app.use(monitorPlugin)
app.mount('#app')
```

默认行为：
- 自动启用 error、network、blankScreen 三个默认插件
- 自动接管 `app.config.errorHandler`
- 可通过 `monitor.captureException(...)` 手动上报异常

## 可选配置

```ts
const { plugin } = createVueMonitor({
  appId: 'my-vue-app',
  env: 'prod',
  dsn: '/api/collect',
  blankScreen: {
    detectOnRouteChange: true,
    delayMs: 3000,
    routeChangeDelayMs: 1500
  },
  disableDefaultPlugins: ['blankScreen'],
  beforeSend(event) {
    return event
  }
})
```
