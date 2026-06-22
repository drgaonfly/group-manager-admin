import React, { useState } from 'react';
import { Button, Empty, Tag } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { SettingOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import ChannelPostListModal from './ChannelPostListModal';

interface ChannelPostTabProps {
  currentRow: any;
}

const ChannelPostTab: React.FC<ChannelPostTabProps> = ({ currentRow }) => {
  const intl = useIntl();
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [listModalOpen, setListModalOpen] = useState(false);

  // 从 bot.groups 中过滤出频道
  const channels: any[] = (currentRow?.groups || []).filter((g: any) => g.type === 'channel');

  const columns: ProColumns<any>[] = [
    {
      title: intl.formatMessage({ id: 'title', defaultMessage: '频道名称' }),
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: intl.formatMessage({ id: 'username', defaultMessage: '频道用户名' }),
      dataIndex: 'username',
      render: (username: any) =>
        username ? <Tag color="blue">@{username}</Tag> : <span style={{ color: '#bbb' }}>-</span>,
    },
    {
      title: intl.formatMessage({ id: 'pages.searchTable.titleOption', defaultMessage: '操作' }),
      valueType: 'option',
      width: 120,
      fixed: 'right',
      render: (_: any, record: any) => [
        <Button
          key="manage"
          type="primary"
          size="small"
          icon={<SettingOutlined />}
          onClick={() => {
            setSelectedChannel(record);
            setListModalOpen(true);
          }}
        >
          {intl.formatMessage({ id: 'channel_post_settings', defaultMessage: '推广设置' })}
        </Button>,
      ],
    },
  ];

  return (
    <>
      <ProTable<any>
        rowKey="_id"
        dataSource={channels}
        columns={columns}
        search={false}
        pagination={false}
        toolBarRender={false}
        size="small"
        scroll={{ x: 'max-content' }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={intl.formatMessage({
                id: 'no_channels',
                defaultMessage: '该机器人暂无频道',
              })}
            />
          ),
        }}
      />

      <ChannelPostListModal
        open={listModalOpen}
        onClose={() => {
          setListModalOpen(false);
          setSelectedChannel(null);
        }}
        bot={currentRow}
        channel={selectedChannel}
      />
    </>
  );
};

export default ChannelPostTab;
