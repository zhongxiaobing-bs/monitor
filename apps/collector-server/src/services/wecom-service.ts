import type { WecomTemplateCardPayload } from '../formatters/wecom-message'

async function postWecomMessage(payload: Record<string, unknown>) {
  const webhookUrl = process.env.WECOM_WEBHOOK_URL

  if (!webhookUrl) {
    throw new Error('WECOM_WEBHOOK_URL is not configured')
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to send wecom message: ${response.status} ${text}`)
  }

  const result = (await response.json()) as {
    errcode?: number
    errmsg?: string
  }

  if (result.errcode && result.errcode !== 0) {
    throw new Error(
      `Wecom webhook returned error: ${result.errcode} ${result.errmsg || ''}`
    )
  }
}

export function sendWecomMarkdown(markdown: string) {
  return postWecomMessage({
    msgtype: 'markdown',
    markdown: {
      content: markdown
    }
  })
}

export function sendWecomTemplateCard(card: WecomTemplateCardPayload) {
  return postWecomMessage(card as unknown as Record<string, unknown>)
}
