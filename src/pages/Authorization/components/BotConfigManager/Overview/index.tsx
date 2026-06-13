import React from 'react';
import { Row, Col, Switch, Tooltip, Badge } from 'antd';
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
  BookOutlined,
  StopOutlined,
  MoneyCollectOutlined,
  RedEnvelopeOutlined,
} from '@ant-design/icons';

interface OverviewTabProps {
  currentRow: any;
  currentUser: any;
  botConfig: any;
  onBotConfigChange: (field: string, value: boolean) => Promise<void>;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  currentRow,
  currentUser,
  botConfig,
  onBotConfigChange,
}) => {
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
      permission: currentUser?.groupMessage,
      desc: '定时向群组发送消息',
    },
    {
      key: 'canOpenChannelPost',
      label: intl.formatMessage({ id: 'channelPost', defaultMessage: '频道推广' }),
      icon: <NotificationOutlined />,
      color: '#722ed1',
      permission: currentUser?.channelPost,
      desc: '定时向频道推送内容',
    },
    {
      key: 'canReplyRule',
      label: intl.formatMessage({ id: 'replyRule', defaultMessage: '关键词回复' }),
      icon: <KeyOutlined />,
      color: '#13c2c2',
      permission: currentUser?.replyRule,
      desc: '命中关键词后自动回复',
    },
    {
      key: 'canGroupWelcome',
      label: intl.formatMessage({ id: 'welcomeGroup', defaultMessage: '欢迎入群' }),
      icon: <SmileOutlined />,
      color: '#52c41a',
      permission: currentUser?.groupWelcome,
      desc: '新成员加入时发送欢迎消息',
    },
    {
      key: 'canGroupVerify',
      label: intl.formatMessage({ id: 'groupVerify', defaultMessage: '群组验证' }),
      icon: <SafetyOutlined />,
      color: '#fa8c16',
      permission: currentUser?.groupVerify,
      desc: '新成员入群前答题验证',
    },
    {
      key: 'canSpeechStatic',
      label: intl.formatMessage({ id: 'speechStatic', defaultMessage: '发言统计' }),
      icon: <BarChartOutlined />,
      color: '#1677ff',
      permission: currentUser?.speech_static,
      desc: '统计群内成员发言并发放积分',
    },
    {
      key: 'canBidirectional',
      label: intl.formatMessage({ id: 'canBidirectional', defaultMessage: '双向通信' }),
      icon: <RetweetOutlined />,
      color: '#eb2f96',
      permission: currentUser?.bidirectional,
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
      permission: currentUser?.reportGroupMemberNameUpdated,
      desc: '成员修改昵称时发送通知',
    },
    {
      key: 'canCheckIn',
      label: intl.formatMessage({ id: 'canCheckIn', defaultMessage: '群签到' }),
      icon: <CalendarOutlined />,
      color: '#52c41a',
      permission: currentUser?.checkinRule,
      desc: '群内签到获取积分',
    },
    {
      key: 'canLotteryRule',
      label: intl.formatMessage({ id: 'canLotteryRule', defaultMessage: '群抽奖' }),
      icon: <TrophyOutlined />,
      color: '#fa8c16',
      permission: currentUser?.lotteryRule,
      desc: '群内举办抽奖活动',
    },
    {
      key: 'canAuctionRule',
      label: intl.formatMessage({ id: 'canAuctionRule', defaultMessage: '群竞拍' }),
      icon: <AuditOutlined />,
      color: '#f5222d',
      permission: currentUser?.auctionRule,
      desc: '群内举办积分竞拍活动',
    },
    {
      key: 'canTeaching',
      label: intl.formatMessage({ id: 'canTeaching', defaultMessage: '教学模块' }),
      icon: <BookOutlined />,
      color: '#13c2c2',
      permission: currentUser?.teaching,
      desc: '认证老师与课程管理',
    },
    {
      key: 'canRemoveAd',
      label: intl.formatMessage({ id: 'canRemoveAd', defaultMessage: '去除广告' }),
      icon: <StopOutlined />,
      color: '#f5222d',
      permission: currentUser?.adRemoval,
      desc: '自动删除违规广告消息',
    },
    {
      key: 'canRecharge',
      label: intl.formatMessage({ id: 'canRecharge', defaultMessage: '充值' }),
      icon: <MoneyCollectOutlined />,
      color: '#52c41a',
      permission: currentUser?.recharge,
      desc: '链上充值积分',
    },
    {
      key: 'canRedPacket',
      label: intl.formatMessage({ id: 'canRedPacket', defaultMessage: '红包功能' }),
      icon: <RedEnvelopeOutlined />,
      color: '#f5222d',
      permission: currentUser?.redPacket,
      desc: '群内发送积分红包',
    },
  ];

  const visibleSwitches = featureSwitches.filter((item) => item.permission);

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

      {/* 功能开关标题 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <CustomerServiceOutlined style={{ color: '#1677ff', fontSize: 15 }} />
        <span style={{ fontWeight: 600, fontSize: 14, color: '#1d2939' }}>功能开关</span>
        <span style={{ color: '#999', fontSize: 12 }}>
          已开启 {visibleSwitches.filter((s) => botConfig[s.key]).length} / {visibleSwitches.length}
        </span>
      </div>

      {/* 功能卡片网格 */}
      <Row gutter={[12, 12]}>
        {visibleSwitches.map((item) => {
          const isOn = !!botConfig[item.key];
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
                  transition: 'all 0.2s',
                  cursor: 'default',
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
                    transition: 'all 0.2s',
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
                        transition: 'color 0.2s',
                      }}
                    >
                      {item.label}
                    </div>
                  </Tooltip>
                  <Badge
                    status={isOn ? 'success' : 'default'}
                    text={
                      <span style={{ fontSize: 11, color: isOn ? '#52c41a' : '#bfbfbf' }}>
                        {isOn ? '已开启' : '未开启'}
                      </span>
                    }
                  />
                </div>

                {/* 开关 */}
                <Switch
                  checked={isOn}
                  size="small"
                  style={{ flexShrink: 0 }}
                  onChange={(checked) => onBotConfigChange(item.key, checked)}
                />
              </div>
            </Col>
          );
        })}
      </Row>

      {visibleSwitches.length === 0 && (
        <div style={{ textAlign: 'center', color: '#bfbfbf', padding: '40px 0', fontSize: 13 }}>
          暂无可用功能，请联系管理员开通权限
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
