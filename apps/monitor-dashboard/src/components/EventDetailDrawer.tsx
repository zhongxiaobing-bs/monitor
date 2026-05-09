import { useEffect, useState } from 'react'
import { Alert, Drawer, Spin, Typography } from 'antd'
import { ProDescriptions } from '@ant-design/pro-components'
import type { EventRow } from '../types/report'
import { fetchEvent } from '../services/report-api'
import PayloadBlock from './PayloadBlock'

interface EventDetailDrawerProps {
  id: number | null
  open: boolean
  onClose: () => void
}

function formatTimestamp(value: number | string | null) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString()
}

export default function EventDetailDrawer({
  id,
  open,
  onClose
}: EventDetailDrawerProps) {
  const [event, setEvent] = useState<EventRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || id === null) {
      return
    }

    setLoading(true)
    setError(null)

    void fetchEvent(id)
      .then((data) => {
        setEvent(data)
      })
      .catch(() => {
        setError('加载事件详情失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id, open])

  const payload = event?.payload

  return (
    <Drawer title="事件详情" width={720} open={open} onClose={onClose} destroyOnClose>
      {loading ? <Spin /> : null}
      {error ? <Alert type="error" message={error} showIcon /> : null}
      {!loading && !error && event ? (
        <div style={{ display: 'grid', gap: 16 }}>
          <ProDescriptions<EventRow>
            column={2}
            dataSource={event}
            title="公共字段"
            columns={[
              { title: 'ID', dataIndex: 'id' },
              { title: '事件类型', dataIndex: 'eventType' },
              { title: '应用名', dataIndex: 'appName' },
              { title: '环境', dataIndex: 'env' },
              { title: '路径', dataIndex: 'pathname' },
              {
                title: '事件时间',
                dataIndex: 'eventTimestamp',
                renderText: (value) => formatTimestamp(value)
              },
              {
                title: '接收时间',
                dataIndex: 'receivedAt',
                renderText: (value) => formatTimestamp(value)
              }
            ]}
          />

          {payload?.eventType === 'exception' ? (
            <ProDescriptions
              title="异常信息"
              column={1}
              dataSource={payload.error}
              columns={[
                { title: '名称', dataIndex: 'name' },
                { title: '消息', dataIndex: 'message' },
                { title: '来源', dataIndex: 'source' },
                { title: '堆栈', dataIndex: 'stack' }
              ]}
            />
          ) : null}

          {payload?.eventType === 'http_error' ? (
            <ProDescriptions
              title="HTTP 错误"
              column={1}
              dataSource={{ ...payload.request, ...payload.response }}
              columns={[
                { title: '请求地址', dataIndex: 'url' },
                { title: '请求方法', dataIndex: 'method' },
                { title: '状态码', dataIndex: 'status' },
                { title: '响应消息', dataIndex: 'message' }
              ]}
            />
          ) : null}

          {payload?.eventType === 'blank_screen' ? (
            <ProDescriptions
              title="白屏信息"
              column={1}
              dataSource={payload.blankScreen}
              columns={[
                { title: '分数', dataIndex: 'score' },
                { title: '触发时机', dataIndex: 'trigger' },
                {
                  title: 'DOM 摘要',
                  dataIndex: 'domSummary',
                  renderText: (value) =>
                    Array.isArray(value) ? value.join(', ') : '-'
                }
              ]}
            />
          ) : null}

          <div>
            <Typography.Title level={5}>原始 Payload</Typography.Title>
            <PayloadBlock payload={payload} />
          </div>
        </div>
      ) : null}
    </Drawer>
  )
}
