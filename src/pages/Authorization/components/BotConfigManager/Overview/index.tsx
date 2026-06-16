import React from 'react';
import { Row, Col, Tooltip, Badge } from 'antd';
import { useIntl } from '@umijs/max';
import {
  TeamOutlined,
  NotificationOutlined,
  UserOutlined,
  CrownOutlined,
  MessageOutlined,
  CustomerServiceOutlined,
  KeyOutlined,
  SmileOutlined,
  SafetyOutlined,
  BarChartOutlined,
  RetweetOutlined,
  IdcardOutlined,
  CalendarOutlined,
  TrophyOutlined,
  AuditOutlined,
  StopOutlined,
  RedEnvelopeOutlined,
} from '@ant-design/icons';

interface OverviewTabProps {
  currentRow: any;
  currentUser: any;
  botConfig?: any; // 保留兼容性，不再使用
  onBotConfigChange?: (field: string, value: boolean) => Promise<void>; // 保留兼容性，不再使用
}

const OverviewTab: React.FC<OverviewTabProps> = ({ currentRow, currentUser }) => {
  const intl = useIntl();

  const groupCount = currentRow?.groups?.filter((g: any) => g.type !== 'channel').length || 0;
  const channelCount = currentRow?.groups?.filter((g: any) => g.type === 'channel').length || 0;
  const userCount = currentRow?.botUserConfigs?.length || 0;
  const ownerCount = currentRow?.owners?.length || 0;

  const stats = [
    { label: '群组', value: groupCount, color: '#1677ff', bg: '#e6f4ff', icon: <TeamOutlined /> },
    {
      label: '频道',
      value: channelCount,
      color: '#722ed1',
      bg: '#f9f0ff',
      icon: <NotificationOutlined />,
    },
    { label: '用户', value: userCount, color: '#52c41a', bg: '#f6ffed', icon: <UserOutlined /> },
    {
      label: '拥有者',
      value: ownerCount,
      color: '#fa8c16',
      bg: '#fff7e6',
      icon: <CrownOutlined />,
    },
  ];

  const featureSwitches = [
    {
      key: 'canGroupMessaging',
      label: intl.formatMessage({ id: 'groupMessage', defaultMessage: '群发消息' }),
      icon: <MessageOutlined />,
      color: '#1677ff',
      enabled: !!currentUser?.groupMessage,
      desc: '定时向群组发送消息',
    },
    {
      key: 'canOpenChannelPost',
      label: intl.formatMessage({ id: 'channelPost', defaultMessage: '频道推广' }),
      icon: <NotificationOutlined />,
      color: '#722ed1',
      enabled: !!currentUser?.channelPost,
      desc: '定时向频道推送内容',
    },
    {
      key: 'canReplyRule',
      label: intl.formatMessage({ id: 'replyRule', defaultMessage: '关键词回复' }),
      icon: <KeyOutlined />,
      color: '#13c2c2',
      enabled: !!currentUser?.replyRule,
      desc: '命中关键词后自动回复',
    },
    {
      key: 'canGroupWelcome',
      label: intl.formatMessage({ id: 'welcomeGroup', defaultMessage: '欢迎入群' }),
      icon: <SmileOutlined />,
      color: '#52c41a',
      enabled: !!currentUser?.groupWelcome,
      desc: '新成员加入时发送欢迎消息',
    },
    {
      key: 'canGroupVerify',
      label: intl.formatMessage({ id: 'groupVerify', defaultMessage: '群组验证' }),
      icon: <SafetyOutlined />,
      color: '#fa8c16',
      enabled: !!currentUser?.groupVerify,
      desc: '新成员入群前答题验证',
    },
    {
      key: 'canSpeechStatic',
      label: intl.formatMessage({ id: 'speechStatic', defaultMessage: '发言统计' }),
      icon: <BarChartOutlined />,
      color: '#1677ff',
      enabled: !!currentUser?.speech_static,
      desc: '统计群内成员发言并发放积分',
    },
    {
      key: 'canBidirectional',
      label: intl.formatMessage({ id: 'canBidirectional', defaultMessage: '双向通信' }),
      icon: <RetweetOutlined />,
      color: '#eb2f96',
      enabled: !!currentUser?.bidirectional,
      desc: '启用双向消息通道',
    },
    {
      key: 'canReportMemberNameUpdated',
      label: intl.formatMessage({
        id: 'canReportMemberNameUpdated',
        defaultMessage: '名称变更播报',
      }),
      icon: <IdcardOutlined />,
      color: '#722ed1',
      enabled: !!currentUser?.reportGroupMemberNameUpdated,
      desc: '成员修改昵称时发送通知',
    },
    {
      key: 'canCheckIn',
      label: intl.formatMessage({ id: 'canCheckIn', defaultMessage: '群签到' }),
      icon: <CalendarOutlined />,
      color: '#52c41a',
      enabled: !!currentUser?.checkinRule,
      desc: '群内签到获取积分',
    },
    {
      key: 'canLotteryRule',
      label: intl.formatMessage({ id: 'canLotteryRule', defaultMessage: '群抽奖' }),
      icon: <TrophyOutlined />,
      color: '#fa8c16',
      enabled: !!currentUser?.lotteryRule,
      desc: '群内举办抽奖活动',
    },
    {
      key: 'canAuctionRule',
      label: intl.formatMessage({ id: 'canAuctionRule', defaultMessage: '群竞拍' }),
      icon: <AuditOutlined />,
      color: '#f5222d',
      enabled: !!currentUser?.auctionRule,
      desc: '群内举办积分竞拍活动',
    },
    {
      key: 'canRemoveAd',
      label: intl.formatMessage({ id: 'canRemoveAd', defaultMessage: '去除广告' }),
      icon: <StopOutlined />,
      color: '#f5222d',
      enabled: !!currentUser?.adRemoval,
      desc: '自动删除违规广告消息',
    },
    {
      key: 'canRedPacket',
      label: intl.formatMessage({ id: 'canRedPacket', defaultMessage: '红包功能' }),
      icon: <RedEnvelopeOutlined />,
      color: '#f5222d',
      enabled: !!currentUser?.redPacket,
      desc: '群内发送积分红包',
    },
  ];

  const visibleSwitches = featureSwitches;

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[12, 12]} style={{ marginBottom: 28 }}>
        {stats.map((s) => (
          <Col span={6} key={s.label}>
            <div
              style={{
                background: s.bg,
                border: `1px solid ${s.color}22`,
                borderRadius: 10,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: `${s.color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  color: s.color,
                  flexShrink: 0,
                }}
              >
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1.2 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* 功能权限标题 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <CustomerServiceOutlined style={{ color: '#1677ff', fontSize: 15 }} />
        <span style={{ fontWeight: 600, fontSize: 14, color: '#1d2939' }}>已开通功能</span>
        <span style={{ color: '#999', fontSize: 12 }}>
          {visibleSwitches.filter((s) => s.enabled).length} / {visibleSwitches.length} 项已授权
        </span>
      </div>

      {/* 功能卡片网格 — 只读展示，权限由平台统一控制 */}
      <Row gutter={[12, 12]}>
        {visibleSwitches.map((item) => {
          const isOn = item.enabled;
          return (
            <Col span={8} key={item.key}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: isOn ? `1px solid ${item.color}44` : '1px solid #f0f0f0',
                  background: isOn ? `${item.color}08` : '#fafafa',
                }}
              >
                {/* 图标 */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: isOn ? `${item.color}18` : '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    color: isOn ? item.color : '#bfbfbf',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>

                {/* 文字 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Tooltip title={item.desc} placement="top">
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: isOn ? '#1d2939' : '#8c8c8c',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.label}
                    </div>
                  </Tooltip>
                  <Badge
                    status={isOn ? 'success' : 'default'}
                    text={
                      <span style={{ fontSize: 11, color: isOn ? '#52c41a' : '#bfbfbf' }}>
                        {isOn ? '已授权' : '未授权'}
                      </span>
                    }
                  />
                </div>
              </div>
            </Col>
          );
        })}
      </Row>

      {visibleSwitches.filter((s) => s.enabled).length === 0 && (
        <div style={{ textAlign: 'center', color: '#bfbfbf', padding: '40px 0', fontSize: 13 }}>
          暂无已授权功能，请联系管理员开通权限
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
