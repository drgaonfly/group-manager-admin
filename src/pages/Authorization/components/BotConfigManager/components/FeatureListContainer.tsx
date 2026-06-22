import React from 'react';
import { Button, Table } from 'antd';
import type { ColumnsType, TablePaginationConfig, TableProps } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface FeatureListContainerProps<T> {
  title?: React.ReactNode;
  /** 列表数据 */
  data: T[];
  /** 加载状态 */
  loading: boolean;
  /** Table 列定义 */
  columns: ColumnsType<T>;
  /** 新建按钮文字，默认 "新建" */
  createButtonText?: string;
  /** 点击新建按钮回调 */
  onCreateClick: () => void;
  /** 表格 rowKey，默认 '_id' */
  rowKey?: string;
  /** 额外的头部元素（如 Alert 提示） */
  headerExtra?: React.ReactNode;
  /** 分页配置，false 则不显示 */
  pagination?: false | TablePaginationConfig;
  /** 滚动配置 */
  scroll?: TableProps<T>['scroll'];
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

function FeatureListContainer<T extends object>(props: FeatureListContainerProps<T>): JSX.Element {
  const {
    title,
    data,
    loading,
    columns,
    createButtonText = '新建',
    onCreateClick,
    rowKey = '_id',
    headerExtra,
    pagination,
    scroll,
  } = props;

  return (
    <>
      {headerExtra && <div style={{ marginBottom: 12 }}>{headerExtra}</div>}

      <div
        style={{
          marginBottom: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          {title}
        </div>

        <Button type="primary" icon={<PlusOutlined />} onClick={onCreateClick}>
          {createButtonText}
        </Button>
      </div>

      <Table<T>
        rowKey={rowKey}
        dataSource={data}
        columns={columns}
        loading={loading}
        size="small"
        pagination={pagination === false ? false : { pageSize: 10, ...pagination }}
        scroll={scroll}
      />
    </>
  );
}

export default FeatureListContainer;
