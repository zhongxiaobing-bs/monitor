import { useEffect, useRef, useState } from 'react'
import {
  PageContainer,
  ProFormDateTimeRangePicker,
  ProFormText,
  ProFormSelect,
  ProTable,
  QueryFilter
} from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { useSearchParams } from 'react-router-dom'
import type { EventRow, EventsFilter } from '../types/report'
import EventDetailDrawer from '../components/EventDetailDrawer'
import { fetchEventByEventId, fetchEvents } from '../services/report-api'

const eventTypeOptions = [
  { label: 'exception', value: 'exception' },
  { label: 'http_error', value: 'http_error' },
  { label: 'blank_screen', value: 'blank_screen' }
]

function formatDateTime(value: number | string | null) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString()
}

export default function EventsPage() {
  const actionRef = useRef<ActionType | undefined>(undefined)
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filter, setFilter] = useState<Partial<EventsFilter>>({})

  useEffect(() => {
    const detailId = Number(searchParams.get('eventId'))

    if (Number.isInteger(detailId) && detailId > 0) {
      setSelectedId(detailId)
      setDrawerOpen(true)
      return
    }

    const monitorEventId = searchParams.get('monitorEventId')

    if (!monitorEventId) {
      return
    }

    void fetchEventByEventId(monitorEventId).then((event) => {
      if (!event) {
        return
      }

      setSelectedId(event.id)
      setDrawerOpen(true)
    })
  }, [searchParams])

  const columns: ProColumns<EventRow>[] = [
    {
      title: '接收时间',
      dataIndex: 'receivedAt',
      renderText: (value) => formatDateTime(value)
    },
    {
      title: '事件类型',
      dataIndex: 'eventType'
    },
    {
      title: '应用名',
      dataIndex: 'appName'
    },
    {
      title: '环境',
      dataIndex: 'env'
    },
    {
      title: '路径',
      dataIndex: 'pathname'
    },
    {
      title: 'Payload 预览',
      dataIndex: 'payload',
      render: (_, record) => JSON.stringify(record.payload).slice(0, 80)
    }
  ]

  return (
    <PageContainer title="事件列表">
      <QueryFilter
        defaultCollapsed={false}
        onFinish={async (values) => {
          const nextFilter: Partial<EventsFilter> = {
            from: values.timeRange?.[0]?.valueOf(),
            to: values.timeRange?.[1]?.valueOf(),
            appName: values.appName,
            env: values.env,
            eventType: values.eventType,
            keyword: values.keyword
          }

          setFilter(nextFilter)
          actionRef.current?.reload()
        }}
      >
        <ProFormDateTimeRangePicker name="timeRange" label="时间范围" />
        <ProFormText name="appName" label="应用名" />
        <ProFormText name="env" label="环境" />
        <ProFormSelect name="eventType" label="事件类型" options={eventTypeOptions} />
        <ProFormText name="keyword" label="关键词" />
      </QueryFilter>

      <ProTable<EventRow>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        columns={columns}
        request={async (params) => {
          const result = await fetchEvents({
            page: params.current ?? 1,
            pageSize: params.pageSize ?? 20,
            ...filter
          } as EventsFilter)

          return {
            data: result.events,
            total: result.total,
            success: true
          }
        }}
        onRow={(record) => ({
          onClick: () => {
            setSelectedId(record.id)
            setDrawerOpen(true)
            setSearchParams({ eventId: String(record.id) })
          }
        })}
      />

      <EventDetailDrawer
        id={selectedId}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setSelectedId(null)
          setSearchParams({})
        }}
      />
    </PageContainer>
  )
}
