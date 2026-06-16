import React, { useState } from 'react';
import { Modal, Tabs, Row, Col } from 'antd';
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
  TeamOutlined,
  ClockCircleOutlined,
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
  botConfig?: any; // 保留兼容性，不再使用
  currentUser: any;
}

const GroupFeaturesModal: React.FC<GroupFeaturesModalProps> = ({
  open,
  onClose,
  bot,
  group,
  currentUser,
}) => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState<string>('');

  const tabItems = React.useMemo(() => {
    const items: any[] = [];

    if (currentUser?.groupMessage) {
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

    if (currentUser?.replyRule) {
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

    if (currentUser?.adRemoval) {
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

    if (currentUser?.groupWelcome) {
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

    if (currentUser?.groupVerify) {
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

    if (currentUser?.speech_static) {
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

    if (currentUser?.checkinRule) {
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

    if (currentUser?.lotteryRule) {
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

    if (currentUser?.auctionRule) {
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
  }, [open, bot, group, currentUser]);

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
      {/* 群组统计卡片 */}
      {group && (
        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          {[
            {
              label: '群成员',
              value: group.botUsers?.length ?? 0,
              icon: <TeamOutlined />,
              color: '#1677ff',
              bg: '#e6f4ff',
            },
            {
              label: '已禁言',
              value: group.mutedUsers?.length ?? 0,
              icon: <StopOutlined />,
              color: '#f5222d',
              bg: '#fff1f0',
            },
            {
              label: '待验证',
              value: group.pendingVerifyUsers?.length ?? 0,
              icon: <ClockCircleOutlined />,
              color: '#fa8c16',
              bg: '#fff7e6',
            },
          ].map((s) => (
            <Col span={8} key={s.label}>
              <div
                style={{
                  background: s.bg,
                  border: `1px solid ${s.color}22`,
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: `${s.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    color: s.color,
                    flexShrink: 0,
                  }}
                >
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: s.color, lineHeight: 1.2 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

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
