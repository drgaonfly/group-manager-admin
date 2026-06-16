import React from 'react';
import { Space, Button, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';
import { message } from 'antd';
import useFeatureList from '../hooks/useFeatureList';
import FeatureListContainer from '../components/FeatureListContainer';
import GroupWelcomeForm from './GroupWelcomeForm';

interface Props {
  open: boolean;
  bot: any;
  group: any;
}

const GroupWelcomeGroupContent: React.FC<Props> = ({ open, bot, group }) => {
  const { data, loading, formOpen, editingRecord, openCreate, openEdit, closeForm, fetchData } =
    useFeatureList({
      apiPath: '/group-welcomes',
      botId: bot?._id,
      groupId: group?._id,
      enabled: open,
      deleteMode: 'single',
    });

  const handleDelete = async (id: string) => {
    try {
      await request(`/group-welcomes/${id}`, { method: 'DELETE' });
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
      width: 100,
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
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该群欢迎配置吗？" onConfirm={() => handleDelete(record._id)}>
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
        createButtonText="新建群欢迎"
        onCreateClick={openCreate}
      />

      <GroupWelcomeForm
        open={formOpen}
        onCancel={(v) => {
          if (!v) closeForm();
        }}
        botId={bot?._id}
        currentRow={editingRecord ?? undefined}
        fixedGroupId={group?._id}
        onSuccess={() => {
          closeForm();
          fetchData();
        }}
      />
    </>
  );
};

export default GroupWelcomeGroupContent;
