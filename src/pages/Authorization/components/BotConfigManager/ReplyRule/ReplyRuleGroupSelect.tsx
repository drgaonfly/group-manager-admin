import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import { request } from '@umijs/max';

const { Option } = Select;

interface ReplyRuleGroupSelectProps {
  botId: string;
  value?: string;
  onChange?: (value: string) => void;
}

const ReplyRuleGroupSelect: React.FC<ReplyRuleGroupSelectProps> = ({ botId, value, onChange }) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!botId) {
      setGroups([]);
      return;
    }
    setLoading(true);
    request('/groups/getByBotId', { method: 'GET', params: { botId } })
      .then((res) => {
        if (res.success) setGroups(res.data || []);
      })
      .catch((err) => console.error('加载群组失败:', err))
      .finally(() => setLoading(false));
  }, [botId]);

  return (
    <Form.Item
      name="group"
      label="适用群组"
      rules={[{ required: true, message: '请选择适用群组' }]}
    >
      <Select
        placeholder="请选择群组"
        loading={loading}
        showSearch
        optionFilterProp="children"
        value={value}
        onChange={onChange}
      >
        {groups.map((group) => (
          <Option key={String(group._id)} value={String(group._id)}>
            {group.title}
            {group.username ? ` (@${group.username})` : ''}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default ReplyRuleGroupSelect;
