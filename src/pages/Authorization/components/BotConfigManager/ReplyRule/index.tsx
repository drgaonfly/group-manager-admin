import React, { useState, useEffect } from 'react';
import { Button, Table, Space, Switch, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { FormattedMessage } from '@umijs/max';
import { queryList, updateItem, removeItem } from '@/services/ant-design-pro/api';
import ReplyRuleForm from './ReplyRuleForm';
import ReplyRuleUpdate from '@/pages/ReplyRule/components/Update';

interface ReplyRuleTabProps {
  currentRow: any;
  onDataChange?: () => void;
}

const ReplyRuleTab: React.FC<ReplyRuleTabProps> = ({ currentRow, onDataChange }) => {
  const [replyRules, setReplyRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const fetchData = async () => {
    if (!currentRow?._id) return;
    setLoading(true);
    try {
      const response = await queryList(
        '/reply-rules',
        { current: 1, pageSize: 100, botId: currentRow._id },
        {},
        {},
      );
      if (response?.data) {
        setReplyRules(response.data);
      }
    } catch (error) {
      console.error('获取回复规则失败:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [currentRow?._id]);

  const handleDelete = async (id: string) => {
    try {
      await removeItem('/reply-rules', { ids: [id] });
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
      await updateItem(`/reply-rules/${record._id}`, { isOnline });
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
      title: <FormattedMessage id="keywords" defaultMessage="关键词" />,
      dataIndex: 'keyword',
      width: 140,
      render: (keywords: string[]) => {
        const arr = Array.isArray(keywords) ? keywords : [keywords];
        return (
          <Space wrap size={[4, 4]}>
            {arr.slice(0, 3).map((k, idx) => (
              <Tag key={idx} color="blue">
                {k}
              </Tag>
            ))}
            {arr.length > 3 && <Tag>+{arr.length - 3}</Tag>}
          </Space>
        );
      },
    },
    {
      title: <FormattedMessage id="reply_content" defaultMessage="回复内容" />,
      dataIndex: 'content',
      width: 160,
      ellipsis: true,
      render: (text: string) => (
        <div
          style={{ maxWidth: 160 }}
          dangerouslySetInnerHTML={{ __html: text || '-' }}
          title={text?.replace(/<[^>]+>/g, '') || ''}
        />
      ),
    },
    {
      title: <FormattedMessage id="media" defaultMessage="媒体" />,
      dataIndex: 'medias',
      width: 50,
      render: (medias: string[]) => medias?.length || 0,
    },
    {
      title: <FormattedMessage id="quote" defaultMessage="引用" />,
      dataIndex: 'replyToMessage',
      width: 50,
      render: (_: any, record: any) =>
        record.replyToMessage ? <Tag color="green">是</Tag> : <Tag>否</Tag>,
    },
    {
      title: <FormattedMessage id="burn_after_reading" defaultMessage="阅后即焚" />,
      dataIndex: 'deleteAfterSeconds',
      width: 80,
      render: (_: any, record: any) =>
        record.deleteAfterSeconds ? <Tag color="orange">{record.deleteAfterSeconds}秒</Tag> : '-',
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
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
          <FormattedMessage id="add" defaultMessage="新建" />
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={replyRules}
        rowKey="_id"
        loading={loading}
        size="small"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 700 }}
      />

      <ReplyRuleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        currentRow={currentRow}
        onSuccess={() => {
          setFormOpen(false);
          message.success(
            <FormattedMessage id="reply_rule_add_success" defaultMessage="回复规则添加成功" />,
          );
          fetchData();
          onDataChange?.();
        }}
      />

      <ReplyRuleUpdate
        updateModalOpen={updateOpen}
        onCancel={setUpdateOpen}
        values={editingRecord || {}}
        onSubmit={async (values) => {
          try {
            await updateItem(`/reply-rules/${values._id}`, values);
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

export default ReplyRuleTab;
