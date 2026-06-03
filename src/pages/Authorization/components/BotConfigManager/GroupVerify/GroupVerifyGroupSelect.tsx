import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import { request } from '@umijs/max';

const { Option } = Select;

interface GroupVerifyGroupSelectProps {
  botId: string;
  /** 编辑模式下传入当前验证配置 ID，避免自己的群组被禁用 */
  currentVerifyId?: string;
}

const GroupVerifyGroupSelect: React.FC<GroupVerifyGroupSelectProps> = ({
  botId,
  currentVerifyId,
}) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [existingVerifies, setExistingVerifies] = useState<any[]>([]);

  useEffect(() => {
    if (!botId) return;
    setLoading(true);

    Promise.all([
      request('/groups/getByBotId', {
        method: 'GET',
        params: { botId },
      }),
      request('/group-verifies', {
        method: 'GET',
        params: { botId, current: 1, pageSize: 200 },
      }),
    ])
      .then(([groupsRes, verifiesRes]) => {
        if (groupsRes.success) {
          setGroups(groupsRes.data || []);
        }
        if (verifiesRes.success) {
          const all: any[] = verifiesRes.data || [];
          // 编辑时排除自身，避免本群组被禁用
          setExistingVerifies(currentVerifyId ? all.filter((v) => v._id !== currentVerifyId) : all);
        }
      })
      .catch((err) => console.error('加载数据失败:', err))
      .finally(() => setLoading(false));
  }, [botId, currentVerifyId]);

  return (
    <Form.Item
      name="group"
      label="验证群组"
      rules={[{ required: true, message: '请选择验证群组' }]}
    >
      <Select placeholder="选择群组" loading={loading} showSearch optionFilterProp="children">
        {groups.map((group) => {
          const groupId = String(group._id);
          const existingVerify = existingVerifies.find((v) => String(v.group?._id) === groupId);
          const hasVerify = !!existingVerify;

          return (
            <Option key={group._id} value={group._id} disabled={hasVerify}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>
                  {group.title} {group.username && `(@${group.username})`}
                </span>
                {hasVerify && <span style={{ color: '#ff4d4f', fontSize: '12px' }}>已配置</span>}
              </div>
            </Option>
          );
        })}
      </Select>
    </Form.Item>
  );
};

export default GroupVerifyGroupSelect;
