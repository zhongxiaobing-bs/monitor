import { useEffect, useMemo, useState } from 'react'
import { Alert, Select, Space } from 'antd'
import {
  PageContainer,
  ProFormDateTimeRangePicker,
  ProFormSelect,
  QueryFilter,
  ProTable,
  StatisticCard
} from '@ant-design/pro-components'
import { Line } from '@ant-design/plots'
import { Link } from 'react-router-dom'
import { fetchGroups, fetchSummary } from '../services/report-api'
import type {
  GroupByField,
  GroupResult,
  ReportFilter,
  SummaryResult
} from '../types/report'

const eventTypeOptions = [
  { label: '全部', value: undefined },
  { label: 'exception', value: 'exception' },
  { label: 'http_error', value: 'http_error' },
  { label: 'blank_screen', value: 'blank_screen' }
]

const groupByOptions: Array<{ label: string; value: GroupByField }> = [
  { label: '应用名', value: 'appName' },
  { label: '环境', value: 'env' },
  { label: '路径', value: 'pathname' },
  { label: '事件类型', value: 'eventType' }
]

const initialSummary: SummaryResult = {
  total: 0,
  exceptionCount: 0,
  httpErrorCount: 0,
  blankScreenCount: 0,
  last24hCount: 0,
  trend: []
}

function buildFilter(values: {
  timeRange?: [{ valueOf: () => number }, { valueOf: () => number }]
  appName?: string
  env?: string
  eventType?: string
}): ReportFilter {
  return {
    from: values.timeRange?.[0]?.valueOf(),
    to: values.timeRange?.[1]?.valueOf(),
    appName: values.appName,
    env: values.env,
    eventType: values.eventType
  }
}

export default function OverviewPage() {
  const [filter, setFilter] = useState<ReportFilter>({})
  const [groupBy, setGroupBy] = useState<GroupByField>('eventType')
  const [summary, setSummary] = useState<SummaryResult>(initialSummary)
  const [groups, setGroups] = useState<GroupResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    void Promise.all([
      fetchSummary(filter),
      fetchGroups({ ...filter, groupBy })
    ])
      .then(([summaryData, groupsData]) => {
        setSummary(summaryData)
        setGroups(groupsData)
      })
      .catch(() => {
        setError('加载概览数据失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [filter, groupBy])

  const chartConfig = useMemo(
    () => ({
      data: summary.trend,
      xField: 'bucket',
      yField: 'count',
      smooth: true,
      height: 280,
      autoFit: true
    }),
    [summary.trend]
  )

  return (
    <PageContainer
      title="监控概览"
      extra={[
        <Link key="events" to="/events">
          查看事件列表
        </Link>
      ]}
    >
      <QueryFilter
        defaultCollapsed={false}
        onFinish={async (values) => {
          setFilter(
            buildFilter(
              values as {
                timeRange?: [{ valueOf: () => number }, { valueOf: () => number }]
                appName?: string
                env?: string
                eventType?: string
              }
            )
          )
        }}
      >
        <ProFormDateTimeRangePicker name="timeRange" label="时间范围" />
        <ProFormSelect name="appName" label="应用名" options={[]} />
        <ProFormSelect name="env" label="环境" options={[]} />
        <ProFormSelect name="eventType" label="事件类型" options={eventTypeOptions} />
      </QueryFilter>

      {error ? <Alert type="error" message={error} showIcon /> : null}

      <StatisticCard.Group loading={loading} direction="row" style={{ marginBottom: 16 }}>
        <StatisticCard statistic={{ title: '总事件数', value: summary.total }} />
        <StatisticCard statistic={{ title: '异常数', value: summary.exceptionCount }} />
        <StatisticCard statistic={{ title: 'HTTP 错误数', value: summary.httpErrorCount }} />
        <StatisticCard statistic={{ title: '白屏数', value: summary.blankScreenCount }} />
        <StatisticCard statistic={{ title: '最近 24h', value: summary.last24hCount }} />
      </StatisticCard.Group>

      <div style={{ marginBottom: 16, borderRadius: 8, background: '#fff', padding: 16 }}>
        <Line {...chartConfig} />
      </div>

      <ProTable<GroupResult>
        rowKey={(record) => `${record.value ?? 'empty'}-${record.count}`}
        loading={loading}
        search={false}
        options={false}
        toolBarRender={false}
        headerTitle={
          <Space>
            聚合统计
            <Select
              value={groupBy}
              options={groupByOptions}
              style={{ width: 160 }}
              onChange={(value) => setGroupBy(value)}
            />
          </Space>
        }
        dataSource={groups}
        columns={[
          {
            title: '分组值',
            dataIndex: 'value',
            renderText: (value) => value ?? '(空)'
          },
          {
            title: '数量',
            dataIndex: 'count'
          }
        ]}
        pagination={false}
      />
    </PageContainer>
  )
}
