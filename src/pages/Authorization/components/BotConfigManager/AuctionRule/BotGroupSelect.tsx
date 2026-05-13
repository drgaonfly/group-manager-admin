import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import { useIntl } from '@umijs/max';
import { request } from '@umijs/max';

const { Option } = Select;

interface BotGroupSelectProps {
  botId: string;
  value?: string;
  onChange?: (value: string) => void;
}

const BotGroupSelect: React.FC<BotGroupSelectProps> = ({ botId, value, onChange }) => {
  const intl = useIntl();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ongoingAuctions, setOngoingAuctions] = useState<any[]>([]);

  useEffect(() => {
    if (botId) {
      setLoading(true);

      // 同时获取群组列表和进行中的竞拍
      Promise.all([
        request('/groups/getByBotId', {
          method: 'GET',
          params: { botId },
        }),
        request('/auctions', {
          method: 'GET',
          params: {
            botId,
            status: 'ongoing',
            current: 1,
            pageSize: 100,
          },
        }),
      ])
        .then(([groupsRes, auctionsRes]) => {
          if (groupsRes.success) {
            setGroups(groupsRes.data || []);
          }
          if (auctionsRes.success) {
            setOngoingAuctions(auctionsRes.data || []);
          }
        })
        .catch((err) => {
          console.error('加载数据失败:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [botId]);

  return (
    <Form.Item
      name="group"
      label={intl.formatMessage({ id: 'group.title', defaultMessage: '竞拍群组' })}
      rules={[{ required: true, message: '请选择竞拍群组' }]}
    >
      <Select
        placeholder="选择群组"
        loading={loading}
        showSearch
        optionFilterProp="children"
        value={value}
        onChange={onChange}
      >
        {groups.map((group) => {
          const hasOngoingAuction = ongoingAuctions.some(
            (auction) => auction.group?._id === group._id,
          );
          const ongoingAuction = ongoingAuctions.find(
            (auction) => auction.group?._id === group._id,
          );

          return (
            <Option key={group._id} value={group._id} disabled={hasOngoingAuction}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>
                  {group.title} {group.username && `(@${group.username})`}
                </span>
                {hasOngoingAuction && (
                  <span style={{ color: '#ff4d4f', fontSize: '12px' }}>
                    进行中: {ongoingAuction?.title}
                  </span>
                )}
              </div>
            </Option>
          );
        })}
      </Select>
    </Form.Item>
  );
};

export default BotGroupSelect;
