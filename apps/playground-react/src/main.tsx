import React from 'react'
import ReactDOM from 'react-dom/client'
import { createReactMonitor } from '@company/monitor'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

const { MonitorRoot } = createReactMonitor({
  appId: 'playground-react',
  appName: 'React Playground',
  env: 'prod',
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MonitorRoot fallback={<div style={{ padding: 24 }}>Something went wrong.</div>}>
        <App />
      </MonitorRoot>
    </BrowserRouter>
  </React.StrictMode>
)
