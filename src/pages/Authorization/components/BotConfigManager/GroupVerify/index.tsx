import React from 'react';
import { Space, Button, Popconfirm, Tag, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';
import useFeatureList from '../hooks/useFeatureList';
import FeatureListContainer from '../components/FeatureListContainer';
import GroupVerifyForm from './GroupVerifyForm';

interface GroupVerifyTabProps {
  currentRow: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const GroupVerifyTab: React.FC<GroupVerifyTabProps> = ({ currentRow }) => {
  const { data, loading, formOpen, editingRecord, openCreate, openEdit, closeForm, fetchData } =
    useFeatureList({
      apiPath: '/group-verifies',
      botId: currentRow?._id,
      deleteMode: 'single',
    });

  const handleDelete = async (id: string) => {
    try {
      await request(`/group-verifies/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchData();
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
    { title: '验证问题', dataIndex: 'question', ellipsis: true },
    {
      title: '选项数',
      key: 'asks',
      render: (_: any, record: any) => record.asks?.length ?? 0,
    },
    {
      title: '正确答案数',
      key: 'correct',
      render: (_: any, record: any) => record.asks?.filter((a: any) => a.isCorrect).length ?? 0,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      render: (v: boolean) => (v ? <Tag color="green">启用</Tag> : <Tag color="default">停用</Tag>),
    },
    {
      title: '操作',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该群验证配置吗？" onConfirm={() => handleDelete(record._id)}>
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
      <FeatureListContainer
        data={data}
        loading={loading}
        columns={columns}
        createButtonText="新增群验证"
        onCreateClick={openCreate}
      />

      <GroupVerifyForm
        open={formOpen}
        onCancel={closeForm}
        botId={currentRow?._id}
        currentRecord={editingRecord}
        onSuccess={() => {
          closeForm();
          fetchData();
        }}
      />
    </>
  );
};

export default GroupVerifyTab;
