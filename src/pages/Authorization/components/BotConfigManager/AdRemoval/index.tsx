import React from 'react';
import { Alert, Button, message, Space, Switch, Tag, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { updateItem, addItem } from '@/services/ant-design-pro/api';
import { request } from '@umijs/max';
import useFeatureList from '../hooks/useFeatureList';
import FeatureListContainer from '../components/FeatureListContainer';
import AdRemovalForm from './AdRemovalForm';
import { formatDuration } from './DurationInput';

interface AdRemovalTabProps {
  currentRow: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const AdRemovalTab: React.FC<AdRemovalTabProps> = ({ currentRow, onBotUpdate }) => {
  const { data, loading, formOpen, editingRecord, openCreate, openEdit, closeForm, fetchData } =
    useFeatureList({
      apiPath: '/ad-removals',
      botId: currentRow?._id,
      deleteMode: 'single',
    });

  const handleSubmit = async (values: any) => {
    try {
      let res;
      if (editingRecord?._id) {
        res = await updateItem(`/ad-removals/${editingRecord._id}`, values);
      } else {
        res = await addItem('/ad-removals', { ...values, bot: currentRow._id });
      }
      if ((res as any)?.success) {
        message.success(editingRecord?._id ? '更新成功' : '添加成功');
        closeForm();
        fetchData();
        onBotUpdate?.({ _id: currentRow._id });
      }
    } catch {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await request(`/ad-removals/${id}`, { method: 'DELETE' });
      if ((res as any)?.success) {
        message.success('删除成功');
        fetchData();
        onBotUpdate?.({ _id: currentRow._id });
      }
    } catch {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (record: any, isOnline: boolean) => {
    try {
      const res = await updateItem(`/ad-removals/${record._id}`, { isOnline });
      if ((res as any)?.success) {
        message.success('更新成功');
        fetchData();
      }
    } catch {
      message.error('操作失败');
    }
  };

  const renderPunishment = (punishment: any, record: any) => {
    const warning = record?.warning;
    const warningCount = warning?.count ?? 0;
    const warningTag =
      warningCount > 0 ? (
        <Tooltip
          title={`警告 ${warningCount} 次后处罚，时间窗口 ${formatDuration(
            warning?.windowSeconds ?? 0,
          )}`}
        >
          <Tag color="gold" style={{ marginRight: 4 }}>
            警告×{warningCount}
          </Tag>
        </Tooltip>
      ) : null;

    if (!punishment?.type)
      return (
        <>
          {warningTag}
          <Tag>仅删除</Tag>
        </>
      );
    if (punishment.type === 'kick')
      return (
        <>
          {warningTag}
          <Tag color="red">踢出群</Tag>
        </>
      );
    if (punishment.type === 'mute') {
      const label = formatDuration(punishment.muteDuration ?? 0);
      return (
        <>
          {warningTag}
          <Tooltip title={`禁言 ${punishment.muteDuration} 秒`}>
            <Tag color="orange">禁言 {label}</Tag>
          </Tooltip>
        </>
      );
    }
    return (
      <>
        {warningTag}
        <Tag>仅删除</Tag>
      </>
    );
  };

  const columns = [
    { title: '规则名称', dataIndex: 'name', key: 'name' },
    {
      title: '适用群组',
      dataIndex: 'group',
      key: 'group',
      render: (group: any) => {
        if (!group) return <Tag color="default">全部群组</Tag>;
        return <Tag color="blue">{group?.title || group?.toString()}</Tag>;
      },
    },
    {
      title: '行内模式',
      dataIndex: 'mode',
      key: 'mode',
      render: (val: string) =>
        val === 'all' ? <Tag color="blue">全部词</Tag> : <Tag color="green">任意词</Tag>,
    },
    {
      title: '关键词行数',
      dataIndex: 'keywords',
      key: 'keywords',
      render: (keywords: string[][]) => {
        const lines = keywords?.length || 0;
        const total = keywords?.reduce((s, l) => s + (l?.length || 0), 0) || 0;
        return (
          <Tooltip title={`共 ${lines} 行，${total} 个词`}>
            <span>{lines} 行</span>
          </Tooltip>
        );
      },
    },
    {
      title: '处罚',
      dataIndex: 'punishment',
      key: 'punishment',
      render: (p: any, r: any) => renderPunishment(p, r),
    },
    {
      title: '状态',
      dataIndex: 'isOnline',
      key: 'isOnline',
      render: (checked: boolean, record: any) => (
        <Switch checked={checked} size="small" onChange={(v) => handleStatusChange(record, v)} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record._id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <FeatureListContainer
        data={data}
        loading={loading}
        columns={columns}
        createButtonText="添加规则"
        onCreateClick={openCreate}
        pagination={false}
        headerExtra={
          <Alert
            type="warning"
            showIcon
            message="权限提醒"
            description="去除广告功能需要机器人在目标群组中拥有「删除消息」管理员权限。"
          />
        }
      />

      <AdRemovalForm
        open={formOpen}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        initialValues={editingRecord}
        loading={loading}
        botId={currentRow?._id}
      />
    </>
  );
};

export default AdRemovalTab;
