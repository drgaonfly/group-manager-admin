import React from 'react';
import { Modal, Button, Space, Switch, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import useFeatureList from '../hooks/useFeatureList';
import FeatureListContainer from '../components/FeatureListContainer';
import ChannelPostForm from './ChannelPostForm';
import { formatInterval, formatTimeWindow } from '@/utils/intervalUtils';

interface ChannelPostListModalProps {
  open: boolean;
  onClose: () => void;
  bot: any;
  channel: any;
}

const ChannelPostListModal: React.FC<ChannelPostListModalProps> = ({
  open,
  onClose,
  bot,
  channel,
}) => {
  const intl = useIntl();

  const {
    data,
    loading,
    formOpen,
    editingRecord,
    openCreate,
    openEdit,
    closeForm,
    fetchData,
    handleDelete,
    handleStatusChange,
  } = useFeatureList({
    apiPath: '/channel-posts',
    botId: bot?._id,
    // groupId 字段由 useFeatureList 统一传给后端，后端 channelPost buildQuery 已支持
    groupId: channel?._id,
    enabled: open,
    deleteMode: 'batch',
    statusField: 'isOnline',
  });

  const columns = [
    {
      title: intl.formatMessage({ id: 'content', defaultMessage: '内容' }),
      dataIndex: 'content',
      ellipsis: true,
      render: (text: string) => (
        <div
          dangerouslySetInnerHTML={{ __html: text || '-' }}
          title={text?.replace(/<[^>]+>/g, '') || ''}
          style={{ maxWidth: 220 }}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'interval', defaultMessage: '间隔' }),
      dataIndex: 'interval',
      width: 80,
      render: formatInterval,
    },
    {
      title: intl.formatMessage({ id: 'time_window', defaultMessage: '时间窗口' }),
      width: 150,
      render: (_: any, record: any) => formatTimeWindow(record),
    },
    {
      title: intl.formatMessage({ id: 'clear_last_post', defaultMessage: '清除上条' }),
      dataIndex: 'isClearLastPost',
      width: 80,
      render: (val: boolean) => (val ? <Tag color="orange">是</Tag> : <Tag>否</Tag>),
    },
    {
      title: intl.formatMessage({ id: 'status', defaultMessage: '状态' }),
      dataIndex: 'isOnline',
      width: 90,
      render: (_: any, record: any) => (
        <Switch
          checkedChildren={intl.formatMessage({ id: 'enabled', defaultMessage: '启用' })}
          unCheckedChildren={intl.formatMessage({ id: 'disabled', defaultMessage: '禁用' })}
          checked={record.isOnline}
          onChange={(checked) => handleStatusChange(record, checked)}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.searchTable.titleOption', defaultMessage: '操作' }),
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
            title={intl.formatMessage({ id: 'confirm_delete', defaultMessage: '确定删除？' })}
            onConfirm={() => handleDelete(record._id)}
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={`${channel?.title || ''} - ${intl.formatMessage({
          id: 'channel_post',
          defaultMessage: '频道推广',
        })}`}
        open={open}
        onCancel={onClose}
        footer={null}
        width={900}
        destroyOnClose
        styles={{ body: { minHeight: 400 } }}
      >
        <FeatureListContainer
          data={data}
          loading={loading}
          columns={columns}
          createButtonText={intl.formatMessage({
            id: 'add_channel_post',
            defaultMessage: '新建推广',
          })}
          onCreateClick={openCreate}
          scroll={{ x: 800 }}
        />
      </Modal>

      <ChannelPostForm
        open={formOpen}
        onClose={closeForm}
        currentRow={bot}
        fixedChannelId={channel?._id}
        editingRecord={editingRecord}
        onSuccess={() => {
          closeForm();
          fetchData();
        }}
      />
    </>
  );
};

export default ChannelPostListModal;
