# Monitor Dashboard Design

## 背景

当前项目已经具备前端监控上报能力：React / Vue playground 会把事件发送到 `collector-server`，服务端会校验并落库到 Postgres 的 `monitor_events` 表。现在需要在 `apps` 目录下新增一个应用，把这些真实上报数据展示出来，方便日常查看和问题排查。

第一版目标是尽快形成闭环：
- playground 触发事件
- collector-server 写入数据库
- 新 dashboard 应用通过 HTTP 接口读取并展示

本次设计优先考虑：可维护性 > 性能 > 简洁性。

## 目标

新增一个 `apps/monitor-dashboard` 应用，使用 React + Vite + Ant Design Pro Components 展示监控事件数据。

第一版覆盖：
- Dashboard 概览页
- 事件列表页
- 详情抽屉
- collector-server 查询接口
- 与当前 Postgres `monitor_events` 表直接联动

## 非目标

第一版不包含：
- 独立 report-server
- 登录鉴权
- 导出功能
- 实时推送 / 自动刷新
- 复杂图表钻取
- 聚合表 / 预计算报表
- 通用报表 DSL

## 方案选择

### 备选方案

1. 新增前端应用，并在 `collector-server` 扩展查询接口
2. 新增前端应用，并新建独立报表服务
3. 先做 UI 壳子，用 mock 数据驱动

### 选择结果

选择方案 1：**新增 dashboard 前端应用 + 在 `collector-server` 中扩展查询接口**。

### 原因

- 当前项目已经有真实数据和运行中的 `collector-server`
- 第一版主要目标是尽快打通“写入 → 查询 → 展示”的完整链路
- 在现有服务内补充查询能力，改动集中、上线更快
- 后续若查询逻辑复杂度上升，可以再把接口迁移到独立 report-server，前端接口契约可基本保持不变

## 信息架构

### 页面结构

新增 `apps/monitor-dashboard`，包含两个页面：

1. `/` 概览页
2. `/events` 事件列表页

### 概览页

包含以下模块：
- 顶部筛选区：时间范围、`appName`、`env`、`eventType`
- 统计卡片：总事件数、异常数、HTTP 错误数、最近 24h 数量
- 趋势图：按时间分桶展示事件趋势
- 聚合表：按 `appName` / `env` / `pathname` / `eventType` 查看基础聚合结果
- 最近事件列表：展示最新若干条异常或错误事件

### 事件列表页

包含以下模块：
- 筛选区：时间范围、`appName`、`env`、`eventType`、错误关键词
- 明细表格：按 `received_at` 倒序展示事件
- 点击行打开详情抽屉

### 详情抽屉

展示内容：
- 公共字段：`id`、`eventType`、`appName`、`env`、`pathname`、`eventTimestamp`、`receivedAt` 等
- 事件特有字段：
  - exception：`error.name`、`error.message`、`error.source`、`error.stack`
  - http_error：`request.url`、`request.method`、`request.status`、`response.message`
  - blank_screen：`blankScreen.score`、`blankScreen.trigger`、`blankScreen.domSummary`
- 原始 `payload JSON`

## 前后端边界

### 原则

- dashboard 前端只通过 HTTP 接口取数
- 前端不直连数据库
- 所有 SQL 查询、参数校验、分页聚合逻辑均由 `collector-server` 处理

### collector-server 新增接口

#### 1. `GET /api/reports/summary`

用途：概览页顶部统计卡片 + 趋势图

输入参数：
- `from`
- `to`
- `appName`
- `env`
- `eventType`

输出：
- 总事件数
- exception 数
- http_error 数
- blank_screen 数
- 最近 24h 数
- 按时间分桶趋势数据

#### 2. `GET /api/reports/groups`

用途：概览页聚合表

输入参数：
- `from`
- `to`
- `appName`
- `env`
- `eventType`
- `groupBy`

`groupBy` 第一版只允许：
- `appName`
- `env`
- `pathname`
- `eventType`

输出：
- 分组值
- 事件数量

#### 3. `GET /api/reports/events`

用途：事件列表页

输入参数：
- `page`
- `pageSize`
- `from`
- `to`
- `appName`
- `env`
- `eventType`
- `keyword`

输出：
- 当前页列表
- 总条数
- 每条记录的公共字段 + `payload`

#### 4. `GET /api/reports/events/:id`

用途：详情抽屉

输出：
- 单条完整事件记录

## 数据来源与查询模型

查询直接基于现有 `monitor_events` 表。

第一版使用现有字段：
- `id`
- `event_type`
- `app_name`
- `env`
- `pathname`
- `event_timestamp`
- `received_at`
- `payload`

### 查询策略

- 明细页优先使用结构化列进行筛选
- 关键词搜索可先从 `payload::text` 中匹配，满足第一版排查需求
- 聚合查询仅允许固定白名单列，避免动态 SQL 注入风险
- 列表默认按 `received_at DESC` 排序

## 前端实现

### 技术栈

新应用采用：
- React
- TypeScript
- Vite
- `antd`
- `@ant-design/pro-components`

### 组件选型

#### 概览页
- `PageContainer`
- `QueryFilter`
- `StatisticCard`
- 图表组件（优先简单接入，推荐 `@ant-design/plots`）
- `ProTable` 用于聚合表和最近事件列表

#### 事件列表页
- `PageContainer`
- `QueryFilter`
- `ProTable`
- `Drawer`
- `ProDescriptions`

#### 详情展示
- 公共字段使用 `ProDescriptions`
- 原始 `payload` 使用 `pre` / 代码块容器展示格式化 JSON

### 状态与请求

第一版不引入复杂状态管理：
- 页面级 `useState`
- 一个轻量 `request.ts` 封装 fetch
- 筛选条件保存在页面 state 中

## 后端实现

### collector-server 扩展方向

在现有 `collector-server` 中新增只读查询模块，建议拆分为：
- 查询参数解析 / 校验模块
- report repository / SQL 查询模块
- route handler

### 边界控制

保留现有采集写入逻辑，不重构其责任边界。

新增查询能力时遵循：
- 写入和查询共享数据库连接池
- 查询接口不影响现有 `/api/collect` 行为
- 只在必要的参数边界做校验
- 所有 `groupBy`、排序、分页等用户输入走白名单控制

## 错误处理

### 前端

- 请求失败时显示 antd `Alert` 或表格错误态
- 没有数据时显示空态
- 详情接口失败时抽屉内显示错误信息，而不是让页面崩溃

### 后端

- 非法查询参数返回 400
- 不存在的事件详情返回 404
- 查询异常返回 500，并记录结构化日志
- 动态维度查询一律限制在白名单内，避免 SQL 注入

## 测试与验证

### 手工验证

1. 启动 Postgres
2. 启动 `collector-server`
3. 启动 `monitor-dashboard`
4. 在 playground 中触发事件上报
5. 打开 dashboard，确认：
   - 概览页统计卡片有值
   - 趋势图有数据
   - 聚合表可显示统计结果
   - 列表页可查到最新事件
   - 点击详情能看到公共字段和原始 payload

### 工程验证

- `collector-server` 的 typecheck / test 通过
- `monitor-dashboard` 的 typecheck / test 通过
- dashboard 前端能够在浏览器中实际访问并完成 Golden Path 验证

## 目录建议

### 新增应用
- `apps/monitor-dashboard/`

### collector-server 新增内容
- report route
- report repository
- 查询参数 schema / types

### monitor-dashboard 内部结构建议
- `src/pages/OverviewPage.tsx`
- `src/pages/EventsPage.tsx`
- `src/components/EventDetailDrawer.tsx`
- `src/services/report-api.ts`
- `src/types/report.ts`

## 设计结论

第一版采用 **dashboard 新应用 + collector-server 查询接口** 的方式，在最小新增系统复杂度下打通“真实上报数据展示”的完整链路。该方案既能满足当前快速可用的目标，也为后续拆分独立报表服务保留了演进空间。