# Requirements Document

## Introduction

BotConfigManager 重构项目旨在消除各功能子模块（ReplyRule、GroupMessage、AuctionRule 等）中重复的 Table + CRUD 状态管理代码。通过引入泛型 CRUD 容器层（`useFeatureList` Hook + `FeatureListContainer` 组件）和统一的 Form 接口规范，使新增功能模块只需编写数据列定义和业务 Form，无需再复制模板代码。

---

## Glossary

- **BotConfigManager**: 管理 Telegram 机器人各类群组功能的顶层模块入口，以机器人为单位展示所有功能 Tab
- **GroupFeaturesModal**: 群组级功能管理弹窗，提供按群组过滤的功能 Tab 导航
- **useFeatureList**: 封装列表加载、增删改状态管理的泛型 React Hook
- **FeatureListContainer**: 提供统一列表页面外壳（新建按钮 + Table + 加载状态）的通用 React 组件
- **GroupContextForm**: 为 Form 弹窗提供群组上下文感知能力的包装器组件
- **XxxGroupContent**: 群组上下文场景下的功能容器组件，props 接收固定的 bot + group 上下文
- **XxxFeatureTab (index.tsx)**: 机器人级独立页面容器，不固定群组，展示全量数据并提供 GroupSelect
- **XxxForm**: 功能模块的业务 Form 纯展示组件，接收 editingRecord 和 fixedGroupId
- **XxxColumns**: 功能模块的 Table 列定义，纯函数，接收操作回调
- **fixedGroupId**: 群组上下文场景下传入 Form 的固定群组 ID，传入时隐藏 GroupSelect
- **GroupSelect**: 供用户在机器人级视图选择目标群组的下拉选择控件
- **FeatureBaseRecord**: 所有功能数据记录的通用基础字段接口（含 `_id`、`bot`、`group`、`isOnline`）
- **BotRecord**: 机器人数据记录，包含 `_id`、`botName`、`userName`、`groups`
- **GroupRecord**: 群组数据记录，包含 `_id`、`title`、`username`、`type`
- **addItem**: 发起 POST 请求创建资源的 API 工具函数
- **updateItem**: 发起 PUT/PATCH 请求更新资源的 API 工具函数
- **removeItem**: 发起批量删除请求的 API 工具函数

---

## Requirements

### Requirement 1: 通用 useFeatureList Hook

**User Story:** 作为前端开发者，我希望有一个通用的列表状态管理 Hook，以便各功能模块无需重复实现数据加载、删除和状态切换逻辑。

#### Acceptance Criteria

1. THE `useFeatureList` Hook SHALL 接受 `apiPath`、`botId`、`groupId`（可选）、`enabled`（可选）等配置参数，并返回 `data`、`loading`、`formOpen`、`editingRecord`、`fetchData`、`openCreate`、`openEdit`、`closeForm`、`handleDelete`、`handleStatusChange`。
2. WHEN `useFeatureList` 被调用且 `groupId` 已传入，THE `useFeatureList` Hook SHALL 在 `fetchData` 发出的请求参数中包含 `groupId` 字段。
3. WHEN `useFeatureList` 被调用且 `groupId` 未传入，THE `useFeatureList` Hook SHALL 在 `fetchData` 发出的请求参数中不包含 `groupId` 字段。
4. WHILE `enabled` 为 `false`，THE `useFeatureList` Hook SHALL 不发起任何 API 请求。
5. WHEN `enabled` 从 `false` 变为 `true`，THE `useFeatureList` Hook SHALL 自动触发一次 `fetchData`。
6. WHEN `openCreate` 被调用，THE `useFeatureList` Hook SHALL 将 `formOpen` 设置为 `true` 并将 `editingRecord` 设置为 `null`。
7. WHEN `openEdit` 被调用并传入一条记录，THE `useFeatureList` Hook SHALL 将 `formOpen` 设置为 `true` 并将 `editingRecord` 设置为该记录。
8. WHEN `closeForm` 被调用，THE `useFeatureList` Hook SHALL 将 `formOpen` 设置为 `false` 并将 `editingRecord` 设置为 `null`。
9. WHEN `handleDelete` 执行成功，THE `useFeatureList` Hook SHALL 调用 `fetchData` 重新加载列表数据。
10. WHEN `handleStatusChange` 被调用，THE `useFeatureList` Hook SHALL 调用 `updateItem` 并使用配置的 `statusField`（默认为 `isOnline`）作为更新字段名。
11. WHEN `handleStatusChange` 执行成功，THE `useFeatureList` Hook SHALL 调用 `fetchData` 重新加载列表数据。

---

### Requirement 2: 通用 FeatureListContainer 组件

**User Story:** 作为前端开发者，我希望有一个通用的列表容器组件，以便各功能模块无需重复实现"新建按钮 + Table + 加载状态"的页面外壳。

#### Acceptance Criteria

1. THE `FeatureListContainer` 组件 SHALL 渲染一个包含新建按钮和数据表格的容器布局。
2. WHEN `onCreateClick` 回调被触发，THE `FeatureListContainer` 组件 SHALL 调用 `onCreateClick` 回调。
3. WHILE `loading` 为 `true`，THE `FeatureListContainer` 组件 SHALL 在表格区域显示加载状态。
4. THE `FeatureListContainer` 组件 SHALL 使用传入的 `columns` 定义渲染表格列，默认使用 `_id` 作为 `rowKey`。
5. WHERE `createButtonText` 已传入，THE `FeatureListContainer` 组件 SHALL 使用该文本作为新建按钮的标签，否则使用"新建"作为默认标签。
6. WHERE `headerExtra` 已传入，THE `FeatureListContainer` 组件 SHALL 在表格头部区域渲染该额外元素。
7. WHERE `pagination` 为 `false`，THE `FeatureListContainer` 组件 SHALL 不显示分页控件。

---

### Requirement 3: GroupContextForm 包装器组件

**User Story:** 作为前端开发者，我希望有一个统一的 Form 弹窗包装器，以便各功能模块无需重复实现弹窗开关和群组上下文感知逻辑。

#### Acceptance Criteria

1. THE `GroupContextForm` 组件 SHALL 接受 `open`、`onClose`、`title`、`fixedGroupId`（可选）、`width`（可选）和 `children` 属性。
2. WHEN `open` 为 `true`，THE `GroupContextForm` 组件 SHALL 显示弹窗并渲染 `children` 内容。
3. WHEN `open` 为 `false`，THE `GroupContextForm` 组件 SHALL 隐藏弹窗。
4. WHEN 弹窗关闭操作被触发，THE `GroupContextForm` 组件 SHALL 调用 `onClose` 回调。

---

### Requirement 4: 功能模块 Form 组件统一接口

**User Story:** 作为前端开发者，我希望所有功能模块的 Form 组件遵循统一的 Props 接口，以便在不同场景（机器人级 / 群组级）下可互换使用。

#### Acceptance Criteria

1. THE 功能模块 Form 组件 SHALL 实现包含 `open`、`onClose`、`currentRow`、`editingRecord`（可选）、`onSuccess`、`fixedGroupId`（可选）的标准 Props 接口。
2. WHEN `editingRecord` 不为 `null` 且包含 `_id` 字段，THE Form 组件 SHALL 调用 `updateItem` 完成提交，而非 `addItem`。
3. WHEN `editingRecord` 为 `null` 或未传入，THE Form 组件 SHALL 调用 `addItem` 完成提交，而非 `updateItem`。
4. WHEN `fixedGroupId` 已传入，THE Form 组件 SHALL 不渲染可交互的 GroupSelect 选择器。
5. WHEN `fixedGroupId` 未传入，THE Form 组件 SHALL 渲染可交互的 GroupSelect 选择器供用户选择目标群组。
6. WHEN Form 提交成功，THE Form 组件 SHALL 调用 `onSuccess` 回调。
7. WHEN `onClose` 被调用，THE Form 组件 SHALL 在关闭前重置所有表单字段及内部状态（富文本、媒体文件、菜单配置等）。

---

### Requirement 5: XxxGroupContent 群组上下文容器

**User Story:** 作为群组管理员，我希望在群组功能弹窗中查看和管理当前群组的功能配置，以便操作范围仅限于该群组，不影响其他群组数据。

#### Acceptance Criteria

1. THE `XxxGroupContent` 组件 SHALL 接受 `open`、`bot` 和 `group` 属性。
2. WHEN `XxxGroupContent` 渲染时，THE 组件 SHALL 以 `bot._id` 和 `group._id` 调用 `useFeatureList`，同时传入 `enabled: open`。
3. WHEN `open` 为 `true`，THE 组件 SHALL 触发数据加载并展示经 `group._id` 过滤的列表数据。
4. WHEN 用户在 `XxxGroupContent` 中新建记录，THE 组件 SHALL 将 `group._id` 作为 `fixedGroupId` 传入 Form 组件，使新建记录自动关联当前群组。
5. WHEN 用户在 `XxxGroupContent` 中新建记录，THE 组件 SHALL 不显示 GroupSelect 选择器。
6. IF 加载的任意数据记录的 `group` 字段不等于传入的 `group._id`，THEN THE 系统 SHALL 视为数据异常，不将该记录展示在列表中。

---

### Requirement 6: XxxFeatureTab 机器人级独立容器

**User Story:** 作为机器人管理员，我希望在机器人级功能 Tab 中查看该机器人下所有群组的功能配置，以便进行跨群组的统一管理。

#### Acceptance Criteria

1. THE `XxxFeatureTab (index.tsx)` 组件 SHALL 接受 `currentRow`（BotRecord）属性。
2. WHEN `XxxFeatureTab` 渲染时，THE 组件 SHALL 以 `currentRow._id` 调用 `useFeatureList`，且不传入 `groupId`。
3. THE 组件 SHALL 渲染包含所有群组数据的列表，列定义中应包含"群组"列。
4. WHEN 用户在 `XxxFeatureTab` 中新建记录，THE 组件 SHALL 不传入 `fixedGroupId`，使 Form 组件显示 GroupSelect 供用户选择目标群组。

---

### Requirement 7: 废弃并删除 \*GroupModal.tsx 文件

**User Story:** 作为前端开发者，我希望删除所有冗余的 `*GroupModal.tsx` 文件，以便统一由 `GroupFeaturesModal` 和 `XxxGroupContent` 提供群组级弹窗功能，消除代码重复。

#### Acceptance Criteria

1. THE 系统 SHALL 删除所有 `*GroupModal.tsx` 文件（如 `AuctionRuleGroupModal.tsx`、`LotteryRuleGroupModal.tsx` 等）。
2. WHEN 原 `*GroupModal.tsx` 的调用方式被替换，THE 调用方 SHALL 改为使用 `GroupFeaturesModal` + `XxxGroupContent` 提供等价功能。
3. THE 系统 SHALL 删除所有独立的 `*GroupSelect.tsx` 文件，相关逻辑整合进 `GroupContextForm` 或 Form 组件内部的条件渲染。

---

### Requirement 8: CheckinRule 特殊场景支持

**User Story:** 作为前端开发者，我希望 CheckinRule 模块在使用通用 Hook 的同时能保留 Card 布局，以便与该场景下只有两条固定规则的业务特性相符。

#### Acceptance Criteria

1. THE `CheckinRule` 模块 SHALL 使用 `useFeatureList` 管理数据加载和状态，而不独立实现状态管理逻辑。
2. THE `CheckinRule` 模块 SHALL 使用 Card 布局替代 `FeatureListContainer` 的 Table 布局渲染数据。

---

### Requirement 9: 数据模型完整性

**User Story:** 作为前端开发者，我希望所有功能记录都基于统一的基础数据模型，以便在通用容器层中安全地操作 `_id`、`isOnline` 等公共字段。

#### Acceptance Criteria

1. THE 所有功能数据记录类型 SHALL 扩展 `FeatureBaseRecord` 接口，该接口包含 `_id: string`、`bot: string | BotRecord`、`group?: string | GroupRecord`、`isOnline: boolean`、`createdAt: string`、`updatedAt: string`。
2. THE `useFeatureList` Hook 的泛型约束 SHALL 要求类型参数 `T` 至少包含 `_id: string` 字段。
