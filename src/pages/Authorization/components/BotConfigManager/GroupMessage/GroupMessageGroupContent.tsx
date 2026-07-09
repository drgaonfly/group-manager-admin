import React from 'react';
import { Switch, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import useFeatureList from '../../hooks/useFeatureList';
import FeatureListContainer from '../components/FeatureListContainer';
import { formatInterval, formatTimeWindow } from '@/utils/intervalUtils';
import GroupMessageForm from './GroupMessageForm';

interface Props {
  open: boolean;
  bot: any;
  group: any;
}

const GroupMessageGroupContent: React.FC<Props> = ({ open, bot, group }) => {
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
    botId: bot?._id,
    groupId: group?._id,
    enabled: open,
  });

  const columns = [
    {
      title: '内容',
      dataIndex: 'content',
      width: 150,
      ellipsis: true,
      render: (text: string) => (
        <div dangerouslySetInnerHTML={{ __html: text || '-' }} style={{ maxWidth: 240 }} />
      ),
    },
    {
      title: '类型',
      dataIndex: 'sendType',
      width: 150,
      ellipsis: true,
      render: (_: any, record: any) =>
        record.sendType === 'immediate' ? '立即发送' : '定时循环发送',
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
            onClick={() => openEdit(record)}
          />
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record._id)}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 移动端卡片渲染函数
  const renderMobileCard = (record: any) => {
    return (
      <>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <div
              className="text-sm text-gray-800 mb-1"
              dangerouslySetInnerHTML={{ __html: record.content || '-' }}
            />
            <div className="text-xs text-gray-500">
              {record.sendType === 'immediate' ? '立即发送' : '定时循环发送'}
            </div>
          </div>
          <Switch
            checkedChildren="启用"
            unCheckedChildren="禁用"
            checked={record.isOnline}
            onChange={(checked) => handleStatusChange(record, checked)}
            className="ml-2"
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-gray-500">
            {record.intervalTime && <span>间隔: {formatInterval(record.intervalTime)}</span>}
          </div>
          <Space size={0}>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
            <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record._id)}>
              <Button type="link" danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        </div>
      </>
    );
  };

  return (
    <>
      <FeatureListContainer
        data={data}
        loading={loading}
        columns={columns}
        onCreateClick={openCreate}
        scroll={{ x: 600 }}
        renderMobileCard={renderMobileCard}
      />

      <GroupMessageForm
        open={formOpen}
        onCancel={(v) => {
          if (!v) closeForm();
        }}
        currentRow={bot}
        editingRecord={editingRecord}
        fixedGroupId={group?._id}
        onSuccess={() => {
          closeForm();
          fetchData();
        }}
      />
    </>
  );
};

export default GroupMessageGroupContent;
