import React from 'react';
import { Switch, Space, Button, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import useFeatureList from '../hooks/useFeatureList';
import FeatureListContainer from '../components/FeatureListContainer';
import ReplyRuleForm from './ReplyRuleForm';

interface ReplyRuleTabProps {
  currentRow: any;
  onDataChange?: () => void;
}

const ReplyRuleTab: React.FC<ReplyRuleTabProps> = ({ currentRow, onDataChange }) => {
  const {
    data,
    loading,
    formOpen,
    editingRecord,
    openCreate,
    openEdit,
    closeForm,
    handleDelete,
    handleStatusChange,
    fetchData,
  } = useFeatureList({
    apiPath: '/reply-rules',
    botId: currentRow?._id,
  });

  const columns = [
    {
      title: '关键词',
      dataIndex: 'keyword',
      width: 140,
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
      title: '适用群组',
      dataIndex: 'group',
      width: 120,
      render: (_: any, record: any) =>
        record.group?.title ? <Tag color="purple">{record.group.title}</Tag> : <span>-</span>,
    },
    {
      title: '回复内容',
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
      title: '阅后即焚',
      dataIndex: 'deleteAfterSeconds',
      width: 80,
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
          onChange={(checked) => {
            handleStatusChange(record, checked);
            onDataChange?.();
          }}
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
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="确定删除？"
            onConfirm={() => {
              handleDelete(record._id);
              onDataChange?.();
            }}
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
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
        onCreateClick={openCreate}
        scroll={{ x: 700 }}
      />

      <ReplyRuleForm
        open={formOpen}
        onOpenChange={(v) => {
          if (!v) closeForm();
        }}
        currentRow={currentRow}
        editingRecord={editingRecord}
        onSuccess={() => {
          closeForm();
          fetchData();
          onDataChange?.();
        }}
      />
    </>
  );
};

export default ReplyRuleTab;
