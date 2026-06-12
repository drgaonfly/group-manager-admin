import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Table, Tag, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useIntl, request } from '@umijs/max';
import SpeechStatisticsForm from './SpeechStatisticsForm';

interface SpeechStatisticsTabProps {
  currentRow: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const CYCLE_LABEL: Record<string, string> = {
  daily: '每日',
  weekly: '每周',
  monthly: '每月',
};

const SpeechStatisticsTab: React.FC<SpeechStatisticsTabProps> = ({ currentRow }) => {
  const intl = useIntl();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(undefined);

  const fetchConfigs = useCallback(async () => {
    if (!currentRow?._id) return;
    setLoading(true);
    try {
      const res = await request('/speech-configs', {
        method: 'GET',
        params: { botId: currentRow._id, current: 1, pageSize: 200 },
      });
      setData(res?.data ?? []);
    } catch {
      message.error('获取发言统计配置失败');
    } finally {
      setLoading(false);
    }
  }, [currentRow?._id]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleCreate = () => {
    setEditingConfig(undefined);
    setFormOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingConfig(record);
    setFormOpen(true);
  };

  const handleDelete = async (record: any) => {
    try {
      await request(`/speech-configs/${record._id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchConfigs();
    } catch {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '群组',
      dataIndex: 'group',
      key: 'group',
      render: (group: any) =>
        group ? (
          <span>
            {group.title}
            {group.username && (
              <span style={{ color: '#999', fontSize: 12, marginLeft: 4 }}>@{group.username}</span>
            )}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: '最小统计字数',
      dataIndex: 'minSpeechLength',
      key: 'minSpeechLength',
      render: (v: number) => `${v} 字`,
    },
    {
      title: '允许纯数字',
      dataIndex: 'allowPureNumberSpeech',
      key: 'allowPureNumberSpeech',
      render: (v: boolean) => (v ? <Tag color="green">是</Tag> : <Tag color="default">否</Tag>),
    },
    {
      title: '排行榜奖励',
      dataIndex: 'enableActivityReward',
      key: 'enableActivityReward',
      render: (v: boolean, record: any) =>
        v ? (
          <Tag color="blue">
            {CYCLE_LABEL[record.activityRewardCycle] || '每日'} 前{record.activityRewardTopN}名 +
            {record.activityRewardPoints}积分
          </Tag>
        ) : (
          <Tag color="default">未启用</Tag>
        ),
    },
    {
      title: '即时发言奖励',
      dataIndex: 'enableSpeechReward',
      key: 'enableSpeechReward',
      render: (v: boolean, record: any) =>
        v ? (
          <Tag color="purple">
            {CYCLE_LABEL[record.speechRewardCycle] || '每日'} 每次+{record.speechRewardPoints}积分
            (上限{record.speechRewardMaxTimes}次)
          </Tag>
        ) : (
          <Tag color="default">未启用</Tag>
        ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该群组的发言统计配置吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button icon={<DeleteOutlined />} size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={intl.formatMessage({
          id: 'speech_statistics',
          defaultMessage: '发言统计',
        })}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            {intl.formatMessage({
              id: 'configure_speech_statistics',
              defaultMessage: '添加群组配置',
            })}
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      </Card>

      <SpeechStatisticsForm
        open={formOpen}
        onOpenChange={setFormOpen}
        currentRow={currentRow}
        editingConfig={editingConfig}
        onSaved={fetchConfigs}
      />
    </div>
  );
};

export default SpeechStatisticsTab;
