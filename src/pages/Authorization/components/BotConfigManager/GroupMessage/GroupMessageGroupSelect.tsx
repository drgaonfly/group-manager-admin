import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import { request } from '@umijs/max';

const { Option } = Select;

interface GroupMessageGroupSelectProps {
  botId: string;
  value?: string;
  onChange?: (value: string) => void;
}

const GroupMessageGroupSelect: React.FC<GroupMessageGroupSelectProps> = ({
  botId,
  value,
  onChange,
}) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!botId) return;
    setLoading(true);
    request('/groups/getByBotId', { method: 'GET', params: { botId } })
      .then((res: any) => {
        if (res.success) {
          // 过滤掉频道类型，只显示群组
          setGroups((res.data || []).filter((g: any) => g?.type !== 'channel'));
        }
      })
      .catch((err) => console.error('加载群组失败:', err))
      .finally(() => setLoading(false));
  }, [botId]);

  return (
    <Form.Item name="group" label="群组" rules={[{ required: true, message: '请选择群组' }]}>
      <Select
        placeholder="选择群组"
        loading={loading}
        showSearch
        optionFilterProp="children"
        value={value}
        onChange={onChange}
      >
        {groups.map((group) => (
          <Option key={String(group._id)} value={String(group._id)}>
            {group.title}
            {group.username && (
              <span style={{ color: '#999', marginLeft: 4 }}>@{group.username}</span>
            )}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default GroupMessageGroupSelect;
