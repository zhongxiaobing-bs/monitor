import type {
  BlankScreenMonitorEvent,
  ExceptionMonitorEvent,
  MonitorEvent
} from '../types/monitor'

export type AlertSeverity = 'P0' | 'P1' | 'P2'

interface AlertSummary {
  severity: AlertSeverity
  isCriticalPage: boolean
  isFrequent: boolean
  hasBlankScreen: boolean
}

interface WecomTemplateCardAction {
  type: 1
  url: string
}

interface WecomTemplateCardMainTitle {
  title: string
  desc?: string
}

interface WecomTemplateCardHorizontalContent {
  keyname: string
  value: string
}

interface WecomTemplateCardJump {
  type: 1
  title: string
  url: string
}

interface WecomTemplateCardButton {
  type: 1
  text: string
  style?: 1 | 2
  url: string
}

export interface WecomTemplateCardPayload {
  msgtype: 'template_card'
  template_card: {
    card_type: 'text_notice'
    source?: {
      icon_url?: string
      desc?: string
      desc_color?: 0 | 1 | 2 | 3
    }
    main_title: WecomTemplateCardMainTitle
    emphasis_content?: {
      title: string
      desc: string
    }
    quote_area?: {
      type: 1
      url: string
      title: string
      quote_text?: string
    }
    sub_title_text?: string
    horizontal_content_list?: WecomTemplateCardHorizontalContent[]
    jump_list?: WecomTemplateCardJump[]
    card_action?: WecomTemplateCardAction
    button_selection?: {
      question_key: string
      title: string
      option_list: Array<{ id: string; text: string }>
      selected_id?: string
    }
    button_list?: WecomTemplateCardButton[]
  }
}

interface WecomNotificationOptions {
  event: ExceptionMonitorEvent
  blankScreenEvent?: BlankScreenMonitorEvent
  isFrequent: boolean
  dashboardBaseUrl: string
}

function formatTime(timestamp?: number) {
  if (!timestamp) return 'unknown'

  return new Date(timestamp).toLocaleString('zh-CN', {
    hour12: false
  })
}

function getAppName(event: MonitorEvent) {
  return event.appName || event.appId || 'unknown-app'
}

function getPage(event: MonitorEvent) {
  return event.pathname || event.url || 'unknown'
}

function getSource(event: ExceptionMonitorEvent) {
  return event.error?.source || 'unknown'
}

function getSeveritySummary({
  event,
  blankScreenEvent,
  isFrequent
}: Pick<WecomNotificationOptions, 'event' | 'blankScreenEvent' | 'isFrequent'>): AlertSummary {
  const isCriticalPage = event.pageLevel === 'critical'
  const hasBlankScreen = Boolean(blankScreenEvent)

  if (event.env === 'prod' && (hasBlankScreen || (isCriticalPage && isFrequent))) {
    return {
      severity: 'P0',
      isCriticalPage,
      isFrequent,
      hasBlankScreen
    }
  }

  if (event.env === 'prod' && (isCriticalPage || isFrequent)) {
    return {
      severity: 'P1',
      isCriticalPage,
      isFrequent,
      hasBlankScreen
    }
  }

  return {
    severity: 'P2',
    isCriticalPage,
    isFrequent,
    hasBlankScreen
  }
}

function trimText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 1)}…`
}

function getDashboardDetailUrl(baseUrl: string, eventId: string) {
  const url = new URL('/events', ensureAbsoluteUrl(baseUrl))
  url.searchParams.set('monitorEventId', eventId)
  return url.toString()
}

function ensureAbsoluteUrl(value: string) {
  return /^https?:\/\//.test(value) ? value : `https://${value}`
}

function buildSummaryLine(summary: AlertSummary) {
  const flags = [summary.isCriticalPage ? '重要页面' : '普通页面']

  if (summary.isFrequent) {
    flags.push('高频')
  }

  if (summary.hasBlankScreen) {
    flags.push('白屏')
  }

  return flags.join(' / ')
}

export function formatExceptionMarkdown(event: ExceptionMonitorEvent) {
  const appName = getAppName(event)
  const env = event.env || 'unknown'
  const page = getPage(event)
  const release = event.release || 'unknown'
  const userId = event.userId || 'anonymous'
  const errorName = event.error?.name || 'Error'
  const errorMessage = event.error?.message || 'Unknown error'
  const source = getSource(event)
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

export function formatExceptionTemplateCard({
  event,
  blankScreenEvent,
  isFrequent,
  dashboardBaseUrl
}: WecomNotificationOptions): WecomTemplateCardPayload {
  const severitySummary = getSeveritySummary({
    event,
    blankScreenEvent,
    isFrequent
  })
  const appName = getAppName(event)
  const env = event.env || 'unknown'
  const page = getPage(event)
  const release = event.release || 'unknown'
  const userId = event.userId || 'anonymous'
  const errorName = event.error?.name || 'Error'
  const errorMessage = event.error?.message || 'Unknown error'
  const eventId = event.eventId || 'unknown'
  const detailUrl = getDashboardDetailUrl(dashboardBaseUrl, eventId)
  const title = `${severitySummary.severity} 前端${severitySummary.hasBlankScreen ? '白屏' : '异常'}告警`
  const subtitle = trimText(`${errorName}: ${errorMessage}`, 120)

  return {
    msgtype: 'template_card',
    template_card: {
      card_type: 'text_notice',
      source: {
        desc: '前端监控',
        desc_color:
          severitySummary.severity === 'P0'
            ? 1
            : severitySummary.severity === 'P1'
              ? 2
              : 3
      },
      main_title: {
        title,
        desc: subtitle
      },
      emphasis_content: {
        title: severitySummary.severity,
        desc: buildSummaryLine(severitySummary)
      },
      quote_area: {
        type: 1,
        url: detailUrl,
        title: trimText(page, 120),
        quote_text: trimText(`${appName} · ${env}`, 120)
      },
      sub_title_text: trimText(
        `${subtitle}\n时间：${formatTime(event.timestamp)}\n来源：${getSource(event)}`,
        500
      ),
      horizontal_content_list: [
        { keyname: '应用', value: trimText(appName, 120) },
        { keyname: '环境', value: env },
        { keyname: '页面等级', value: severitySummary.isCriticalPage ? '重要页面' : '普通页面' },
        { keyname: '高频', value: severitySummary.isFrequent ? '是' : '否' },
        { keyname: '白屏', value: severitySummary.hasBlankScreen ? '是' : '否' },
        { keyname: '版本', value: trimText(release, 120) },
        { keyname: '用户', value: trimText(userId, 120) },
        { keyname: '事件ID', value: trimText(eventId, 120) }
      ],
      jump_list: [
        {
          type: 1,
          title: '查看详情',
          url: detailUrl
        }
      ],
      card_action: {
        type: 1,
        url: detailUrl
      },
      button_list: [
        {
          type: 1,
          text: '打开详情抽屉',
          style: severitySummary.severity === 'P0' ? 2 : 1,
          url: detailUrl
        }
      ]
    }
  }
}
