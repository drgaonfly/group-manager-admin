import React, { useState, useMemo } from 'react';
import { Modal, Tabs, Tag, Button, Empty } from 'antd';
import { useIntl } from '@umijs/max';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { SettingOutlined, TeamOutlined, NotificationOutlined } from '@ant-design/icons';

// 功能管理弹窗
import GroupFeaturesModal from './GroupFeaturesModal';
import ChannelFeaturesModal from './ChannelFeaturesModal';

interface GroupFeatureManagerProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  currentRow: any;
  currentUser: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const GroupFeatureManager: React.FC<GroupFeatureManagerProps> = ({
  open,
  onCancel,
  currentRow,
  currentUser,
  onBotUpdate,
}) => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState('groups');

  // 当前选中的群组/频道，用于打开功能管理弹窗
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [groupFeaturesOpen, setGroupFeaturesOpen] = useState(false);
  const [channelFeaturesOpen, setChannelFeaturesOpen] = useState(false);

  /** 群组列表 Tab — ProTable，点击"管理"打开功能管理弹窗 */
  const renderGroupsTab = () => {
    const groups: any[] = (currentRow?.groups || []).filter((g: any) => g.type !== 'channel');

    const columns: ProColumns<any>[] = [
      {
        title: intl.formatMessage({ id: 'title', defaultMessage: '群名' }),
        dataIndex: 'title',
        width: 180,
        ellipsis: true,
      },
      {
        title: intl.formatMessage({ id: 'username', defaultMessage: '群组用户名' }),
        dataIndex: 'username',
        width: 140,
        render: (username: any) =>
          username ? <Tag color="blue">@{username}</Tag> : <span style={{ color: '#bbb' }}>-</span>,
      },
      {
        title: intl.formatMessage({ id: 'type', defaultMessage: '类型' }),
        dataIndex: 'type',
        width: 100,
        render: (type: any) => <Tag>{type}</Tag>,
      },
      {
        title: intl.formatMessage({ id: 'pages.searchTable.titleOption', defaultMessage: '操作' }),
        valueType: 'option',
        width: 80,
        fixed: 'right',
        render: (_: any, record: any) => [
          <Button
            key="manage"
            type="primary"
            size="small"
            icon={<SettingOutlined />}
            onClick={() => {
              setSelectedGroup(record);
              setGroupFeaturesOpen(true);
            }}
          >
            {intl.formatMessage({ id: 'manage', defaultMessage: '管理' })}
          </Button>,
        ],
      },
    ];

    return (
      <ProTable<any>
        rowKey="_id"
        dataSource={groups}
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
                id: 'no_groups',
                defaultMessage: '该机器人暂无群组',
              })}
            />
          ),
        }}
      />
    );
  };

  /** 频道列表 Tab — ProTable，点击"管理"打开频道功能管理弹窗 */
  const renderChannelsTab = () => {
    const channels: any[] = (currentRow?.groups || []).filter((g: any) => g.type === 'channel');

    const columns: ProColumns<any>[] = [
      {
        title: intl.formatMessage({ id: 'title', defaultMessage: '频道名' }),
        dataIndex: 'title',
        width: 180,
        ellipsis: true,
      },
      {
        title: intl.formatMessage({ id: 'username', defaultMessage: '频道用户名' }),
        dataIndex: 'username',
        width: 140,
        render: (username: any) =>
          username ? (
            <Tag color="purple">@{username}</Tag>
          ) : (
            <span style={{ color: '#bbb' }}>-</span>
          ),
      },
      {
        title: intl.formatMessage({ id: 'type', defaultMessage: '类型' }),
        dataIndex: 'type',
        width: 100,
        render: (type: any) => <Tag color="purple">{type}</Tag>,
      },
      {
        title: intl.formatMessage({ id: 'pages.searchTable.titleOption', defaultMessage: '操作' }),
        valueType: 'option',
        width: 80,
        fixed: 'right',
        render: (_: any, record: any) => [
          <Button
            key="manage"
            type="primary"
            size="small"
            icon={<SettingOutlined />}
            onClick={() => {
              setSelectedChannel(record);
              setChannelFeaturesOpen(true);
            }}
          >
            {intl.formatMessage({ id: 'manage', defaultMessage: '管理' })}
          </Button>,
        ],
      },
    ];

    return (
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
    );
  };

  const tabItems = useMemo(() => {
    const items: any[] = [];

    // 群组管理 Tab - 有群组功能时显示

    items.push({
      key: 'groups',
      label: (
        <span>
          <TeamOutlined />{' '}
          {intl.formatMessage({ id: 'group_management', defaultMessage: '群组管理' })}
        </span>
      ),
      children: renderGroupsTab(),
    });

    items.push({
      key: 'channels',
      label: (
        <span>
          <NotificationOutlined />{' '}
          {intl.formatMessage({ id: 'channel_management', defaultMessage: '频道管理' })}
        </span>
      ),
      children: renderChannelsTab(),
    });

    return items;
  }, [currentRow, currentUser, onBotUpdate]);

  return (
    <>
      <Modal
        title={`${currentRow?.botName || currentRow?.userName} - ${intl.formatMessage({
          id: 'function_config',
          defaultMessage: '功能配置',
        })}`}
        open={open}
        onCancel={() => onCancel(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: 1200, top: 20 }}
        styles={{
          body: { minHeight: '60vh', paddingTop: 24 },
        }}
        className="md:top-5"
        destroyOnClose
      >
        <div className="md:block">
          <Tabs
            tabPosition={window.innerWidth < 768 ? 'top' : 'left'}
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            tabBarStyle={{ minWidth: window.innerWidth < 768 ? 'auto' : 140 }}
            style={{ minHeight: '60vh' }}
          />
        </div>
      </Modal>

      {/* 群组功能管理弹窗 */}
      <GroupFeaturesModal
        open={groupFeaturesOpen}
        onClose={() => {
          setGroupFeaturesOpen(false);
          setSelectedGroup(null);
        }}
        bot={currentRow}
        group={selectedGroup}
        currentUser={currentUser}
      />

      {/* 频道功能管理弹窗 */}
      <ChannelFeaturesModal
        open={channelFeaturesOpen}
        onClose={() => {
          setChannelFeaturesOpen(false);
          setSelectedChannel(null);
        }}
        bot={currentRow}
        channel={selectedChannel}
        currentUser={currentUser}
      />
    </>
  );
};

export default GroupFeatureManager;
