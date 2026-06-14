import React, { useState, useEffect } from 'react';
import { Button, Table, Space, Switch, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { queryList, updateItem, removeItem } from '@/services/ant-design-pro/api';
import { formatInterval, formatTimeWindow } from '@/utils/intervalUtils';
import GroupMessageForm from './GroupMessageForm';

interface GroupMessageTabProps {
  currentRow: any;
  onDataChange?: () => void;
}

const GroupMessageTab: React.FC<GroupMessageTabProps> = ({ currentRow, onDataChange }) => {
  const [groupMessages, setGroupMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const fetchData = async () => {
    if (!currentRow?._id) return;
    setLoading(true);
    try {
      const response = await queryList(
        '/group-messages',
        { current: 1, pageSize: 100, botId: currentRow._id },
        {},
        {},
      );
      if (response?.data) {
        setGroupMessages(response.data);
      }
    } catch (error) {
      console.error('获取群发消息失败:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [currentRow?._id]);

  const handleDelete = async (id: string) => {
    try {
      await removeItem('/group-messages', { ids: [id] });
      message.success('删除成功');
      fetchData();
      onDataChange?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '删除失败');
    }
  };

  const handleStatusChange = async (record: any, isOnline: boolean) => {
    try {
      await updateItem(`/group-messages/${record._id}`, { isOnline });
      message.success('状态更新成功');
      fetchData();
      onDataChange?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '更新失败');
    }
  };

  const columns = [
    {
      title: '群组',
      dataIndex: 'group',
      width: 120,
      render: (group: any) => group?.title || '-',
    },
    {
      title: '内容',
      dataIndex: 'content',
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <div
          style={{ maxWidth: 200 }}
          dangerouslySetInnerHTML={{ __html: text || '-' }}
          title={text?.replace(/<[^>]+>/g, '') || ''}
        />
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
      width: 100,
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
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
          新建
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={groupMessages}
        rowKey="_id"
        loading={loading}
        size="small"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 800 }}
      />

      <GroupMessageForm
        open={formOpen}
        onCancel={(v) => {
          setFormOpen(v);
          if (!v) setEditingRecord(null);
        }}
        currentRow={currentRow}
        editingRecord={editingRecord}
        onSuccess={() => {
          setFormOpen(false);
          setEditingRecord(null);
          message.success('群发消息操作成功');
          fetchData();
          onDataChange?.();
        }}
      />
    </div>
  );
};

export default GroupMessageTab;
