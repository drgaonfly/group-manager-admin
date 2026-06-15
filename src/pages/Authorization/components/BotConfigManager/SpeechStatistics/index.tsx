import React from 'react';
import { Button, Tag, Space, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';
import useFeatureList from '../hooks/useFeatureList';
import FeatureListContainer from '../components/FeatureListContainer';
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
  const { data, loading, formOpen, editingRecord, openCreate, openEdit, closeForm, fetchData } =
    useFeatureList({
      apiPath: '/speech-configs',
      botId: currentRow?._id,
      deleteMode: 'single',
    });

  const handleDelete = async (id: string) => {
    try {
      await request(`/speech-configs/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchData();
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
      render: (v: number) => `${v} 字`,
    },
    {
      title: '允许纯数字',
      dataIndex: 'allowPureNumberSpeech',
      render: (v: boolean) => (v ? <Tag color="green">是</Tag> : <Tag color="default">否</Tag>),
    },
    {
      title: '排行榜奖励',
      dataIndex: 'enableActivityReward',
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
      render: (_: any, record: any) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该群组的发言统计配置吗？"
            onConfirm={() => handleDelete(record._id)}
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
    <>
      <FeatureListContainer
        data={data}
        loading={loading}
        columns={columns}
        createButtonText="添加群组配置"
        onCreateClick={openCreate}
      />

      <SpeechStatisticsForm
        open={formOpen}
        onOpenChange={(v) => {
          if (!v) closeForm();
        }}
        currentRow={currentRow}
        editingConfig={editingRecord}
        onSaved={() => {
          closeForm();
          fetchData();
        }}
      />
    </>
  );
};

export default SpeechStatisticsTab;
