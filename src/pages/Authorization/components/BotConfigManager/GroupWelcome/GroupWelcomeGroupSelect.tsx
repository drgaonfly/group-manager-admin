import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import { request } from '@umijs/max';

const { Option } = Select;

interface GroupWelcomeGroupSelectProps {
  botId: string;
  /** 编辑模式下传入当前配置 ID，避免把自己的群组禁用 */
  currentWelcomeId?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const GroupWelcomeGroupSelect: React.FC<GroupWelcomeGroupSelectProps> = ({
  botId,
  currentWelcomeId,
  value,
  onChange,
}) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [configuredGroupIds, setConfiguredGroupIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!botId) return;
    setLoading(true);

    Promise.all([
      request('/groups/getByBotId', { method: 'GET', params: { botId } }),
      request('/group-welcomes', { method: 'GET', params: { botId, pageSize: 200 } }),
    ])
      .then(([groupsRes, welcomesRes]) => {
        if (groupsRes.success) setGroups(groupsRes.data || []);

        if (welcomesRes.success) {
          const all: any[] = welcomesRes.data || [];
          // 编辑模式排除自身，避免误禁用当前正在编辑的群组
          const others = currentWelcomeId ? all.filter((w) => w._id !== currentWelcomeId) : all;
          setConfiguredGroupIds(new Set(others.map((w) => String(w.group?._id ?? w.group))));
        }
      })
      .catch((err) => console.error('加载群组数据失败:', err))
      .finally(() => setLoading(false));
  }, [botId, currentWelcomeId]);

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
        {groups.map((group) => {
          const groupId = String(group._id);
          const isConfigured = configuredGroupIds.has(groupId);

          return (
            <Option key={groupId} value={groupId} disabled={isConfigured}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>
                  {group.title}
                  {group.username && ` (@${group.username})`}
                </span>
                {isConfigured && <span style={{ color: '#ff4d4f', fontSize: '12px' }}>已配置</span>}
              </div>
            </Option>
          );
        })}
      </Select>
    </Form.Item>
  );
};

export default GroupWelcomeGroupSelect;
