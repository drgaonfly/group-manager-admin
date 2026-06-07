import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, message, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HistoryOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';
import { queryList } from '@/services/ant-design-pro/api';
import CheckinRuleForm from './CheckinRuleForm';

interface CheckinRuleRecord {
  _id: string;
  group?: { _id: string; title: string; username?: string };
  type: string;
  reward: number;
  keywords: string[];
  isOnline: boolean;
  enableStreakBonus: boolean;
  streakCycles?: { days: number; multiplier: number }[];
  maxMultiplier?: number;
}

interface CheckinHistoryRecord {
  _id: string;
  botUser?: { userName?: string; firstName?: string; lastName?: string };
  group?: { title: string };
  type: string;
  reward: number;
  streakDays: number;
  multiplier: number;
  createdAt: string;
}

interface CheckinRuleTabProps {
  currentRow: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const CheckinRuleTab: React.FC<CheckinRuleTabProps> = ({ currentRow, onBotUpdate }) => {
  const [rules, setRules] = useState<CheckinRuleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CheckinRuleRecord | null>(null);

  // 签到记录 Modal
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyGroupId, setHistoryGroupId] = useState<string | null>(null);
  const [historyGroupTitle, setHistoryGroupTitle] = useState('');
  const [histories, setHistories] = useState<CheckinHistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyCurrent, setHistoryCurrent] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const historyPageSize = 20;

  const fetchRules = async () => {
    if (!currentRow?._id) return;
    setLoading(true);
    try {
      const response = await queryList('/checkin-rules', {
        current: 1,
        pageSize: 100,
        botId: currentRow._id,
      });
      if (response?.data) {
        setRules(response.data as any);
      }
    } catch (error) {
      console.error('获取签到规则失败:', error);
      message.error('获取签到规则失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistories = async (groupId: string, page = 1) => {
    setHistoryLoading(true);
    try {
      const res = await request('/checkin-rules/histories', {
        method: 'GET',
        params: { botId: currentRow._id, groupId, current: page, pageSize: historyPageSize },
      });
      if (res?.success) {
        setHistories(res.data || []);
        setHistoryTotal(res.total || 0);
      }
    } catch {
      message.error('获取签到记录失败');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (currentRow?._id) {
      fetchRules();
    }
  }, [currentRow]);

  const handleCreate = () => {
    setEditingRecord(null);
    setFormOpen(true);
  };

  const handleEdit = (record: CheckinRuleRecord) => {
    setEditingRecord(record);
    setFormOpen(true);
  };

  const handleDelete = async (record: CheckinRuleRecord) => {
    try {
      await request(`/checkin-rules/${record._id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchRules();
      if (onBotUpdate) {
        await onBotUpdate({ _id: currentRow._id });
      }
    } catch {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const url = editingRecord ? `/checkin-rules/${editingRecord._id}` : '/checkin-rules';
      const method = editingRecord ? 'PUT' : 'POST';
      await request(url, { method, data: { ...values, bot: currentRow._id } });
      message.success(editingRecord ? '更新成功' : '创建成功');
      setFormOpen(false);
      fetchRules();
      if (onBotUpdate) {
        await onBotUpdate({ _id: currentRow._id });
      }
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || '操作失败');
    }
  };

  const handleViewHistory = (record: CheckinRuleRecord) => {
    if (!record.group?._id) return;
    setHistoryGroupId(record.group._id);
    setHistoryGroupTitle(record.group.title);
    setHistoryCurrent(1);
    setHistoryVisible(true);
    fetchHistories(record.group._id, 1);
  };

  const getTypeText = (type: string) => ({ daily: '每日签到', first: '初次签到' }[type] || type);

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
              <span style={{ color: '#999', marginLeft: 4 }}>@{group.username}</span>
            )}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => getTypeText(type),
    },
    {
      title: '奖励积分',
      dataIndex: 'reward',
      key: 'reward',
    },
    {
      title: '触发关键词',
      dataIndex: 'keywords',
      key: 'keywords',
      render: (keywords: string[]) => (Array.isArray(keywords) ? keywords.join('、') : keywords),
    },
    {
      title: '连续奖励',
      dataIndex: 'enableStreakBonus',
      key: 'enableStreakBonus',
      render: (v: boolean) =>
        v ? <Tag color="green">已启用</Tag> : <Tag color="default">未启用</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'isOnline',
      key: 'isOnline',
      render: (v: boolean) => (v ? <Tag color="green">启用</Tag> : <Tag color="default">停用</Tag>),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: CheckinRuleRecord) => (
        <Space size="small">
          <Button
            icon={<HistoryOutlined />}
            size="small"
            onClick={() => handleViewHistory(record)}
            disabled={!record.group?._id}
          >
            签到记录
          </Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该签到规则吗？"
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

  const historyColumns = [
    {
      title: '用户',
      dataIndex: 'botUser',
      key: 'botUser',
      render: (u: any) =>
        u?.userName
          ? `@${u.userName}`
          : `${u?.firstName || ''}${u?.lastName ? ' ' + u.lastName : ''}`.trim() || '-',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => getTypeText(type),
    },
    {
      title: '获得积分',
      dataIndex: 'reward',
      key: 'reward',
    },
    {
      title: '连续天数',
      dataIndex: 'streakDays',
      key: 'streakDays',
    },
    {
      title: '倍率',
      dataIndex: 'multiplier',
      key: 'multiplier',
      render: (v: number) => `${v}x`,
    },
    {
      title: '签到时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
  ];

  return (
    <div>
      <Card
        title="签到规则管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新增签到规则
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={rules}
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

      {/* 新增 / 编辑规则 Modal */}
      <Modal
        title={editingRecord ? '编辑签到规则' : '新增签到规则'}
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        footer={null}
        width="80%"
        style={{ maxWidth: 1000 }}
        destroyOnClose
      >
        <CheckinRuleForm
          currentRow={currentRow}
          editingRecord={editingRecord}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      {/* 签到记录 Modal */}
      <Modal
        title={`签到记录 — ${historyGroupTitle}`}
        open={historyVisible}
        onCancel={() => setHistoryVisible(false)}
        footer={null}
        width="80%"
        style={{ maxWidth: 1000 }}
        destroyOnClose
      >
        <Table
          columns={historyColumns}
          dataSource={histories}
          loading={historyLoading}
          rowKey="_id"
          pagination={{
            current: historyCurrent,
            pageSize: historyPageSize,
            total: historyTotal,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: (page) => {
              setHistoryCurrent(page);
              fetchHistories(historyGroupId!, page);
            },
          }}
        />
      </Modal>
    </div>
  );
};

export default CheckinRuleTab;
