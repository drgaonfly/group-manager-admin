import React, { useState, useEffect } from 'react';
import { Button, Card, Table, Space, Popconfirm, message, Tag, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { queryList, removeItem } from '@/services/ant-design-pro/api';
import BadgeForm from './BadgeForm';

interface RankConferralTabProps {
  currentRow: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const RankConferralTab: React.FC<RankConferralTabProps> = ({ currentRow }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const fetchData = async () => {
    if (!currentRow?._id) return;
    setLoading(true);
    try {
      const res = await queryList('/badges', { botId: currentRow._id, pageSize: 100 });
      if (res?.success) {
        setData(res.data || []);
      }
    } catch {
      message.error('获取称号列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentRow?._id]);

  const handleDelete = async (id: string) => {
    try {
      const res = await removeItem(`/badges/${id}`);
      if ((res as any)?.success) {
        message.success('删除成功');
        fetchData();
      }
    } catch {
      message.error('删除失败');
    }
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (record: any) => {
    setEditingRecord(record);
    setFormOpen(true);
  };

  const columns = [
    {
      title: '等级',
      key: 'level',
      width: 60,
      render: (_: any, __: any, index: number) => <Tag color="blue">{index + 1}</Tag>,
    },
    {
      title: '称号',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <span style={{ fontWeight: 500, fontSize: 14 }}>{title}</span>,
    },
    {
      title: '积分门槛',
      dataIndex: 'threshold',
      key: 'threshold',
      render: (val: number) => (
        <span>
          ≥ <strong>{val}</strong> 积分
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm title="确定删除该称号吗？" onConfirm={() => handleDelete(record._id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      size="small"
      title="授衔规则"
      extra={
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd}>
            添加称号
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            刷新
          </Button>
        </Space>
      }
    >
      <div style={{ marginBottom: 12, color: '#888', fontSize: 12 }}>
        用户累计积分达到门槛后自动获得对应称号。多个称号时取积分最高匹配的等级。 在消息模板中使用{' '}
        <Tag color="blue" style={{ fontSize: 11 }}>
          {'{currentRank}'}
        </Tag>{' '}
        变量展示用户当前称号。
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="_id"
        size="small"
        loading={loading}
        pagination={false}
        locale={{ emptyText: <Empty description="暂无称号，点击「添加称号」开始配置" /> }}
      />
      <BadgeForm
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        currentRow={currentRow}
        editingRecord={editingRecord}
        onSuccess={() => {
          setFormOpen(false);
          fetchData();
        }}
      />
    </Card>
  );
};

export default RankConferralTab;
