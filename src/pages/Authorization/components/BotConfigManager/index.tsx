import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Tabs, message } from 'antd';
import { useIntl } from '@umijs/max';
import OverviewTab from './Overview';
import GroupMessageTab from './GroupMessage';
import ChannelPostTab from './ChannelPost';
import ReplyRuleTab from './ReplyRule';
import KeyboardTab from './Keyboard';
import GroupWelcomeTab from './GroupWelcome';
import GroupVerifyTab from './GroupVerify';
import SpeechStatisticsTab from './SpeechStatistics';
import CheckinRuleTab from './CheckinRule';
import LotteryRuleTab from './LotteryRule';
import AuctionRuleTab from './AuctionRule';
import TeachingTab from './Teaching';
import AdRemovalTab from './AdRemoval';
import RankConferralTab from './RankConferral';
import SuccessTab from './Success';
import RedPacketTab from './RedPacket';

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

  // 更新 Bot 功能开关
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

  // 动态生成 tab 列表
  const tabItems = useMemo(() => {
    const items = [];

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

    // 群发消息 Tab
    if (botConfig.canGroupMessaging && currentUser?.groupMessage) {
      items.push({
        key: 'groupMessage',
        label: intl.formatMessage({ id: 'group_message', defaultMessage: '群发消息' }),
        children: <GroupMessageTab currentRow={currentRow} />,
      });
    }

    // 频道推广 Tab
    if (botConfig.canOpenChannelPost && currentUser?.channelPost) {
      items.push({
        key: 'channelPost',
        label: intl.formatMessage({ id: 'channel_post', defaultMessage: '频道推广' }),
        children: <ChannelPostTab currentRow={currentRow} />,
      });
    }

    // 回复规则 Tab
    if (botConfig.canReplyRule && currentUser?.replyRule) {
      items.push({
        key: 'replyRule',
        label: intl.formatMessage({ id: 'reply_rule', defaultMessage: '回复规则' }),
        children: <ReplyRuleTab currentRow={currentRow} />,
      });
    }

    // 键盘配置 Tab
    if (botConfig.canFreeKeyboard && currentUser?.keyboardConfig) {
      items.push({
        key: 'keyboard',
        label: intl.formatMessage({ id: 'free_keyboard', defaultMessage: '自由键盘' }),
        children: <KeyboardTab currentRow={currentRow} onBotUpdate={onBotUpdate} />,
      });
    }

    // 群欢迎 Tab
    if (botConfig.canGroupWelcome && currentUser?.groupWelcome) {
      items.push({
        key: 'groupWelcome',
        label: intl.formatMessage({ id: 'group_welcome', defaultMessage: '群欢迎' }),
        children: <GroupWelcomeTab currentRow={currentRow} onBotUpdate={onBotUpdate} />,
      });
    }

    // 群组验证 Tab
    if (botConfig.canGroupVerify && currentUser?.groupVerify) {
      items.push({
        key: 'groupVerify',
        label: intl.formatMessage({ id: 'group_verify', defaultMessage: '群组验证' }),
        children: <GroupVerifyTab currentRow={currentRow} onBotUpdate={onBotUpdate} />,
      });
    }

    // 发言统计 Tab
    if (botConfig.canSpeechStatic && currentUser?.speech_static) {
      items.push({
        key: 'speechStatistics',
        label: intl.formatMessage({ id: 'speech_statistics', defaultMessage: '发言统计' }),
        children: <SpeechStatisticsTab currentRow={currentRow} onBotUpdate={onBotUpdate} />,
      });
    }

    // 群签到 Tab
    if (botConfig.canCheckIn && currentUser?.checkinRule) {
      items.push({
        key: 'checkinRule',
        label: intl.formatMessage({ id: 'checkin_rule', defaultMessage: '群签到' }),
        children: <CheckinRuleTab currentRow={currentRow} onBotUpdate={onBotUpdate} />,
      });
    }

    // 群抽奖 Tab
    if (botConfig.canLotteryRule && currentUser?.lotteryRule) {
      items.push({
        key: 'lotteryRule',
        label: intl.formatMessage({ id: 'lottery_rule', defaultMessage: '群抽奖' }),
        children: <LotteryRuleTab currentRow={currentRow} onBotUpdate={onBotUpdate} />,
      });
    }

    // 群竞拍 Tab
    if (botConfig.canAuctionRule && currentUser?.auctionRule) {
      items.push({
        key: 'auctionRule',
        label: intl.formatMessage({ id: 'auction_rule', defaultMessage: '群竞拍' }),
        children: <AuctionRuleTab currentRow={currentRow} onBotUpdate={onBotUpdate} />,
      });
    }

    // 教学模块 Tab
    if (botConfig.canTeaching && currentUser?.teaching) {
      items.push({
        key: 'teaching',
        label: intl.formatMessage({ id: 'teaching', defaultMessage: '教学模块' }),
        children: <TeachingTab currentRow={currentRow} onBotUpdate={onBotUpdate} />,
      });
    }

    // 去除广告 Tab
    if (botConfig.canRemoveAd) {
      items.push({
        key: 'adRemoval',
        label: intl.formatMessage({ id: 'ad_removal', defaultMessage: '去除广告' }),
        children: <AdRemovalTab currentRow={currentRow} onBotUpdate={onBotUpdate} />,
      });
    }

    // 授衔 Tab
    if (botConfig.canRankConferral && currentUser?.rankConferral) {
      items.push({
        key: 'rankConferral',
        label: intl.formatMessage({ id: 'rank_conferral', defaultMessage: '授衔' }),
        children: <RankConferralTab currentRow={currentRow} onBotUpdate={onBotUpdate} />,
      });
    }

    // 积分继承 Tab
    if (botConfig.canSuccess && currentUser?.success) {
      items.push({
        key: 'success',
        label: intl.formatMessage({ id: 'success', defaultMessage: '积分继承' }),
        children: <SuccessTab currentRow={currentRow} />,
      });
    }

    // 红包 Tab
    if (botConfig.canRedPacket && currentUser?.redPacket) {
      items.push({
        key: 'redPacket',
        label: intl.formatMessage({ id: 'redPacket', defaultMessage: '红包' }),
        children: <RedPacketTab currentRow={currentRow} />,
      });
    }

    return items;
  }, [currentRow, currentUser, botConfig, onBotUpdate]);

  return (
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
  );
};

export default BotConfigManager;
