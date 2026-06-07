import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import { request } from '@umijs/max';

const { Option } = Select;

interface CheckinRuleGroupSelectProps {
  botId: string;
  /** 编辑时传入当前规则 ID，避免本群被禁用 */
  currentRuleId?: string;
}

const CheckinRuleGroupSelect: React.FC<CheckinRuleGroupSelectProps> = ({
  botId,
  currentRuleId,
}) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [existingRules, setExistingRules] = useState<any[]>([]);

  useEffect(() => {
    if (!botId) return;
    setLoading(true);

    Promise.all([
      request('/groups/getByBotId', {
        method: 'GET',
        params: { botId },
      }),
      request('/checkin-rules', {
        method: 'GET',
        params: { botId, current: 1, pageSize: 200 },
      }),
    ])
      .then(([groupsRes, rulesRes]) => {
        if (groupsRes.success) setGroups(groupsRes.data || []);
        if (rulesRes.success) {
          const all: any[] = rulesRes.data || [];
          setExistingRules(currentRuleId ? all.filter((r) => r._id !== currentRuleId) : all);
        }
      })
      .catch((err) => console.error('加载数据失败:', err))
      .finally(() => setLoading(false));
  }, [botId, currentRuleId]);

  return (
    <Form.Item
      name="group"
      label="签到群组"
      extra="不选则作为默认规则，适用于该机器人所有未单独配置的群组"
    >
      <Select
        placeholder="不选则为默认规则（适用所有群）"
        loading={loading}
        showSearch
        allowClear
        optionFilterProp="children"
      >
        {groups.map((group) => {
          const groupId = String(group._id);
          const hasRule = existingRules.some((r) => String(r.group?._id) === groupId);

          return (
            <Option key={group._id} value={group._id} disabled={hasRule}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>
                  {group.title}
                  {group.username && ` (@${group.username})`}
                </span>
                {hasRule && <span style={{ color: '#ff4d4f', fontSize: '12px' }}>已配置</span>}
              </div>
            </Option>
          );
        })}
      </Select>
    </Form.Item>
  );
};

export default CheckinRuleGroupSelect;
