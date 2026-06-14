import React, { useState, useEffect } from 'react';
import { Button, Table, Space, Switch, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { queryList, updateItem, removeItem } from '@/services/ant-design-pro/api';
import { formatInterval, formatTimeWindow } from '@/utils/intervalUtils';
import GroupMessageForm from './GroupMessageForm';

interface Props {
  open: boolean;
  bot: any;
  group: any;
}

const GroupMessageGroupContent: React.FC<Props> = ({ open, bot, group }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const fetchData = async () => {
    if (!bot?._id || !group?._id) return;
    setLoading(true);
    try {
      const res = await queryList(
        '/group-messages',
        { current: 1, pageSize: 100, botId: bot._id, groupId: group._id },
        {},
        {},
      );
      if (res?.data) setData(res.data);
    } catch {
      message.error('获取群发消息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open, bot?._id, group?._id]);

  const handleDelete = async (id: string) => {
    try {
      await removeItem('/group-messages', { ids: [id] });
      message.success('删除成功');
      fetchData();
    } catch (e: any) {
      message.error(e?.response?.data?.message ?? '删除失败');
    }
  };

  const handleStatusChange = async (record: any, isOnline: boolean) => {
    try {
      await updateItem(`/group-messages/${record._id}`, { isOnline });
      message.success('状态更新成功');
      fetchData();
    } catch (e: any) {
      message.error(e?.response?.data?.message ?? '更新失败');
    }
  };

  const columns = [
    {
      title: '内容',
      dataIndex: 'content',
      ellipsis: true,
      render: (text: string) => (
        <div dangerouslySetInnerHTML={{ __html: text || '-' }} style={{ maxWidth: 240 }} />
      ),
    },
    {
      title: '间隔',
      dataIndex: 'intervalTime',
      width: 80,
      render: formatInterval,
    },
    {
      title: '时间窗口',
      width: 150,
      render: (_: any, record: any) => formatTimeWindow(record),
    },
    {
      title: '状态',
      dataIndex: 'isOnline',
      width: 90,
      render: (_: any, record: any) => (
        <Switch
          checkedChildren="启用"
          unCheckedChildren="禁用"
          checked={record.isOnline}
          onChange={(checked) => handleStatusChange(record, checked)}
        />
      ),
    },
    {
      title: '操作',
      width: 90,
      render: (_: any, record: any) => (
        <Space size={0}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingRecord(record);
              setFormOpen(true);
            }}
          />
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record._id)}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
          新建
        </Button>
      </div>
      <Table
        rowKey="_id"
        dataSource={data}
        columns={columns}
        loading={loading}
        size="small"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 600 }}
      />

      <GroupMessageForm
        open={formOpen}
        onCancel={(v) => {
          setFormOpen(v);
          if (!v) setEditingRecord(null);
        }}
        currentRow={bot}
        editingRecord={editingRecord}
        fixedGroupId={group?._id}
        onSuccess={() => {
          setFormOpen(false);
          setEditingRecord(null);
          fetchData();
        }}
      />
    </>
  );
};

export default GroupMessageGroupContent;
