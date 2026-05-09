<template>
  <main style="padding: 24px; font-family: sans-serif;">
    <h1>Frontend Monitor Playground Vue</h1>

    <nav style="display: flex; gap: 12px; margin-bottom: 24px;">
      <RouterLink to="/blank">Go to Blank Page</RouterLink>
    </nav>

    <p>Use the buttons below to trigger monitor events.</p>

    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
      <button @click="triggerManualCapture">Trigger Manual Capture</button>
      <button @click="triggerUnhandledRejection">Trigger Unhandled Rejection</button>
      <button @click="triggerAsyncRuntimeError">Trigger Async Runtime Error</button>
      <button @click="triggerHttp500">Trigger HTTP 500</button>
      <button @click="triggerNetworkError">Trigger Network Error</button>
      <button @click="triggerVueRenderError">Trigger Vue Render Error</button>
    </div>

    <CrashPanel v-if="shouldCrash" />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMonitor } from '@company/monitor-vue'
import CrashPanel from '../components/CrashPanel.vue'

const monitor = useMonitor()
const shouldCrash = ref(false)

function triggerManualCapture() {
  monitor.captureException(new Error('manual vue capture exception'), {
    source: 'manual-button'
  })
}

function triggerUnhandledRejection() {
  Promise.reject(new Error('manual unhandled rejection from vue'))
}

function triggerAsyncRuntimeError() {
  setTimeout(() => {
    throw new Error('async runtime error from vue')
  }, 300)
}

async function triggerHttp500() {
  await fetch('/api/mock-500')
}

async function triggerNetworkError() {
  await fetch('http://localhost:3999/not-found')
}

function triggerVueRenderError() {
  shouldCrash.value = true
}
</script>
