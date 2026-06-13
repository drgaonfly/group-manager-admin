import React, { useState } from 'react';
import { Modal, Tabs } from 'antd';
import { useIntl } from '@umijs/max';
import {
  MessageOutlined,
  KeyOutlined,
  StopOutlined,
  SmileOutlined,
  SafetyOutlined,
  BarChartOutlined,
  CalendarOutlined,
  TrophyOutlined,
  AuditOutlined,
} from '@ant-design/icons';

import GroupMessageGroupContent from './GroupMessage/GroupMessageGroupContent';
import ReplyRuleGroupContent from './ReplyRule/ReplyRuleGroupContent';
import AdRemovalGroupContent from './AdRemoval/AdRemovalGroupContent';
import GroupWelcomeGroupContent from './GroupWelcome/GroupWelcomeGroupContent';
import GroupVerifyGroupContent from './GroupVerify/GroupVerifyGroupContent';
import SpeechStatisticsGroupContent from './SpeechStatistics/SpeechStatisticsGroupContent';
import CheckinRuleGroupContent from './CheckinRule/CheckinRuleGroupContent';
import LotteryRuleGroupContent from './LotteryRule/LotteryRuleGroupContent';
import AuctionRuleGroupContent from './AuctionRule/AuctionRuleGroupContent';

interface GroupFeaturesModalProps {
  open: boolean;
  onClose: () => void;
  bot: any;
  group: any;
  botConfig: {
    canGroupMessaging?: boolean;
    canReplyRule?: boolean;
    canRemoveAd?: boolean;
    canGroupWelcome?: boolean;
    canGroupVerify?: boolean;
    canSpeechStatic?: boolean;
    canCheckIn?: boolean;
    canLotteryRule?: boolean;
    canAuctionRule?: boolean;
  };
  currentUser: any;
}

const GroupFeaturesModal: React.FC<GroupFeaturesModalProps> = ({
  open,
  onClose,
  bot,
  group,
  botConfig,
  currentUser,
}) => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState<string>('');

  const tabItems = React.useMemo(() => {
    const items: any[] = [];

    if (botConfig.canGroupMessaging && currentUser?.groupMessage) {
      items.push({
        key: 'groupMessage',
        label: (
          <span>
            <MessageOutlined />{' '}
            {intl.formatMessage({ id: 'group_message', defaultMessage: '群发消息' })}
          </span>
        ),
        children: <GroupMessageGroupContent open={open} bot={bot} group={group} />,
      });
    }

    if (botConfig.canReplyRule && currentUser?.replyRule) {
      items.push({
        key: 'replyRule',
        label: (
          <span>
            <KeyOutlined /> {intl.formatMessage({ id: 'reply_rule', defaultMessage: '关键词回复' })}
          </span>
        ),
        children: <ReplyRuleGroupContent open={open} bot={bot} group={group} />,
      });
    }

    if (botConfig.canRemoveAd) {
      items.push({
        key: 'adRemoval',
        label: (
          <span>
            <StopOutlined /> {intl.formatMessage({ id: 'ad_removal', defaultMessage: '去除广告' })}
          </span>
        ),
        children: <AdRemovalGroupContent open={open} bot={bot} group={group} />,
      });
    }

    if (botConfig.canGroupWelcome && currentUser?.groupWelcome) {
      items.push({
        key: 'groupWelcome',
        label: (
          <span>
            <SmileOutlined />{' '}
            {intl.formatMessage({ id: 'group_welcome', defaultMessage: '群欢迎' })}
          </span>
        ),
        children: <GroupWelcomeGroupContent open={open} bot={bot} group={group} />,
      });
    }

    if (botConfig.canGroupVerify && currentUser?.groupVerify) {
      items.push({
        key: 'groupVerify',
        label: (
          <span>
            <SafetyOutlined />{' '}
            {intl.formatMessage({ id: 'group_verify', defaultMessage: '群组验证' })}
          </span>
        ),
        children: <GroupVerifyGroupContent open={open} bot={bot} group={group} />,
      });
    }

    if (botConfig.canSpeechStatic && currentUser?.speech_static) {
      items.push({
        key: 'speechStatistics',
        label: (
          <span>
            <BarChartOutlined />{' '}
            {intl.formatMessage({ id: 'speech_statistics', defaultMessage: '发言统计' })}
          </span>
        ),
        children: <SpeechStatisticsGroupContent open={open} bot={bot} group={group} />,
      });
    }

    if (botConfig.canCheckIn && currentUser?.checkinRule) {
      items.push({
        key: 'checkinRule',
        label: (
          <span>
            <CalendarOutlined />{' '}
            {intl.formatMessage({ id: 'checkin_rule', defaultMessage: '群签到' })}
          </span>
        ),
        children: <CheckinRuleGroupContent open={open} bot={bot} group={group} />,
      });
    }

    if (botConfig.canLotteryRule && currentUser?.lotteryRule) {
      items.push({
        key: 'lotteryRule',
        label: (
          <span>
            <TrophyOutlined />{' '}
            {intl.formatMessage({ id: 'lottery_rule', defaultMessage: '群抽奖' })}
          </span>
        ),
        children: <LotteryRuleGroupContent open={open} bot={bot} group={group} />,
      });
    }

    if (botConfig.canAuctionRule && currentUser?.auctionRule) {
      items.push({
        key: 'auctionRule',
        label: (
          <span>
            <AuditOutlined /> {intl.formatMessage({ id: 'auction_rule', defaultMessage: '群竞拍' })}
          </span>
        ),
        children: <AuctionRuleGroupContent open={open} bot={bot} group={group} />,
      });
    }

    return items;
  }, [open, bot, group, botConfig, currentUser]);

  // 当 tab 列表变化时，确保 activeTab 合法
  React.useEffect(() => {
    if (tabItems.length > 0) {
      const keys = tabItems.map((t) => t.key);
      if (!keys.includes(activeTab)) {
        setActiveTab(keys[0]);
      }
    }
  }, [tabItems]);

  return (
    <Modal
      title={`${group?.title || ''} — ${intl.formatMessage({
        id: 'feature_management',
        defaultMessage: '功能管理',
      })}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width="80%"
      style={{ maxWidth: 1100, top: 20 }}
      styles={{ body: { minHeight: '50vh', paddingTop: 16 } }}
      destroyOnClose
    >
      {tabItems.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: '60px 0' }}>
          {intl.formatMessage({
            id: 'no_features_enabled',
            defaultMessage: '该机器人暂未启用任何群组功能',
          })}
        </div>
      ) : (
        <Tabs
          tabPosition="left"
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          tabBarStyle={{ minWidth: 120 }}
          style={{ minHeight: '50vh' }}
        />
      )}
    </Modal>
  );
};

export default GroupFeaturesModal;
