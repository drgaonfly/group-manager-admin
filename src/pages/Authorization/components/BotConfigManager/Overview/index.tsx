import React from 'react';
import { Card, Row, Col, Divider, Switch } from 'antd';
import { useIntl } from '@umijs/max';

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

  const featureSwitches = [
    {
      key: 'canGroupMessaging',
      label: intl.formatMessage({ id: 'groupMessage', defaultMessage: '群发消息' }),
      permission: currentUser?.groupMessage,
    },
    {
      key: 'canOpenChannelPost',
      label: intl.formatMessage({ id: 'channelPost', defaultMessage: '频道推广' }),
      permission: currentUser?.channelPost,
    },
    {
      key: 'canReplyRule',
      label: intl.formatMessage({ id: 'replyRule', defaultMessage: '关键词回复' }),
      permission: currentUser?.replyRule,
    },
    {
      key: 'canFreeKeyboard',
      label: intl.formatMessage({ id: 'keyboardConfig', defaultMessage: '键盘配置' }),
      permission: currentUser?.keyboardConfig,
    },
    {
      key: 'canGroupWelcome',
      label: intl.formatMessage({ id: 'welcomeGroup', defaultMessage: '欢迎入群' }),
      permission: currentUser?.groupWelcome,
    },
    {
      key: 'canGroupVerify',
      label: intl.formatMessage({ id: 'groupVerify', defaultMessage: '群组验证' }),
      permission: currentUser?.groupVerify,
    },
    {
      key: 'canSpeechStatic',
      label: intl.formatMessage({ id: 'speechStatic', defaultMessage: '发言统计' }),
      permission: currentUser?.speech_static,
    },
    {
      key: 'canBidirectional',
      label: intl.formatMessage({ id: 'canBidirectional', defaultMessage: '双向通信' }),
      permission: currentUser?.bidirectional,
    },
    {
      key: 'canReportMemberNameUpdated',
      label: intl.formatMessage({
        id: 'canReportMemberNameUpdated',
        defaultMessage: '报道群成员名称变更',
      }),
      permission: currentUser?.reportGroupMemberNameUpdated,
    },
    {
      key: 'canCheckIn',
      label: intl.formatMessage({ id: 'canCheckIn', defaultMessage: '群签到' }),
      permission: currentUser?.checkinRule,
    },
    {
      key: 'canLotteryRule',
      label: intl.formatMessage({ id: 'canLotteryRule', defaultMessage: '群抽奖' }),
      permission: currentUser?.lotteryRule,
    },
    {
      key: 'canAuctionRule',
      label: intl.formatMessage({ id: 'canAuctionRule', defaultMessage: '群竞拍' }),
      permission: currentUser?.auctionRule,
    },
    {
      key: 'canTeaching',
      label: intl.formatMessage({ id: 'canTeaching', defaultMessage: '教学模块' }),
      permission: currentUser?.teaching,
    },
    {
      key: 'canRemoveAd',
      label: intl.formatMessage({ id: 'canRemoveAd', defaultMessage: '去除广告' }),
      permission: currentUser?.adRemoval,
    },
    {
      key: 'canRankConferral',
      label: intl.formatMessage({ id: 'canRankConferral', defaultMessage: '授衔' }),
      permission: currentUser?.rankConferral,
    },
    {
      key: 'canRecharge',
      label: intl.formatMessage({ id: 'canRecharge', defaultMessage: '充值' }),
      permission: currentUser?.recharge,
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>{groupCount}</div>
              <div style={{ color: '#666' }}>群组</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>
                {channelCount}
              </div>
              <div style={{ color: '#666' }}>频道</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                {currentRow?.botUserConfigs?.length || 0}
              </div>
              <div style={{ color: '#666' }}>用户</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
                {currentRow?.owners?.length || 0}
              </div>
              <div style={{ color: '#666' }}>拥有者</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">功能开关</Divider>
      <Row gutter={[24, 16]}>
        {featureSwitches
          .filter((item) => item.permission)
          .map((item) => (
            <Col span={8} key={item.key}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: '#fafafa',
                  borderRadius: 6,
                }}
              >
                <span>{item.label}</span>
                <Switch
                  checked={botConfig[item.key]}
                  onChange={(checked) => onBotConfigChange(item.key, checked)}
                />
              </div>
            </Col>
          ))}
      </Row>
    </div>
  );
};

export default OverviewTab;
