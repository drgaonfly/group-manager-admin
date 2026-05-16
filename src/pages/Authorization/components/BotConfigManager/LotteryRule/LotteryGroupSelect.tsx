import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import { request } from '@umijs/max';

const { Option } = Select;

interface LotteryGroupSelectProps {
  botId: string;
  /** 编辑模式下传入当前抽奖 ID，避免把自己的群组也禁用 */
  currentLotteryId?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const LotteryGroupSelect: React.FC<LotteryGroupSelectProps> = ({
  botId,
  currentLotteryId,
  value,
  onChange,
}) => {
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
            // 编辑模式下排除自身，避免自己的群组被禁用
            const all: any[] = lotteriesRes.data || [];
            setOngoingLotteries(
              currentLotteryId ? all.filter((l) => l._id !== currentLotteryId) : all,
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
  }, [botId, currentLotteryId]);

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
          // 统一转为字符串比较，避免 ObjectId vs string 类型不一致
          const groupId = String(group._id);
          const ongoingLottery = ongoingLotteries.find(
            (lottery) => String(lottery.group?._id) === groupId,
          );
          const hasOngoingLottery = !!ongoingLottery;

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
