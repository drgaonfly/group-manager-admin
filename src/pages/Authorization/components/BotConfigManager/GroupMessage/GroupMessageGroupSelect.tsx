import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import { request } from '@umijs/max';

const { Option } = Select;

interface GroupMessageGroupSelectProps {
  botId: string;
  /** 编辑模式下传入当前记录 ID，避免自己的群组被禁用 */
  currentMessageId?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const GroupMessageGroupSelect: React.FC<GroupMessageGroupSelectProps> = ({
  botId,
  currentMessageId,
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
      request('/group-messages', {
        method: 'GET',
        params: { botId, current: 1, pageSize: 200 },
      }),
    ])
      .then(([groupsRes, messagesRes]) => {
        if (groupsRes.success) {
          setGroups((groupsRes.data || []).filter((g: any) => g?.type !== 'channel'));
        }
        if (messagesRes.success) {
          const all: any[] = messagesRes.data || [];
          // 编辑时排除自身，避免本群组被禁用
          const others = currentMessageId ? all.filter((m) => m._id !== currentMessageId) : all;
          setConfiguredGroupIds(
            new Set(others.map((m) => String(m.group?._id ?? m.group)).filter(Boolean)),
          );
        }
      })
      .catch((err) => console.error('加载群组数据失败:', err))
      .finally(() => setLoading(false));
  }, [botId, currentMessageId]);

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
                  {group.username && (
                    <span style={{ color: '#999', marginLeft: 4 }}>@{group.username}</span>
                  )}
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

export default GroupMessageGroupSelect;
