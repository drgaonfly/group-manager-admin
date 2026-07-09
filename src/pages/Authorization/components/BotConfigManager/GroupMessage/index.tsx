import React from 'react';
import { Switch, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import useFeatureList from '../../hooks/useFeatureList';
import FeatureListContainer from '../components/FeatureListContainer';
import { formatInterval, formatTimeWindow } from '@/utils/intervalUtils';
import GroupMessageForm from './GroupMessageForm';

interface GroupMessageTabProps {
  currentRow: any;
  onDataChange?: () => void;
}

const GroupMessageTab: React.FC<GroupMessageTabProps> = ({ currentRow, onDataChange }) => {
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
    apiPath: '/group-messages',
    botId: currentRow?._id,
  });

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
        scroll={{ x: 800 }}
      />

      <GroupMessageForm
        open={formOpen}
        onCancel={(v) => {
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

export default GroupMessageTab;
