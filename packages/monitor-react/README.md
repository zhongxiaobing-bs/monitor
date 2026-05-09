# @company/monitor React 接入

## 极简接入

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { createReactMonitor } from '@company/monitor'
import App from './App'

const { MonitorRoot, monitor } = createReactMonitor({
  appId: 'my-react-app',
  appName: 'My React App',
  env: 'prod',
  dsn: '/api/collect'
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MonitorRoot fallback={<div>Something went wrong.</div>}>
        <App />
      </MonitorRoot>
    </BrowserRouter>
  </React.StrictMode>
)
```

默认行为：
- 自动启用 error、network、blankScreen 三个默认插件
- 自动挂载 React ErrorBoundary
- 可通过 `monitor.captureException(...)` 手动上报异常

## 可选配置

```tsx
const { MonitorRoot } = createReactMonitor({
  appId: 'my-react-app',
  env: 'prod',
  dsn: '/api/collect',
  fallback: <div>Something went wrong.</div>,
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
