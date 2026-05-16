import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import { request } from '@umijs/max';

const { Option } = Select;

interface LotteryGroupSelectProps {
  botId: string;
  value?: string;
  onChange?: (value: string) => void;
}

const LotteryGroupSelect: React.FC<LotteryGroupSelectProps> = ({ botId, value, onChange }) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ongoingLotteries, setOngoingLotteries] = useState<any[]>([]);

  useEffect(() => {
    if (botId) {
      setLoading(true);

      Promise.all([
        request('/groups/getByBotId', {
          method: 'GET',
          params: { botId },
        }),
        request('/lotteries', {
          method: 'GET',
          params: {
            botId,
            status: 'ongoing',
            current: 1,
            pageSize: 100,
          },
        }),
      ])
        .then(([groupsRes, lotteriesRes]) => {
          if (groupsRes.success) {
            setGroups(groupsRes.data || []);
          }
          if (lotteriesRes.success) {
            setOngoingLotteries(lotteriesRes.data || []);
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
      label="抽奖群组"
      rules={[{ required: true, message: '请选择抽奖群组' }]}
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
          const hasOngoingLottery = ongoingLotteries.some(
            (lottery) => lottery.group?._id === group._id,
          );
          const ongoingLottery = ongoingLotteries.find(
            (lottery) => lottery.group?._id === group._id,
          );

          return (
            <Option key={group._id} value={group._id} disabled={hasOngoingLottery}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>
                  {group.title} {group.username && `(@${group.username})`}
                </span>
                {hasOngoingLottery && (
                  <span style={{ color: '#ff4d4f', fontSize: '12px' }}>
                    进行中: {ongoingLottery?.title}
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

export default LotteryGroupSelect;
