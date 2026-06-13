import React, { useState, useEffect } from 'react';
import { Button, Table, Space, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';
import GroupVerifyForm from './GroupVerifyForm';

interface Props {
  open: boolean;
  bot: any;
  group: any;
}

const GroupVerifyGroupContent: React.FC<Props> = ({ open, bot, group }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const fetchData = async () => {
    if (!bot?._id || !group?._id) return;
    setLoading(true);
    try {
      const res = await request('/group-verifies', {
        method: 'GET',
        params: { botId: bot._id, groupId: group._id, current: 1, pageSize: 100 },
      });
      if (res?.success) setData(res.data || []);
    } catch {
      message.error('获取群验证列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open, bot?._id, group?._id]);

  const handleDelete = async (record: any) => {
    try {
      await request(`/group-verifies/${record._id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchData();
    } catch {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: '验证问题', dataIndex: 'question', ellipsis: true },
    {
      title: '选项数',
      key: 'asks',
      width: 70,
      render: (_: any, r: any) => r.asks?.length ?? 0,
    },
    {
      title: '正确答案数',
      key: 'correct',
      width: 90,
      render: (_: any, r: any) => r.asks?.filter((a: any) => a.isCorrect).length ?? 0,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      width: 80,
      render: (v: boolean) => (v ? <Tag color="green">启用</Tag> : <Tag color="default">停用</Tag>),
    },
    {
      title: '操作',
      width: 120,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingRecord(record);
              setFormOpen(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm title="确定删除该群验证配置吗？" onConfirm={() => handleDelete(record)}>
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
      <div style={{ marginBottom: 12 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingRecord(null);
            setFormOpen(true);
          }}
        >
          新增群验证
        </Button>
      </div>
      <Table
        rowKey="_id"
        dataSource={data}
        columns={columns}
        loading={loading}
        size="small"
        pagination={{ pageSize: 10 }}
      />

      <GroupVerifyForm
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        botId={bot?._id}
        currentRecord={editingRecord}
        onSuccess={() => {
          setFormOpen(false);
          fetchData();
        }}
        fixedGroupId={group?._id}
      />
    </>
  );
};

export default GroupVerifyGroupContent;
