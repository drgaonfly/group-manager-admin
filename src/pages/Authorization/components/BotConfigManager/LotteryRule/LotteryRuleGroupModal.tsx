import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Space, message, Popconfirm, Tag, Tooltip } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  UserOutlined,
  PushpinOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { queryList } from '@/services/ant-design-pro/api';
import { request } from '@umijs/max';
import LotteryForm from './LotteryForm';

interface Props {
  open: boolean;
  onClose: () => void;
  bot: any;
  group: any;
}

const LotteryRuleGroupModal: React.FC<Props> = ({ open, onClose, bot, group }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [participantsData, setParticipantsData] = useState<any[]>([]);

  const fetchData = async () => {
    if (!bot?._id || !group?._id) return;
    setLoading(true);
    try {
      const res = await queryList('/lotteries', {
        current: 1,
        pageSize: 100,
        botId: bot._id,
        groupId: group._id,
      });
      if (res?.data) setData(res.data);
    } catch {
      message.error('获取抽奖列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open, bot?._id, group?._id]);

  const handleSubmit = async (values: any) => {
    try {
      const url = editingRecord ? `/lotteries/${editingRecord._id}` : '/lotteries';
      const method = editingRecord ? 'PUT' : 'POST';
      await request(url, { method, data: { ...values, bot: bot._id, group: group._id } });
      message.success(editingRecord ? '更新成功' : '创建成功');
      setFormModalOpen(false);
      fetchData();
    } catch (e: any) {
      throw new Error(e?.message || '操作失败');
    }
  };

  const handleDelete = async (record: any) => {
    try {
      await request(`/lotteries/${record._id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchData();
    } catch {
      message.error('删除失败');
    }
  };

  const handleDraw = async (record: any) => {
    try {
      await request(`/lotteries/${record._id}/draw`, { method: 'POST' });
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
      message.error('获取参与者失败');
    }
  };

  const getStatusTag = (status: string) =>
    ({
      pending: <Tag color="orange">待开始</Tag>,
      ongoing: <Tag color="green">进行中</Tag>,
      completed: <Tag color="red">已完成</Tag>,
    }[status] || <Tag>{status}</Tag>);

  const columns = [
    { title: '活动标题', dataIndex: 'title', ellipsis: true },
    { title: '关键词', dataIndex: 'keywords', render: (k: string[]) => k?.join(', ') },
    { title: '奖品数', dataIndex: 'prizes', render: (p: any[]) => p?.length || 0, width: 70 },
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
      width: 150,
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
              onClick={() => handleDraw(record)}
            >
              开奖
            </Button>
          )}
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingRecord(record);
              setFormModalOpen(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record)}>
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
      <Modal
        title={`群抽奖 — ${group?.title}`}
        open={open}
        onCancel={onClose}
        footer={null}
        width={1000}
        destroyOnClose
      >
        <div style={{ marginBottom: 12 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRecord(null);
              setFormModalOpen(true);
            }}
          >
            创建抽奖活动
          </Button>
        </div>
        <Table
          rowKey="_id"
          dataSource={data}
          columns={columns}
          loading={loading}
          size="small"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
        />
      </Modal>

      <Modal
        title={editingRecord ? '编辑抽奖活动' : '创建抽奖活动'}
        open={formModalOpen}
        onCancel={() => setFormModalOpen(false)}
        footer={null}
        width="80%"
        style={{ maxWidth: 1000 }}
        destroyOnClose
      >
        <LotteryForm
          currentRow={editingRecord}
          botId={bot?._id}
          fixedGroupId={editingRecord ? undefined : group?._id}
          onSubmit={handleSubmit}
          onCancel={() => setFormModalOpen(false)}
        />
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

export default LotteryRuleGroupModal;
