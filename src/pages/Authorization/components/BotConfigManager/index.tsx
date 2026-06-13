import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Tabs, message, Tag, Button } from 'antd';
import { useIntl } from '@umijs/max';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { SettingOutlined } from '@ant-design/icons';

// 全局功能 Tab
import OverviewTab from './Overview';
import ChannelPostTab from './ChannelPost';
import TeachingTab from './Teaching';

// 分群功能的具体管理弹窗
import GroupMessageGroupModal from './GroupMessage/GroupMessageGroupModal';
import ReplyRuleGroupModal from './ReplyRule/ReplyRuleGroupModal';
import AdRemovalGroupModal from './AdRemoval/AdRemovalGroupModal';
import GroupWelcomeGroupModal from './GroupWelcome/GroupWelcomeGroupModal';
import GroupVerifyGroupModal from './GroupVerify/GroupVerifyGroupModal';
import SpeechStatisticsGroupModal from './SpeechStatistics/SpeechStatisticsGroupModal';
import CheckinRuleGroupModal from './CheckinRule/CheckinRuleGroupModal';
import LotteryRuleGroupModal from './LotteryRule/LotteryRuleGroupModal';
import AuctionRuleGroupModal from './AuctionRule/AuctionRuleGroupModal';

interface BotConfigManagerProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  currentRow: any;
  currentUser: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

/** 分群功能标识 */
type GroupFeatureKey =
  | 'groupMessage'
  | 'replyRule'
  | 'adRemoval'
  | 'groupWelcome'
  | 'groupVerify'
  | 'speechStatistics'
  | 'checkinRule'
  | 'lotteryRule'
  | 'auctionRule';

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

  // 当前选中的群组 + 功能弹窗状态
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groupModalFeature, setGroupModalFeature] = useState<GroupFeatureKey | null>(null);

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
        canRankConferral: currentRow.canRankConferral,
        canRecharge: currentRow.canRecharge,
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

  /** 打开某个群组的某个功能弹窗 */
  const openGroupModal = (group: any, feature: GroupFeatureKey) => {
    setSelectedGroup(group);
    setGroupModalFeature(feature);
  };

  const closeGroupModal = () => {
    setSelectedGroup(null);
    setGroupModalFeature(null);
  };

  /**
   * 分群功能的群组列表 Tab 内容
   * 右侧展示该 Bot 所有群（非频道），每行操作栏有「管理」按钮
   */
  const renderGroupTable = (featureKey: GroupFeatureKey) => {
    // 从 currentRow.groups 中过滤掉 channel 类型
    const groups: any[] = (currentRow?.groups || []).filter((g: any) => g.type !== 'channel');

    const columns: ProColumns<any>[] = [
      {
        title: intl.formatMessage({ id: 'group_name', defaultMessage: '群组名称' }),
        dataIndex: 'title',
        ellipsis: true,
      },
      {
        title: intl.formatMessage({ id: 'group_username', defaultMessage: '用户名' }),
        dataIndex: 'username',
        render: (username: any) =>
          username ? <Tag color="blue">@{username}</Tag> : <span style={{ color: '#bbb' }}>-</span>,
      },
      {
        title: intl.formatMessage({ id: 'group_type', defaultMessage: '类型' }),
        dataIndex: 'type',
        width: 110,
        render: (type: any) => <Tag>{type}</Tag>,
      },
      {
        title: intl.formatMessage({ id: 'pages.searchTable.titleOption', defaultMessage: '操作' }),
        valueType: 'option',
        width: 100,
        render: (_: any, record: any) => [
          <Button
            key="manage"
            type="link"
            size="small"
            icon={<SettingOutlined />}
            onClick={() => openGroupModal(record, featureKey)}
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
          emptyText: intl.formatMessage({ id: 'no_groups', defaultMessage: '该机器人暂无群组' }),
        }}
      />
    );
  };

  // 动态生成 tab 列表
  const tabItems = useMemo(() => {
    const items: any[] = [];

    // 概览 Tab - 始终显示
    items.push({
      key: 'overview',
      label: intl.formatMessage({ id: 'overview', defaultMessage: '概览' }),
      children: (
        <OverviewTab
          currentRow={currentRow}
          currentUser={currentUser}
          botConfig={botConfig}
          onBotConfigChange={handleBotConfigChange}
        />
      ),
    });

    // ── 分群功能 ──────────────────────────────────────────

    if (botConfig.canGroupMessaging && currentUser?.groupMessage) {
      items.push({
        key: 'groupMessage',
        label: intl.formatMessage({ id: 'group_message', defaultMessage: '群发消息' }),
        children: renderGroupTable('groupMessage'),
      });
    }

    if (botConfig.canReplyRule && currentUser?.replyRule) {
      items.push({
        key: 'replyRule',
        label: intl.formatMessage({ id: 'reply_rule', defaultMessage: '关键词回复' }),
        children: renderGroupTable('replyRule'),
      });
    }

    if (botConfig.canRemoveAd) {
      items.push({
        key: 'adRemoval',
        label: intl.formatMessage({ id: 'ad_removal', defaultMessage: '去除广告' }),
        children: renderGroupTable('adRemoval'),
      });
    }

    if (botConfig.canGroupWelcome && currentUser?.groupWelcome) {
      items.push({
        key: 'groupWelcome',
        label: intl.formatMessage({ id: 'group_welcome', defaultMessage: '群欢迎' }),
        children: renderGroupTable('groupWelcome'),
      });
    }

    if (botConfig.canGroupVerify && currentUser?.groupVerify) {
      items.push({
        key: 'groupVerify',
        label: intl.formatMessage({ id: 'group_verify', defaultMessage: '群组验证' }),
        children: renderGroupTable('groupVerify'),
      });
    }

    if (botConfig.canSpeechStatic && currentUser?.speech_static) {
      items.push({
        key: 'speechStatistics',
        label: intl.formatMessage({ id: 'speech_statistics', defaultMessage: '发言统计' }),
        children: renderGroupTable('speechStatistics'),
      });
    }

    if (botConfig.canCheckIn && currentUser?.checkinRule) {
      items.push({
        key: 'checkinRule',
        label: intl.formatMessage({ id: 'checkin_rule', defaultMessage: '群签到' }),
        children: renderGroupTable('checkinRule'),
      });
    }

    if (botConfig.canLotteryRule && currentUser?.lotteryRule) {
      items.push({
        key: 'lotteryRule',
        label: intl.formatMessage({ id: 'lottery_rule', defaultMessage: '群抽奖' }),
        children: renderGroupTable('lotteryRule'),
      });
    }

    if (botConfig.canAuctionRule && currentUser?.auctionRule) {
      items.push({
        key: 'auctionRule',
        label: intl.formatMessage({ id: 'auction_rule', defaultMessage: '群竞拍' }),
        children: renderGroupTable('auctionRule'),
      });
    }

    // ── 全局功能 ──────────────────────────────────────────

    if (botConfig.canOpenChannelPost && currentUser?.channelPost) {
      items.push({
        key: 'channelPost',
        label: intl.formatMessage({ id: 'channel_post', defaultMessage: '频道推广' }),
        children: <ChannelPostTab currentRow={currentRow} />,
      });
    }

    if (botConfig.canTeaching && currentUser?.teaching) {
      items.push({
        key: 'teaching',
        label: intl.formatMessage({ id: 'teaching', defaultMessage: '教学模块' }),
        children: <TeachingTab currentRow={currentRow} onBotUpdate={onBotUpdate} />,
      });
    }

    return items;
  }, [currentRow, currentUser, botConfig, onBotUpdate]);

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
          tabBarStyle={{ minWidth: 120 }}
        />
      </Modal>

      {/* 分群功能管理弹窗 */}
      {groupModalFeature === 'groupMessage' && (
        <GroupMessageGroupModal
          open={!!selectedGroup}
          onClose={closeGroupModal}
          bot={currentRow}
          group={selectedGroup}
        />
      )}
      {groupModalFeature === 'replyRule' && (
        <ReplyRuleGroupModal
          open={!!selectedGroup}
          onClose={closeGroupModal}
          bot={currentRow}
          group={selectedGroup}
        />
      )}
      {groupModalFeature === 'adRemoval' && (
        <AdRemovalGroupModal
          open={!!selectedGroup}
          onClose={closeGroupModal}
          bot={currentRow}
          group={selectedGroup}
        />
      )}
      {groupModalFeature === 'groupWelcome' && (
        <GroupWelcomeGroupModal
          open={!!selectedGroup}
          onClose={closeGroupModal}
          bot={currentRow}
          group={selectedGroup}
        />
      )}
      {groupModalFeature === 'groupVerify' && (
        <GroupVerifyGroupModal
          open={!!selectedGroup}
          onClose={closeGroupModal}
          bot={currentRow}
          group={selectedGroup}
        />
      )}
      {groupModalFeature === 'speechStatistics' && (
        <SpeechStatisticsGroupModal
          open={!!selectedGroup}
          onClose={closeGroupModal}
          bot={currentRow}
          group={selectedGroup}
        />
      )}
      {groupModalFeature === 'checkinRule' && (
        <CheckinRuleGroupModal
          open={!!selectedGroup}
          onClose={closeGroupModal}
          bot={currentRow}
          group={selectedGroup}
        />
      )}
      {groupModalFeature === 'lotteryRule' && (
        <LotteryRuleGroupModal
          open={!!selectedGroup}
          onClose={closeGroupModal}
          bot={currentRow}
          group={selectedGroup}
        />
      )}
      {groupModalFeature === 'auctionRule' && (
        <AuctionRuleGroupModal
          open={!!selectedGroup}
          onClose={closeGroupModal}
          bot={currentRow}
          group={selectedGroup}
        />
      )}
    </>
  );
};

export default BotConfigManager;
