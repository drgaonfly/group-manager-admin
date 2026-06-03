import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Space, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';
import GroupVerifyForm from './GroupVerifyForm';

interface GroupVerifyRecord {
  _id: string;
  group?: {
    _id: string;
    title: string;
    username?: string;
  };
  question: string;
  asks: { name: string; isCorrect: boolean }[];
  isActive: boolean;
  createdAt: string;
}

interface GroupVerifyTabProps {
  currentRow: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const GroupVerifyTab: React.FC<GroupVerifyTabProps> = ({ currentRow }) => {
  const [data, setData] = useState<GroupVerifyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GroupVerifyRecord | null>(null);

  const fetchList = async () => {
    if (!currentRow?._id) return;
    setLoading(true);
    try {
      const res = await request('/group-verifies', {
        method: 'GET',
        params: { botId: currentRow._id, current: 1, pageSize: 100 },
      });
      if (res?.success) {
        setData(res.data || []);
      }
    } catch {
      message.error('获取群验证列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentRow?._id) {
      fetchList();
    }
  }, [currentRow]);

  const handleCreate = () => {
    setEditingRecord(null);
    setFormOpen(true);
  };

  const handleEdit = (record: GroupVerifyRecord) => {
    setEditingRecord(record);
    setFormOpen(true);
  };

  const handleDelete = async (record: GroupVerifyRecord) => {
    try {
      await request(`/group-verifies/${record._id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchList();
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
              <span style={{ color: '#999', marginLeft: 4 }}>@{group.username}</span>
            )}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: '验证问题',
      dataIndex: 'question',
      key: 'question',
      ellipsis: true,
    },
    {
      title: '选项数',
      key: 'asks',
      render: (_: any, record: GroupVerifyRecord) => record.asks?.length ?? 0,
    },
    {
      title: '正确答案数',
      key: 'correctCount',
      render: (_: any, record: GroupVerifyRecord) =>
        record.asks?.filter((a) => a.isCorrect).length ?? 0,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) =>
        isActive ? <Tag color="green">启用</Tag> : <Tag color="default">停用</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: GroupVerifyRecord) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该群验证配置吗？"
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
        title="群验证配置"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新增群验证
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      <GroupVerifyForm
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        botId={currentRow?._id}
        currentRecord={editingRecord}
        onSuccess={fetchList}
      />
    </div>
  );
};

export default GroupVerifyTab;
