import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Tabs, message, Tag, Button, Empty } from 'antd';
import { useIntl } from '@umijs/max';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  SettingOutlined,
  AppstoreOutlined,
  TeamOutlined,
  NotificationOutlined,
  BookOutlined,
} from '@ant-design/icons';

// 全局功能 Tab
import OverviewTab from './Overview';
import ChannelPostTab from './ChannelPost';
import TeachingTab from './Teaching';

// 群组功能弹窗（点击群组"管理"后弹出）
import GroupFeaturesModal from './GroupFeaturesModal';

interface BotConfigManagerProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  currentRow: any;
  currentUser: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const BotConfigManager: React.FC<BotConfigManagerProps> = ({
  open,
  onCancel,
  currentRow,
  currentUser,
  onBotUpdate,
}) => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState('overview');
  const [botConfig, setBotConfig] = useState<any>({});

  // 当前选中的群组，用于打开功能管理弹窗
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groupFeaturesOpen, setGroupFeaturesOpen] = useState(false);

  useEffect(() => {
    if (open && currentRow?._id) {
      setActiveTab('overview');
      setBotConfig({
        canGroupMessaging: currentRow.canGroupMessaging,
        canOpenChannelPost: currentRow.canOpenChannelPost,
        canReplyRule: currentRow.canReplyRule,
        canFreeKeyboard: currentRow.canFreeKeyboard,
        canGroupWelcome: currentRow.canGroupWelcome,
        canGroupVerify: currentRow.canGroupVerify,
        canSpeechStatic: currentRow.canSpeechStatic,
        canBidirectional: currentRow.canBidirectional,
        canReportMemberNameUpdated: currentRow.canReportMemberNameUpdated,
        canCheckIn: currentRow.canCheckIn,
        canLotteryRule: currentRow.canLotteryRule,
        canAuctionRule: currentRow.canAuctionRule,
        canTeaching: currentRow.canTeaching,
        canRemoveAd: currentRow.canRemoveAd,
        canSuccess: currentRow.canSuccess,
        canRedPacket: currentRow.canRedPacket,
      });
    }
  }, [open, currentRow]);

  const handleBotConfigChange = async (field: string, value: boolean) => {
    if (!currentRow?._id || !onBotUpdate) return;
    try {
      await onBotUpdate({ _id: currentRow._id, [field]: value });
      setBotConfig((prev: any) => ({ ...prev, [field]: value }));
      message.success(intl.formatMessage({ id: 'update_successful', defaultMessage: '更新成功' }));
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          intl.formatMessage({ id: 'update_failed', defaultMessage: '更新失败，请重试！' }),
      );
    }
  };

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

  // 是否有任何群组功能启用
  const hasGroupFeatures =
    (botConfig.canGroupMessaging && currentUser?.groupMessage) ||
    (botConfig.canReplyRule && currentUser?.replyRule) ||
    botConfig.canRemoveAd ||
    (botConfig.canGroupWelcome && currentUser?.groupWelcome) ||
    (botConfig.canGroupVerify && currentUser?.groupVerify) ||
    (botConfig.canSpeechStatic && currentUser?.speech_static) ||
    (botConfig.canCheckIn && currentUser?.checkinRule) ||
    (botConfig.canLotteryRule && currentUser?.lotteryRule) ||
    (botConfig.canAuctionRule && currentUser?.auctionRule);

  const tabItems = useMemo(() => {
    const items: any[] = [];

    // 概览 Tab - 始终显示
    items.push({
      key: 'overview',
      label: (
        <span>
          <AppstoreOutlined /> {intl.formatMessage({ id: 'overview', defaultMessage: '概览' })}
        </span>
      ),
      children: (
        <OverviewTab
          currentRow={currentRow}
          currentUser={currentUser}
          botConfig={botConfig}
          onBotConfigChange={handleBotConfigChange}
        />
      ),
    });

    // 群组管理 Tab - 有群组功能时显示
    if (hasGroupFeatures) {
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
    }

    // ── 全局功能 ──────────────────────────────────────────

    if (botConfig.canOpenChannelPost && currentUser?.channelPost) {
      items.push({
        key: 'channelPost',
        label: (
          <span>
            <NotificationOutlined />{' '}
            {intl.formatMessage({ id: 'channel_post', defaultMessage: '频道推广' })}
          </span>
        ),
        children: <ChannelPostTab currentRow={currentRow} />,
      });
    }

    if (botConfig.canTeaching && currentUser?.teaching) {
      items.push({
        key: 'teaching',
        label: (
          <span>
            <BookOutlined /> {intl.formatMessage({ id: 'teaching', defaultMessage: '教学模块' })}
          </span>
        ),
        children: <TeachingTab currentRow={currentRow} onBotUpdate={onBotUpdate} />,
      });
    }

    return items;
  }, [currentRow, currentUser, botConfig, onBotUpdate, hasGroupFeatures]);

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
        destroyOnClose
      >
        <Tabs
          tabPosition="left"
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          tabBarStyle={{ minWidth: 140 }}
          style={{ minHeight: '60vh' }}
        />
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
        botConfig={botConfig}
        currentUser={currentUser}
      />
    </>
  );
};

export default BotConfigManager;
