import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, message, Space, Tag, Popconfirm } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import LotteryForm from './LotteryForm';

interface LotteryRecord {
  _id: string;
  title: string;
  keywords: string[];
  status: 'pending' | 'ongoing' | 'completed';
  prizes: any[];
  drawMethod: string[];
  fullParticipantsCount?: number;
  scheduledDrawTime?: string;
  createdAt: string;
  updatedAt: string;
}

interface LotteryRuleProps {
  currentRow: any;
}

const LotteryRule: React.FC<LotteryRuleProps> = ({ currentRow }) => {
  const [data, setData] = useState<LotteryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LotteryRecord | null>(null);
  const [participantsModalVisible, setParticipantsModalVisible] = useState(false);
  const [participantsData, setParticipantsData] = useState<any[]>([]);

  const fetchLotteries = async () => {
    if (!currentRow?._id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/lotteries?botId=${currentRow._id}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      message.error('获取抽奖列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentRow?._id) {
      fetchLotteries();
    }
  }, [currentRow]);

  const handleCreate = () => {
    setEditingRecord(null);
    setModalVisible(true);
  };

  const handleEdit = (record: LotteryRecord) => {
    setEditingRecord(record);
    setModalVisible(true);
  };

  const handleDelete = async (record: LotteryRecord) => {
    try {
      await fetch(`/lotteries/${record._id}`, {
        method: 'DELETE',
      });
      message.success('删除成功');
      fetchLotteries();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleDraw = async (record: LotteryRecord) => {
    try {
      await fetch(`/api/lotteries/${record._id}/draw`, {
        method: 'POST',
      });
      message.success('开奖成功');
      fetchLotteries();
    } catch (error) {
      message.error('开奖失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const url = editingRecord ? `/lotteries/${editingRecord._id}` : '/lotteries';
      const method = editingRecord ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          bot: currentRow._id,
        }),
      });

      if (!response.ok) {
        throw new Error('提交失败');
      }

      message.success(editingRecord ? '更新成功' : '创建成功');
      setModalVisible(false);
      fetchLotteries();
    } catch (error: any) {
      throw new Error(error.message || '操作失败');
    }
  };

  const showParticipants = async (record: LotteryRecord) => {
    try {
      const response = await fetch(`/lotteries/${record._id}/participants`);
      const result = await response.json();
      if (result.success) {
        setParticipantsData(result.data);
        setParticipantsModalVisible(true);
      }
    } catch (error) {
      message.error('获取参与者列表失败');
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'pending':
        return <Tag color="orange">待开始</Tag>;
      case 'ongoing':
        return <Tag color="green">进行中</Tag>;
      case 'completed':
        return <Tag color="red">已完成</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: '活动标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '关键词',
      dataIndex: 'keywords',
      key: 'keywords',
      render: (keywords: string[]) => keywords.join(', '),
    },
    {
      title: '奖品数量',
      dataIndex: 'prizes',
      key: 'prizes',
      render: (prizes: any[]) => prizes?.length || 0,
    },
    {
      title: '开奖方式',
      dataIndex: 'drawMethod',
      key: 'drawMethod',
      render: (drawMethod: string[]) => {
        const methods = [];
        if (drawMethod.includes('fullParticipants')) {
          methods.push('满人开奖');
        }
        if (drawMethod.includes('scheduledTime')) {
          methods.push('定时开奖');
        }
        return methods.join(', ');
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: LotteryRecord) => (
        <Space size="small">
          <Button icon={<UserOutlined />} onClick={() => showParticipants(record)} size="small">
            参与者
          </Button>
          {record.status === 'ongoing' && (
            <Button
              icon={<PlayCircleOutlined />}
              onClick={() => handleDraw(record)}
              size="small"
              type="primary"
            >
              开奖
            </Button>
          )}
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small">
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个抽奖活动吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button icon={<DeleteOutlined />} danger size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const participantsColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (username: string, record: any) =>
        username || record.firstName || `用户${record.telegramId}`,
    },
    {
      title: 'Telegram ID',
      dataIndex: 'telegramId',
      key: 'telegramId',
    },
    {
      title: '是否中奖',
      dataIndex: 'isWinner',
      key: 'isWinner',
      render: (isWinner: boolean) => (isWinner ? <Tag color="green">中奖</Tag> : <Tag>未中奖</Tag>),
    },
    {
      title: '奖品',
      dataIndex: 'prizeName',
      key: 'prizeName',
      render: (prizeName: string, record: any) => {
        if (!prizeName) return '-';
        const prizeText =
          record.prizeType === 'points' ? `${record.prizeValue}积分` : record.prizeValue;
        return `${prizeName}(${prizeText})`;
      },
    },
    {
      title: '参与时间',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (date: string) => moment(date).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <div>
      <Card
        title="抽奖活动管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建抽奖活动
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
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      </Card>

      {/* 创建/编辑抽奖活动模态框 */}
      <Modal
        title={editingRecord ? '编辑抽奖活动' : '创建抽奖活动'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width="80%"
        style={{ maxWidth: 1000 }}
        destroyOnClose
      >
        <LotteryForm
          currentRow={editingRecord}
          onSubmit={handleSubmit}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>

      {/* 参与者列表模态框 */}
      <Modal
        title="参与者列表"
        open={participantsModalVisible}
        onCancel={() => setParticipantsModalVisible(false)}
        footer={null}
        width="80%"
        style={{ maxWidth: 1000 }}
      >
        <Table
          columns={participantsColumns}
          dataSource={participantsData}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      </Modal>
    </div>
  );
};

export default LotteryRule;
