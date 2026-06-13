import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Space, Switch, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { queryList, updateItem, removeItem } from '@/services/ant-design-pro/api';
import ReplyRuleForm from './ReplyRuleForm';
import ReplyRuleUpdate from '@/pages/ReplyRule/components/Update';

interface Props {
  open: boolean;
  onClose: () => void;
  bot: any;
  group: any;
}

const ReplyRuleGroupModal: React.FC<Props> = ({ open, onClose, bot, group }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const fetchData = async () => {
    if (!bot?._id || !group?._id) return;
    setLoading(true);
    try {
      const res = await queryList(
        '/reply-rules',
        { current: 1, pageSize: 100, botId: bot._id, groupId: group._id },
        {},
        {},
      );
      if (res?.data) setData(res.data);
    } catch {
      message.error('获取回复规则失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open, bot?._id, group?._id]);

  const handleDelete = async (id: string) => {
    try {
      await removeItem('/reply-rules', { ids: [id] });
      message.success('删除成功');
      fetchData();
    } catch (e: any) {
      message.error(e?.response?.data?.message ?? '删除失败');
    }
  };

  const handleStatusChange = async (record: any, isOnline: boolean) => {
    try {
      await updateItem(`/reply-rules/${record._id}`, { isOnline });
      message.success('状态更新成功');
      fetchData();
    } catch (e: any) {
      message.error(e?.response?.data?.message ?? '更新失败');
    }
  };

  const columns = [
    {
      title: '关键词',
      dataIndex: 'keyword',
      width: 160,
      render: (keywords: string[]) => {
        const arr = Array.isArray(keywords) ? keywords : [keywords];
        return (
          <Space wrap size={[4, 4]}>
            {arr.slice(0, 3).map((k, i) => (
              <Tag key={i} color="blue">
                {k}
              </Tag>
            ))}
            {arr.length > 3 && <Tag>+{arr.length - 3}</Tag>}
          </Space>
        );
      },
    },
    {
      title: '回复内容',
      dataIndex: 'content',
      ellipsis: true,
      render: (text: string) => (
        <div dangerouslySetInnerHTML={{ __html: text || '-' }} style={{ maxWidth: 200 }} />
      ),
    },
    {
      title: '阅后即焚',
      dataIndex: 'deleteAfterSeconds',
      width: 90,
      render: (v: number) => (v ? <Tag color="orange">{v}秒</Tag> : '-'),
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
              setUpdateOpen(true);
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
      <Modal
        title={`关键词回复 — ${group?.title}`}
        open={open}
        onCancel={onClose}
        footer={null}
        width={860}
        destroyOnClose
      >
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
          scroll={{ x: 650 }}
        />
      </Modal>

      <ReplyRuleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        currentRow={bot}
        fixedGroupId={group?._id}
        onSuccess={() => {
          setFormOpen(false);
          fetchData();
        }}
      />

      <ReplyRuleUpdate
        updateModalOpen={updateOpen}
        onCancel={setUpdateOpen}
        values={editingRecord || {}}
        onSubmit={async (values) => {
          try {
            await updateItem(`/reply-rules/${values._id}`, values);
            message.success('更新成功');
            setUpdateOpen(false);
            setEditingRecord(null);
            fetchData();
          } catch (e: any) {
            message.error(e?.response?.data?.message ?? '更新失败');
          }
        }}
      />
    </>
  );
};

export default ReplyRuleGroupModal;
