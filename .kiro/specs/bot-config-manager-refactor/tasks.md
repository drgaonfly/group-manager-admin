# Implementation Plan: BotConfigManager 多功能管理框架重构

## Overview

分三个阶段完成重构：

1. **阶段一** — 建立通用基础层（`useFeatureList` Hook、`FeatureListContainer`、`GroupContextForm`）
2. **阶段二** — 逐模块迁移（按冗余程度依次迁移各功能模块）
3. **阶段三** — 清理废弃文件（删除 `*GroupModal.tsx` 和 `*GroupSelect.tsx`）

---

## Tasks

- [x] 1. 建立通用基础层 — 数据模型与类型定义

  - [x] 1.1 创建 `FeatureBaseRecord`、`BotRecord`、`GroupRecord` 及相关公共类型定义文件
    - 在 `src/pages/Authorization/components/BotConfigManager/types.ts` 中定义 `FeatureBaseRecord`、`BotRecord`、`GroupRecord`、`GroupContext`、`StandardFormProps` 接口
    - `FeatureBaseRecord` 须包含 `_id`、`bot`、`group`（可选）、`isOnline`、`createdAt`、`updatedAt` 字段
    - `StandardFormProps` 须包含 `open`、`onClose`、`currentRow`、`editingRecord`（可选）、`onSuccess`、`fixedGroupId`（可选）字段
    - _Requirements: 9.1, 4.1_

- [x] 2. 建立通用基础层 — `useFeatureList` Hook

  - [x] 2.1 实现 `useFeatureList` 泛型 Hook

    - 创建 `src/pages/Authorization/components/BotConfigManager/hooks/useFeatureList.ts`
    - 实现 `UseFeatureListOptions<T>` 和 `UseFeatureListReturn<T>` 接口
    - 实现 `fetchData`：根据 `groupId` 有无在请求参数中条件附加 `groupId`；`enabled=false` 时不执行请求
    - 实现 `openCreate`、`openEdit`、`closeForm` 状态管理
    - 实现 `handleDelete`（支持 `batch` / `single` 两种模式）及成功后调用 `fetchData`
    - 实现 `handleStatusChange`（使用 `statusField`，默认 `isOnline`）及成功后调用 `fetchData`
    - 实现 `enabled` 从 `false` → `true` 时自动触发 `fetchData`
    - 泛型约束 `T extends { _id: string }`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 9.2_

  - [ ]\* 2.2 为 `useFeatureList` 编写属性测试（Property 3：enabled 门控）

    - **Property 3: `useFeatureList` 的 enabled 门控**
    - 使用 `fast-check` 验证：`enabled=false` 时不发起 API 请求；`enabled` 从 `false` 切换为 `true` 时恰好触发一次 `fetchData`
    - **Validates: Requirements 1.4, 1.5**

  - [ ]\* 2.3 为 `useFeatureList` 编写属性测试（Property 6：fetchData 请求参数 groupId 隔离）

    - **Property 6: fetchData 请求参数的 groupId 隔离**
    - 使用 `fast-check` 验证：传入 `groupId` 时请求参数包含 `groupId`；未传入时请求参数不包含 `groupId`
    - **Validates: Requirements 1.2, 1.3**

  - [ ]\* 2.4 为 `useFeatureList` 编写属性测试（Property 4：写操作后状态最终一致性）

    - **Property 4: 写操作后的状态最终一致性**
    - 使用 `fast-check` 验证：`handleDelete` 或 `handleStatusChange` 成功后必须调用 `fetchData`；失败时不调用
    - **Validates: Requirements 1.9, 1.11**

  - [ ]\* 2.5 为 `useFeatureList` 编写单元测试
    - 测试 `openCreate` / `openEdit` / `closeForm` 的状态转换
    - 测试 `handleDelete` 失败后不修改本地数据、不调用 `fetchData`
    - _Requirements: 1.6, 1.7, 1.8, 1.9_

- [x] 3. 建立通用基础层 — `FeatureListContainer` 组件

  - [x] 3.1 实现 `FeatureListContainer<T>` 通用列表容器组件

    - 创建 `src/pages/Authorization/components/BotConfigManager/components/FeatureListContainer.tsx`
    - 实现 `FeatureListContainerProps<T>` 接口（`data`、`loading`、`columns`、`createButtonText`、`onCreateClick`、`rowKey`、`headerExtra`、`pagination`、`scroll`）
    - 新建按钮默认文本"新建"，`createButtonText` 传入时使用传入值
    - `loading=true` 时表格显示加载状态
    - 默认 `rowKey='_id'`
    - `headerExtra` 传入时在头部区域渲染
    - `pagination=false` 时不显示分页控件
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]\* 3.2 为 `FeatureListContainer` 编写单元测试
    - 测试新建按钮文字、加载状态、分页隐藏、`headerExtra` 渲染、点击按钮触发回调
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 2.7_

- [x] 4. 建立通用基础层 — `GroupContextForm` 包装器组件

  - [x] 4.1 实现 `GroupContextForm` 弹窗包装器组件

    - 创建 `src/pages/Authorization/components/BotConfigManager/components/GroupContextForm.tsx`
    - 实现 `GroupContextFormProps`（`open`、`onClose`、`title`、`fixedGroupId`、`width`、`children`）
    - `open=true` 时显示弹窗，`open=false` 时隐藏
    - 关闭操作触发 `onClose` 回调
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]\* 4.2 为 `GroupContextForm` 编写单元测试
    - 测试 `open=true/false` 的显示/隐藏；测试关闭触发 `onClose`
    - _Requirements: 3.2, 3.3, 3.4_

- [x] 5. 阶段一 Checkpoint

  - 所有基础层文件零诊断错误，阶段一完成。

- [x] 6. 迁移 GroupMessage 模块（参考实现）

  - [x] 6.1 重构 `GroupMessage/index.tsx` 使用 `useFeatureList` + `FeatureListContainer`

    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 6.2 创建 `GroupMessage/GroupMessageGroupContent.tsx` 群组上下文容器

    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 6.3 更新 `GroupMessageForm.tsx` 符合 `StandardFormProps` 接口

    - 已支持 `fixedGroupId`、`editingRecord`、`onSuccess`、关闭时重置状态
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ]\* 6.4 为 `GroupMessageForm` 编写属性测试（Property 2：新建/编辑路径互斥）
  - [ ]\* 6.5 为 `GroupMessageForm` 编写属性测试（Property 5：fixedGroupId 对 GroupSelect 渲染的单调控制）
  - [ ]\* 6.6 为 `GroupMessageForm` 编写属性测试（Property 7：Form 关闭后状态归零）
  - [ ]\* 6.7 为 `GroupMessageGroupContent` 编写属性测试（Property 1：群组上下文隔离）

- [x] 7. 迁移 ReplyRule 模块

  - [x] 7.1 重构 `ReplyRule/index.tsx` 使用 `useFeatureList` + `FeatureListContainer`
  - [x] 7.2 创建 `ReplyRule/ReplyRuleGroupContent.tsx` 群组上下文容器
  - [x] 7.3 更新 `ReplyRuleForm.tsx` 符合 `StandardFormProps` 接口（已有完整支持）

- [x] 8. 迁移 AdRemoval 模块

  - [x] 8.1 重构 `AdRemoval/index.tsx` 使用 `useFeatureList` + `FeatureListContainer`
  - [x] 8.2 创建 `AdRemoval/AdRemovalGroupContent.tsx` 群组上下文容器
  - [x] 8.3 更新 `AdRemovalForm.tsx` 符合 `StandardFormProps` 接口（已有完整支持）

- [x] 9. 迁移 GroupWelcome 模块

  - [x] 9.1 重构 `GroupWelcome/index.tsx` 使用 `useFeatureList` + `FeatureListContainer`
  - [x] 9.2 创建 `GroupWelcome/GroupWelcomeGroupContent.tsx` 群组上下文容器
  - [x] 9.3 更新 `GroupWelcomeForm.tsx` 符合 `StandardFormProps` 接口（已有完整支持）

- [x] 10. 迁移 GroupVerify 模块

  - [x] 10.1 重构 `GroupVerify/index.tsx` 使用 `useFeatureList` + `FeatureListContainer`
  - [x] 10.2 创建 `GroupVerify/GroupVerifyGroupContent.tsx` 群组上下文容器
  - [x] 10.3 更新 `GroupVerifyForm.tsx` 符合 `StandardFormProps` 接口（已有完整支持）

- [x] 11. 迁移 SpeechStatistics 模块

  - [x] 11.1 重构 `SpeechStatistics/index.tsx` 使用 `useFeatureList` + `FeatureListContainer`
  - [x] 11.2 创建 `SpeechStatistics/SpeechStatisticsGroupContent.tsx` 群组上下文容器
  - [x] 11.3 更新 `SpeechStatisticsForm.tsx` 符合 `StandardFormProps` 接口（已有完整支持）

- [x] 12. 迁移 LotteryRule 模块

  - [x] 12.1 重构 `LotteryRule/index.tsx` 使用 `useFeatureList` + `FeatureListContainer`
  - [x] 12.2 创建 `LotteryRule/LotteryRuleGroupContent.tsx` 群组上下文容器（替换 `LotteryRuleGroupModal.tsx`）
  - [x] 12.3 更新 `LotteryForm.tsx` 符合 `StandardFormProps` 接口（已有完整支持）

- [x] 13. 迁移 AuctionRule 模块

  - [x] 13.1 重构 `AuctionRule/index.tsx` 使用 `useFeatureList` + `FeatureListContainer`
  - [x] 13.2 创建 `AuctionRule/AuctionRuleGroupContent.tsx` 群组上下文容器（替换 `AuctionRuleGroupModal.tsx`）
  - [x] 13.3 更新 `AuctionForm.tsx` 符合 `StandardFormProps` 接口（已有完整支持）

- [x] 14. 迁移 CheckinRule 模块（特殊 Card 布局）

  - [x] 14.1 重构 `CheckinRule` 使用 `useFeatureList` 管理状态，保留 Card 布局
    - _Requirements: 8.1, 8.2_

- [x] 15. 阶段二 Checkpoint

  - 所有模块迁移完成，全部文件零诊断错误，阶段二完成。

- [x] 16. 清理废弃文件

  - [x] 16.1 删除所有 `*GroupModal.tsx` 废弃文件（9 个全部删除）

    - _Requirements: 7.1, 7.2_

  - [x] 16.2 删除所有独立 `*GroupSelect.tsx` 废弃文件（9 个全部删除）
    - _Requirements: 7.3_

- [x] 17. 最终 Checkpoint
  - 所有新文件、重构文件诊断零错误，废弃文件已全部清理。重构完成。

---

## Remaining (Optional Tests)

以下为标有 `*` 的可选属性测试任务，不影响功能交付：

- [ ]\* 2.2 useFeatureList enabled 门控属性测试
- [ ]\* 2.3 useFeatureList groupId 隔离属性测试
- [ ]\* 2.4 useFeatureList 写操作一致性属性测试
- [ ]\* 2.5 useFeatureList 单元测试
- [ ]\* 3.2 FeatureListContainer 单元测试
- [ ]\* 4.2 GroupContextForm 单元测试
- [ ]\* 6.4–6.7 GroupMessageForm / GroupMessageGroupContent 属性测试

## Notes

- 任务标有 `*` 的为可选测试子任务，已跳过以加快 MVP 交付
- 每个任务均引用了对应需求，确保可追溯性
- CheckinRule（任务 14）为特殊场景，保留 Card 布局，仅复用 Hook 层
- `*GroupModal.tsx` 和 `*GroupSelect.tsx` 文件已在阶段三统一删除（共 18 个文件）
