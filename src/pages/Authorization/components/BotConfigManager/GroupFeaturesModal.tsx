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
  DeleteOutlined,
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
import ServiceMessageConfigGroupContent from './ServiceMessage/ServiceMessageGroupContent';

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

    if (currentUser?.serviceMessage) {
      items.push({
        key: 'serviceMessage',
        label: (
          <span>
            <DeleteOutlined />{' '}
            {intl.formatMessage({ id: 'service_message', defaultMessage: '服务消息' })}
          </span>
        ),
        children: <ServiceMessageConfigGroupContent open={open} bot={bot} group={group} />,
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
      width="100%"
      style={{ maxWidth: 1100, top: 20, margin: 0 }}
      styles={{ body: { minHeight: '50vh', paddingTop: 16 } }}
      destroyOnClose
      centered
    >
      {/* 群组统计卡片 */}
      {group && (
        <Row gutter={[12, 12]} className="mb-5">
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
            <Col xs={24} sm={12} md={8} key={s.label}>
              <div
                className="rounded-lg p-3 sm:p-4 flex items-center gap-3"
                style={{ background: s.bg, border: `1px solid ${s.color}22` }}
              >
                <div
                  className="w-10 h-10 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-lg sm:text-xl flex-shrink-0"
                  style={{ background: `${s.color}18`, color: s.color }}
                >
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xl sm:text-2xl font-bold leading-tight"
                    style={{ color: s.color }}
                  >
                    {s.value}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">{s.label}</div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {tabItems.length === 0 ? (
        <div className="text-center text-gray-400 py-15">
          {intl.formatMessage({
            id: 'no_features_enabled',
            defaultMessage: '该机器人暂未启用任何群组功能',
          })}
        </div>
      ) : (
        <Tabs
          tabPosition={window.innerWidth < 768 ? 'top' : 'left'}
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          tabBarStyle={{ minWidth: window.innerWidth < 768 ? 'auto' : 120 }}
          style={{ minHeight: '50vh' }}
        />
      )}
    </Modal>
  );
};

export default GroupFeaturesModal;
