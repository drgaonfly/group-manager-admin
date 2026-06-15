import React, { useState } from 'react';
import { Button, Table, Modal, message, Space, Tag, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, HistoryOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';
import useFeatureList from '../hooks/useFeatureList';
import FeatureListContainer from '../components/FeatureListContainer';
import CheckinRuleForm from './CheckinRuleForm';

interface CheckinRuleTabProps {
  currentRow: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const CheckinRuleTab: React.FC<CheckinRuleTabProps> = ({ currentRow, onBotUpdate }) => {
  const { data, loading, formOpen, editingRecord, openCreate, openEdit, closeForm, fetchData } =
    useFeatureList({
      apiPath: '/checkin-rules',
      botId: currentRow?._id,
      deleteMode: 'single',
    });

  // ── 签到记录 Modal ──────────────────────────────────────────────────────────
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyGroupId, setHistoryGroupId] = useState<string | null>(null);
  const [historyGroupTitle, setHistoryGroupTitle] = useState('');
  const [histories, setHistories] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyCurrent, setHistoryCurrent] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const historyPageSize = 20;

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

  const handleDelete = async (id: string) => {
    try {
      await request(`/checkin-rules/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchData();
      onBotUpdate?.({ _id: currentRow._id });
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
      closeForm();
      fetchData();
      onBotUpdate?.({ _id: currentRow._id });
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || '操作失败');
    }
  };

  const handleViewHistory = (record: any) => {
    if (!record.group?._id) return;
    setHistoryGroupId(record.group._id);
    setHistoryGroupTitle(record.group.title);
    setHistoryCurrent(1);
    setHistoryVisible(true);
    fetchHistories(record.group._id, 1);
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await request(`/checkin-rules/histories/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      const newTotal = historyTotal - 1;
      const maxPage = Math.max(1, Math.ceil(newTotal / historyPageSize));
      const targetPage = historyCurrent > maxPage ? maxPage : historyCurrent;
      setHistoryCurrent(targetPage);
      fetchHistories(historyGroupId!, targetPage);
    } catch {
      message.error('删除失败');
    }
  };

  const getTypeText = (type: string) => ({ daily: '每日签到', first: '初次签到' }[type] || type);

  const columns = [
    {
      title: '群组',
      dataIndex: 'group',
      render: (g: any) =>
        g ? (
          <span>
            {g.title}
            {g.username && <span style={{ color: '#999', marginLeft: 4 }}>@{g.username}</span>}
          </span>
        ) : (
          '-'
        ),
    },
    { title: '类型', dataIndex: 'type', render: getTypeText },
    { title: '奖励积分', dataIndex: 'reward' },
    {
      title: '触发关键词',
      dataIndex: 'keywords',
      render: (k: string[]) => (Array.isArray(k) ? k.join('、') : k),
    },
    {
      title: '连续奖励',
      dataIndex: 'enableStreakBonus',
      render: (v: boolean) =>
        v ? <Tag color="green">已启用</Tag> : <Tag color="default">未启用</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'isOnline',
      render: (v: boolean) => (v ? <Tag color="green">启用</Tag> : <Tag color="default">停用</Tag>),
    },
    {
      title: '操作',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            icon={<HistoryOutlined />}
            size="small"
            onClick={() => handleViewHistory(record)}
            disabled={!record.group?._id}
          >
            签到记录
          </Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该签到规则吗？" onConfirm={() => handleDelete(record._id)}>
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
        createButtonText="新增签到规则"
        onCreateClick={openCreate}
      />

      {/* 新增 / 编辑规则 */}
      <Modal
        title={editingRecord ? '编辑签到规则' : '新增签到规则'}
        open={formOpen}
        onCancel={closeForm}
        footer={null}
        width="80%"
        style={{ maxWidth: 1000 }}
        destroyOnClose
      >
        <CheckinRuleForm
          editingRecord={editingRecord}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>

      {/* 签到记录 */}
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
          columns={[
            {
              title: '用户',
              dataIndex: 'botUser',
              render: (u: any) =>
                u?.userName
                  ? `@${u.userName}`
                  : `${u?.firstName || ''}${u?.lastName ? ' ' + u.lastName : ''}`.trim() || '-',
            },
            { title: '类型', dataIndex: 'type', render: getTypeText },
            { title: '获得积分', dataIndex: 'reward' },
            { title: '连续天数', dataIndex: 'streakDays' },
            {
              title: '倍率',
              dataIndex: 'multiplier',
              render: (v: number) => `${v}x`,
            },
            {
              title: '签到时间',
              dataIndex: 'createdAt',
              render: (v: string) => new Date(v).toLocaleString('zh-CN'),
            },
            {
              title: '操作',
              width: 80,
              render: (_: any, record: any) => (
                <Popconfirm
                  title="确定删除该签到记录吗？"
                  onConfirm={() => handleDeleteHistory(record._id)}
                >
                  <Button icon={<DeleteOutlined />} size="small" danger>
                    删除
                  </Button>
                </Popconfirm>
              ),
            },
          ]}
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
    </>
  );
};

export default CheckinRuleTab;
