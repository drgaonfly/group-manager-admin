import React, { useState, useEffect } from 'react';
import { Button, Table, Space, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';
import GroupWelcomeForm from './GroupWelcomeForm';

interface Props {
  open: boolean;
  bot: any;
  group: any;
}

const GroupWelcomeGroupContent: React.FC<Props> = ({ open, bot, group }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const fetchData = async () => {
    if (!bot?._id || !group?._id) return;
    setLoading(true);
    try {
      const res = await request('/group-welcomes', {
        method: 'GET',
        params: { botId: bot._id, groupId: group._id, pageSize: 50 },
      });
      if (res?.success) setData(res.data || []);
    } catch {
      message.error('获取群欢迎配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open, bot?._id, group?._id]);

  const handleDelete = async (record: any) => {
    try {
      await request(`/group-welcomes/${record._id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchData();
    } catch {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '欢迎消息',
      dataIndex: 'contents',
      ellipsis: true,
      render: (contents: string[]) =>
        contents?.length ? (
          contents[0].replace(/<[^>]+>/g, '').slice(0, 50) + '…'
        ) : (
          <span style={{ color: '#bbb' }}>默认消息</span>
        ),
    },
    {
      title: '媒体',
      dataIndex: 'medias',
      width: 70,
      render: (medias: string[]) =>
        medias?.length ? <Tag color="blue">{medias.length} 个</Tag> : '-',
    },
    {
      title: '阅后即焚',
      dataIndex: 'deleteAfterSeconds',
      width: 90,
      render: (v: number) => (v > 0 ? `${v}秒` : <span style={{ color: '#bbb' }}>关闭</span>),
    },
    {
      title: '置顶新成员',
      dataIndex: 'pinNewMember',
      width: 90,
      render: (v: boolean) => (v ? <Tag color="green">开启</Tag> : <Tag>关闭</Tag>),
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
          <Popconfirm title="确定删除该群欢迎配置吗？" onConfirm={() => handleDelete(record)}>
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
          新建群欢迎
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

      <GroupWelcomeForm
        open={formOpen}
        onCancel={setFormOpen}
        botId={bot?._id}
        currentRow={editingRecord ?? undefined}
        fixedGroupId={group?._id}
        onSuccess={() => {
          setFormOpen(false);
          fetchData();
        }}
      />
    </>
  );
};

export default GroupWelcomeGroupContent;
