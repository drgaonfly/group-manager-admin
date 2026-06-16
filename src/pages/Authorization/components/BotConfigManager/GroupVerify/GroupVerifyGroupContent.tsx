import React from 'react';
import { Space, Button, Popconfirm, Tag, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';
import useFeatureList from '../hooks/useFeatureList';
import FeatureListContainer from '../components/FeatureListContainer';
import GroupVerifyForm from './GroupVerifyForm';

interface Props {
  open: boolean;
  bot: any;
  group: any;
}

const GroupVerifyGroupContent: React.FC<Props> = ({ open, bot, group }) => {
  const { data, loading, formOpen, editingRecord, openCreate, openEdit, closeForm, fetchData } =
    useFeatureList({
      apiPath: '/group-verifies',
      botId: bot?._id,
      groupId: group?._id,
      enabled: open,
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
      title: '验证问题',
      width: 100,
      dataIndex: 'question',
      ellipsis: true,
    },
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
        botId={bot?._id}
        currentRecord={editingRecord}
        fixedGroupId={group?._id}
        onSuccess={() => {
          closeForm();
          fetchData();
        }}
      />
    </>
  );
};

export default GroupVerifyGroupContent;
