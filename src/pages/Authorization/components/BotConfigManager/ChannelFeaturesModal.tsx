import React, { useState } from 'react';
import { Modal, Tabs, Row, Col } from 'antd';
import { useIntl } from '@umijs/max';
import { MessageOutlined, TeamOutlined } from '@ant-design/icons';

import ChannelPostGroupContent from './ChannelPost/ChannelPostGroupContent';

interface ChannelFeaturesModalProps {
  open: boolean;
  onClose: () => void;
  bot: any;
  channel: any;
  currentUser: any;
}

const ChannelFeaturesModal: React.FC<ChannelFeaturesModalProps> = ({
  open,
  onClose,
  bot,
  channel,
  currentUser,
}) => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState<string>('');

  const tabItems = React.useMemo(() => {
    const items: any[] = [];

    if (currentUser?.channelPost) {
      items.push({
        key: 'channelPost',
        label: (
          <span>
            <MessageOutlined />{' '}
            {intl.formatMessage({ id: 'channel_post', defaultMessage: '频道推广' })}
          </span>
        ),
        children: <ChannelPostGroupContent open={open} bot={bot} channel={channel} />,
      });
    }

    return items;
  }, [open, bot, channel, currentUser]);

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
      title={`${channel?.title || ''} — ${intl.formatMessage({
        id: 'channel_feature_management',
        defaultMessage: '频道功能管理',
      })}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width="80%"
      style={{ maxWidth: 1100, top: 20 }}
      styles={{ body: { minHeight: '50vh', paddingTop: 16 } }}
      destroyOnClose
    >
      {/* 频道统计卡片 */}
      {channel && (
        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          {[
            {
              label: '频道成员',
              value: channel.botUsers?.length ?? 0,
              icon: <TeamOutlined />,
              color: '#722ed1',
              bg: '#f9f0ff',
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
            id: 'no_channel_features_enabled',
            defaultMessage: '该机器人暂未启用任何频道功能',
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

export default ChannelFeaturesModal;
