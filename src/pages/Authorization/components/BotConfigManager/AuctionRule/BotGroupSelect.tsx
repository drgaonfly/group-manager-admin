import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import { useIntl } from '@umijs/max';
import { request } from '@umijs/max';

const { Option } = Select;

interface BotGroupSelectProps {
  botId: string;
  /** 编辑模式下传入当前竞拍 ID，避免把自己的群组也禁用 */
  currentAuctionId?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const BotGroupSelect: React.FC<BotGroupSelectProps> = ({
  botId,
  currentAuctionId,
  value,
  onChange,
}) => {
  const intl = useIntl();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ongoingAuctions, setOngoingAuctions] = useState<any[]>([]);

  useEffect(() => {
    if (botId) {
      setLoading(true);

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
            // 编辑模式下排除自身，避免自己的群组被禁用
            const all: any[] = auctionsRes.data || [];
            setOngoingAuctions(
              currentAuctionId ? all.filter((a) => a._id !== currentAuctionId) : all,
            );
          }
        })
        .catch((err) => {
          console.error('加载数据失败:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [botId, currentAuctionId]);

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
          // 统一转为字符串比较，避免 ObjectId vs string 类型不一致
          const groupId = String(group._id);
          const ongoingAuction = ongoingAuctions.find(
            (auction) => String(auction.group?._id) === groupId,
          );
          const hasOngoingAuction = !!ongoingAuction;

          return (
            <Option key={String(group._id)} value={String(group._id)} disabled={hasOngoingAuction}>
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
