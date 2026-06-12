import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import { request } from '@umijs/max';

const { Option } = Select;

interface SpeechGroupSelectProps {
  botId: string;
  /** 编辑模式下传入当前配置 ID，避免把自己的群组禁用 */
  currentConfigId?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const SpeechGroupSelect: React.FC<SpeechGroupSelectProps> = ({
  botId,
  currentConfigId,
  value,
  onChange,
}) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [existingConfigs, setExistingConfigs] = useState<any[]>([]);

  useEffect(() => {
    if (!botId) return;
    setLoading(true);

    Promise.all([
      request('/groups/getByBotId', { method: 'GET', params: { botId } }),
      request('/speech-configs', {
        method: 'GET',
        params: { botId, current: 1, pageSize: 200 },
      }),
    ])
      .then(([groupsRes, configsRes]) => {
        if (groupsRes.success) setGroups(groupsRes.data || []);
        if (configsRes.success) {
          const all: any[] = configsRes.data || [];
          setExistingConfigs(currentConfigId ? all.filter((c) => c._id !== currentConfigId) : all);
        }
      })
      .catch((err) => console.error('加载数据失败:', err))
      .finally(() => setLoading(false));
  }, [botId, currentConfigId]);

  return (
    <Form.Item name="groupId" label="群组" rules={[{ required: true, message: '请选择群组' }]}>
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
          const existing = existingConfigs.find((c) => String(c.group?._id || c.group) === groupId);
          return (
            <Option key={groupId} value={groupId} disabled={!!existing}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>
                  {group.title}
                  {group.username && ` (@${group.username})`}
                </span>
                {existing && <span style={{ color: '#ff4d4f', fontSize: 12 }}>已配置</span>}
              </div>
            </Option>
          );
        })}
      </Select>
    </Form.Item>
  );
};

export default SpeechGroupSelect;
