import React, { useMemo } from 'react';
import { Button, Space, Tag, Popconfirm, Alert } from 'antd';
import { EditOutlined, DeleteOutlined, MoonOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import FeatureListContainer from '../../components/FeatureListContainer';
import useFeatureList from '../../../hooks/useFeatureList';
import NightModeForm from './Form';

/** 分钟数（0–1439）→ "HH:mm" 展示字符串 */
const minutesToLabel = (m: number) => {
  const h = Math.floor(m / 60)
    .toString()
    .padStart(2, '0');
  const min = (m % 60).toString().padStart(2, '0');
  return `${h}:${min}`;
};

interface Props {
  open: boolean;
  bot: any;
  group: any;
}

const NightModeContent: React.FC<Props> = ({ open, bot, group }) => {
  const state = useFeatureList<any>({
    apiPath: '/night-modes',
    botId: bot?._id,
    groupId: group?._id,
    enabled: open,
    deleteMode: 'single',
  });

  const { data, loading, formOpen, editingRecord, openCreate, openEdit, closeForm, handleDelete } =
    state;

  const columns: ColumnsType<any> = useMemo(
    () => [
      {
        title: '状态',
        dataIndex: 'isActive',
        key: 'isActive',
        width: 80,
        render: (_: any, record: any) =>
          record.isActive ? <Tag color="blue">启用</Tag> : <Tag>禁用</Tag>,
      },
      {
        title: '开始时间（UTC）',
        dataIndex: 'startAt',
        key: 'startAt',
        width: 130,
        render: (v: any) => (typeof v === 'number' ? minutesToLabel(v) : '-'),
      },
      {
        title: '结束时间（UTC）',
        dataIndex: 'endAt',
        key: 'endAt',
        width: 130,
        render: (v: any) => (typeof v === 'number' ? minutesToLabel(v) : '-'),
      },
      {
        title: '操作',
        key: 'action',
        width: 140,
        fixed: 'right' as const,
        render: (_: any, record: any) => (
          <Space size="small">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定删除夜间模式配置吗？"
              onConfirm={() => handleDelete(record._id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [openEdit, handleDelete],
  );

  const renderMobileCard = (record: any) => (
    <div className="flex justify-between items-center">
      <div className="flex gap-2 items-center">
        {record.isActive ? <Tag color="blue">启用</Tag> : <Tag>禁用</Tag>}
        <span className="text-sm text-gray-600">
          {typeof record.startAt === 'number' ? minutesToLabel(record.startAt) : '-'}
          {' ~ '}
          {typeof record.endAt === 'number' ? minutesToLabel(record.endAt) : '-'}
        </span>
      </div>
      <Space size="small">
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
          编辑
        </Button>
        <Popconfirm
          title="确定删除？"
          onConfirm={() => handleDelete(record._id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      </Space>
    </div>
  );

  return (
    <>
      <FeatureListContainer<any>
        title="夜间模式"
        data={data}
        loading={loading}
        columns={columns}
        createButtonText={data.length > 0 ? '编辑配置' : '新建配置'}
        onCreateClick={() => {
          if (data.length > 0) {
            openEdit(data[0]);
          } else {
            openCreate();
          }
        }}
        pagination={false}
        scroll={{ x: 500 }}
        renderMobileCard={renderMobileCard}
        headerExtra={
          <Alert
            message="夜间模式"
            description="启用后，Bot 将在设定的 UTC 时间段内对群组全体禁言，时段结束后自动解禁。支持跨午夜区间（如 22:00 ~ 08:00）。Bot 需拥有管理员权限。"
            type="info"
            showIcon
            icon={<MoonOutlined />}
            closable
          />
        }
      />

      <NightModeForm
        visible={formOpen}
        record={editingRecord}
        bot={bot}
        group={group}
        onClose={(refresh?: boolean) => {
          closeForm();
          if (refresh) state.fetchData();
        }}
      />
    </>
  );
};

export default NightModeContent;
