import React, { useState } from 'react';
import { Modal, Tabs, Row, Col } from 'antd';
import { useIntl } from '@umijs/max';
import { MessageOutlined, TeamOutlined } from '@ant-design/icons';

import ChannelPost from './features/ChannelPost/Content';

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
        children: <ChannelPost open={open} bot={bot} channel={channel} />,
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
      width="100%"
      style={{ maxWidth: 1100, top: 20, margin: 0 }}
      styles={{ body: { minHeight: '50vh', paddingTop: 16 } }}
      destroyOnClose
      centered
    >
      {/* 频道统计卡片 */}
      {channel && (
        <Row gutter={[12, 12]} className="mb-5">
          {[
            {
              label: '频道成员',
              value: channel.botUsers?.length ?? 0,
              icon: <TeamOutlined />,
              color: '#722ed1',
              bg: '#f9f0ff',
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
            id: 'no_channel_features_enabled',
            defaultMessage: '该机器人暂未启用任何频道功能',
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

export default ChannelFeaturesModal;
