import React, { useState } from 'react';
import { Button, Table, Space, Popconfirm, Tag, Tooltip, Modal, message } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  UserOutlined,
  PushpinOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { request } from '@umijs/max';
import useFeatureList from '../../hooks/useFeatureList';
import FeatureListContainer from '../components/FeatureListContainer';
import LotteryForm from './LotteryForm';

interface LotteryRuleTabProps {
  currentRow: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const LotteryRuleTab: React.FC<LotteryRuleTabProps> = ({ currentRow, onBotUpdate }) => {
  const { data, loading, formOpen, editingRecord, openCreate, openEdit, closeForm, fetchData } =
    useFeatureList({
      apiPath: '/lotteries',
      botId: currentRow?._id,
      deleteMode: 'single',
    });

  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [participantsData, setParticipantsData] = useState<any[]>([]);

  const handleDelete = async (id: string) => {
    try {
      await request(`/lotteries/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchData();
      onBotUpdate?.({ _id: currentRow._id });
    } catch {
      message.error('删除失败');
    }
  };

  const handleDraw = async (id: string) => {
    try {
      await request(`/lotteries/${id}/draw`, { method: 'POST' });
      message.success('开奖成功');
      fetchData();
    } catch {
      message.error('开奖失败');
    }
  };

  const showParticipants = async (record: any) => {
    try {
      const res = await request(`/lotteries/${record._id}/participants`);
      if (res.success) {
        setParticipantsData(res.data);
        setParticipantsModalOpen(true);
      }
    } catch {
      message.error('获取参与者列表失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const url = editingRecord ? `/lotteries/${editingRecord._id}` : '/lotteries';
      const method = editingRecord ? 'PUT' : 'POST';
      await request(url, { method, data: { ...values, bot: currentRow._id } });
      message.success(editingRecord ? '更新成功' : '创建成功');
      closeForm();
      fetchData();
      onBotUpdate?.({ _id: currentRow._id });
    } catch (e: any) {
      throw new Error(e?.message || '操作失败');
    }
  };

  const getStatusTag = (status: string) =>
    ({
      pending: <Tag color="orange">待开始</Tag>,
      ongoing: <Tag color="green">进行中</Tag>,
      completed: <Tag color="red">已完成</Tag>,
    }[status] || <Tag>{status}</Tag>);

  const columns = [
    { title: '活动标题', dataIndex: 'title' },
    {
      title: '群组',
      dataIndex: 'group',
      render: (g: any) => g?.title || '-',
    },
    { title: '关键词', dataIndex: 'keywords', render: (k: string[]) => k?.join(', ') },
    { title: '奖品数', dataIndex: 'prizes', render: (p: any[]) => p?.length || 0, width: 70 },
    {
      title: '开奖方式',
      dataIndex: 'drawMethod',
      render: (methods: string[]) => {
        const labels = [];
        if (methods?.includes('fullParticipants')) labels.push('满人开奖');
        if (methods?.includes('scheduledTime')) labels.push('定时开奖');
        return labels.join(', ') || '-';
      },
    },
    {
      title: '置顶',
      key: 'pins',
      width: 90,
      render: (_: any, r: any) => {
        const pins = [
          r.notifyPin && '活动',
          r.joinSuccessPin && '参与',
          r.drawResultPin && '开奖',
        ].filter(Boolean);
        return pins.length ? (
          <Tooltip title={pins.join(', ')}>
            <Tag color="blue" icon={<PushpinOutlined />}>
              {pins.length}项
            </Tag>
          </Tooltip>
        ) : (
          <Tag>无</Tag>
        );
      },
    },
    { title: '状态', dataIndex: 'status', width: 80, render: getStatusTag },
    {
      title: '操作',
      width: 180,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button icon={<UserOutlined />} size="small" onClick={() => showParticipants(record)}>
            参与者
          </Button>
          {record.status === 'ongoing' && (
            <Button
              icon={<PlayCircleOutlined />}
              size="small"
              type="primary"
              onClick={() => handleDraw(record._id)}
            >
              开奖
            </Button>
          )}
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record._id)}>
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
        createButtonText="创建抽奖活动"
        onCreateClick={openCreate}
      />

      <Modal
        title={editingRecord ? '编辑抽奖活动' : '创建抽奖活动'}
        open={formOpen}
        onCancel={closeForm}
        footer={null}
        width="80%"
        style={{ maxWidth: 1000 }}
        destroyOnClose
      >
        <LotteryForm currentRow={editingRecord} onSubmit={handleSubmit} onCancel={closeForm} />
      </Modal>

      <Modal
        title="参与者列表"
        open={participantsModalOpen}
        onCancel={() => setParticipantsModalOpen(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Table
          rowKey="_id"
          dataSource={participantsData}
          columns={[
            {
              title: '用户名',
              dataIndex: 'username',
              render: (u: string, r: any) => u || r.firstName || `用户${r.telegramId}`,
            },
            { title: 'Telegram ID', dataIndex: 'telegramId' },
            {
              title: '是否中奖',
              dataIndex: 'isWinner',
              render: (v: boolean) => (v ? <Tag color="green">中奖</Tag> : <Tag>未中奖</Tag>),
            },
            {
              title: '奖品',
              dataIndex: 'prizeName',
              render: (n: string, r: any) =>
                n
                  ? `${n}(${r.prizeType === 'points' ? `${r.prizeValue}积分` : r.prizeValue})`
                  : '-',
            },
            {
              title: '参与时间',
              dataIndex: 'joinedAt',
              render: (d: string) => moment(d).format('MM-DD HH:mm'),
            },
          ]}
          size="small"
          pagination={{ pageSize: 10 }}
        />
      </Modal>
    </>
  );
};

export default LotteryRuleTab;
