import type { ExceptionMonitorEvent } from '../types/monitor'

function formatTime(timestamp?: number) {
  if (!timestamp) return 'unknown'

  return new Date(timestamp).toLocaleString('zh-CN', {
    hour12: false
  })
}

export function formatExceptionMarkdown(event: ExceptionMonitorEvent) {
  const appName = event.appName || event.appId || 'unknown-app'
  const env = event.env || 'unknown'
  const page = event.pathname || event.url || 'unknown'
  const release = event.release || 'unknown'
  const userId = event.userId || 'anonymous'
  const errorName = event.error?.name || 'Error'
  const errorMessage = event.error?.message || 'Unknown error'
  const source = event.error?.source || 'unknown'
  const time = formatTime(event.timestamp)

  return [
    '## 前端监控告警',
    '',
    `> 应用：${appName}`,
    `> 环境：${env}`,
    `> 类型：exception`,
    `> 时间：${time}`,
    '',
    `> 错误：${errorName}: ${errorMessage}`,
    `> 来源：${source}`,
    `> 页面：${page}`,
    `> 版本：${release}`,
    `> 用户：${userId}`
  ].join('\n')
}
