import React, { useState, useEffect } from 'react';
import { Button, Table, Space, Switch, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { FormattedMessage } from '@umijs/max';
import { queryList, updateItem, removeItem } from '@/services/ant-design-pro/api';
import { formatInterval, formatTimeWindow } from '@/utils/intervalUtils';
import ChannelPostCreateForm from './ChannelPostForm';
import ChannelPostUpdate from '@/pages/ChannelPost/components/Update';

interface ChannelPostTabProps {
  currentRow: any;
  onDataChange?: () => void;
}

const ChannelPostTab: React.FC<ChannelPostTabProps> = ({ currentRow, onDataChange }) => {
  const [channelPosts, setChannelPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const fetchData = async () => {
    if (!currentRow?._id) return;
    setLoading(true);
    try {
      const response = await queryList(
        '/channel-posts',
        { current: 1, pageSize: 100, botId: currentRow._id },
        {},
        {},
      );
      if (response?.data) {
        setChannelPosts(response.data);
      }
    } catch (error) {
      console.error('获取频道推广失败:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [currentRow?._id]);

  const handleDelete = async (id: string) => {
    try {
      await removeItem('/channel-posts', { ids: [id] });
      message.success(<FormattedMessage id="delete_success" defaultMessage="删除成功" />);
      fetchData();
      onDataChange?.();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ?? (
          <FormattedMessage id="delete_failed" defaultMessage="删除失败" />
        ),
      );
    }
  };

  const handleStatusChange = async (record: any, isOnline: boolean) => {
    try {
      await updateItem(`/channel-posts/${record._id}`, { isOnline });
      message.success(
        <FormattedMessage id="status_update_success" defaultMessage="状态更新成功" />,
      );
      fetchData();
      onDataChange?.();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ?? (
          <FormattedMessage id="update_failed" defaultMessage="更新失败" />
        ),
      );
    }
  };

  const columns = [
    {
      title: <FormattedMessage id="channel" defaultMessage="频道" />,
      dataIndex: 'channels',
      width: 120,
      render: (channels: any[]) => channels?.map((c) => c?.title).join(', ') || '-',
    },
    {
      title: <FormattedMessage id="content" defaultMessage="内容" />,
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
      title: <FormattedMessage id="interval" defaultMessage="间隔" />,
      dataIndex: 'interval',
      width: 80,
      render: formatInterval,
    },
    {
      title: <FormattedMessage id="time_window" defaultMessage="时间窗口" />,
      width: 150,
      render: (_: any, record: any) => formatTimeWindow(record),
    },
    {
      title: <FormattedMessage id="clear_last_post" defaultMessage="清除上条" />,
      dataIndex: 'isClearLastPost',
      width: 80,
      render: (val: boolean) => (val ? <Tag color="orange">是</Tag> : <Tag>否</Tag>),
    },
    {
      title: <FormattedMessage id="status" defaultMessage="状态" />,
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
      title: <FormattedMessage id="operation" defaultMessage="操作" />,
      width: 100,
      render: (_: any, record: any) => (
        <Space size={0}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingRecord(record);
              setUpdateOpen(true);
            }}
          />
          <Popconfirm
            title={<FormattedMessage id="confirm_delete" defaultMessage="确定删除？" />}
            onConfirm={() => handleDelete(record._id)}
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ height: '65vh', overflow: 'auto', paddingRight: 8 }}>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
          <FormattedMessage id="add" defaultMessage="新建" />
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={channelPosts}
        rowKey="_id"
        loading={loading}
        size="small"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 900 }}
      />

      <ChannelPostCreateForm
        open={formOpen}
        onOpenChange={setFormOpen}
        currentRow={currentRow}
        onSuccess={() => {
          setFormOpen(false);
          message.success(
            <FormattedMessage id="channel_post_add_success" defaultMessage="频道推广添加成功" />,
          );
          fetchData();
          onDataChange?.();
        }}
      />

      <ChannelPostUpdate
        updateModalOpen={updateOpen}
        onCancel={setUpdateOpen}
        values={editingRecord || {}}
        onSubmit={async (values) => {
          try {
            await updateItem(`/channel-posts/${values._id}`, values);
            message.success(<FormattedMessage id="update_success" defaultMessage="更新成功" />);
            setUpdateOpen(false);
            setEditingRecord(null);
            fetchData();
            onDataChange?.();
          } catch (error: any) {
            message.error(
              error?.response?.data?.message ?? (
                <FormattedMessage id="update_failed" defaultMessage="更新失败" />
              ),
            );
          }
        }}
      />
    </div>
  );
};

export default ChannelPostTab;
