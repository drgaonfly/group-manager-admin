import React, { useState, useEffect } from 'react';
import { Form, Select, Tag, Tooltip, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';

interface GroupOption {
  _id: string;
  title: string;
  username?: string;
  /** undefined = 检查中，true = 是管理员，false = 非管理员 */
  isAdmin?: boolean;
  adminReason?: string;
}

interface AdRemovalGroupSelectProps {
  botId: string;
}

/**
 * 群组单选 + 实时管理员校验：
 * 群组列表加载完成后立刻批量检查所有群的管理员状态。
 * 非管理员的群组自动 disabled，打开下拉就能直接看到状态。
 */
const AdRemovalGroupSelect: React.FC<AdRemovalGroupSelectProps> = ({ botId }) => {
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!botId) return;

    let cancelled = false;
    setLoading(true);
    setGroups([]);

    (async () => {
      try {
        // 1. 拉群组列表
        const listRes: any = await request('/groups/getByBotId', {
          method: 'GET',
          params: { botId },
        });
        if (cancelled) return;

        const rawGroups: GroupOption[] = (listRes?.data || []).map((g: any) => ({
          _id: g._id,
          title: g.title,
          username: g.username,
        }));

        if (rawGroups.length === 0) {
          setGroups([]);
          setLoading(false);
          return;
        }

        // 先渲染列表，让用户看到内容（右侧转圈表示检查中）
        setGroups(rawGroups.map((g) => ({ ...g, isAdmin: undefined })));

        // 2. 批量检查所有群的管理员状态
        const checkRes: any = await request('/groups/checkBotAdmin', {
          method: 'GET',
          params: {
            botId,
            groupIds: rawGroups.map((g) => g._id).join(','),
          },
        });
        if (cancelled) return;

        if (checkRes?.success && Array.isArray(checkRes.data)) {
          const resultMap = new Map<string, { isAdmin: boolean; reason?: string }>(
            checkRes.data.map((item: any) => [item.groupId, item]),
          );
          setGroups(
            rawGroups.map((g) => {
              const r = resultMap.get(g._id);
              return r
                ? { ...g, isAdmin: r.isAdmin, adminReason: r.reason }
                : { ...g, isAdmin: undefined };
            }),
          );
        }
      } catch (err) {
        console.error('群组加载/检查失败:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [botId]);

  const renderStatus = (g: GroupOption) => {
    if (loading || g.isAdmin === undefined) {
      return <Spin indicator={<LoadingOutlined style={{ fontSize: 11 }} />} />;
    }
    if (g.isAdmin) {
      return (
        <Tooltip title="机器人是该群管理员，可正常使用">
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
        </Tooltip>
      );
    }
    return (
      <Tooltip title={g.adminReason || '机器人不是该群管理员，请先在群内设为管理员'}>
        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      </Tooltip>
    );
  };

  const allNonAdmin = !loading && groups.length > 0 && groups.every((g) => g.isAdmin === false);

  return (
    <Form.Item
      name="group"
      label="适用群组"
      tooltip="不选则对该 Bot 下所有群组生效；选择后仅在该群组中启用此规则"
      extra={
        !loading && groups.length === 0
          ? '该 Bot 暂无关联群组'
          : allNonAdmin
          ? '所有群组中机器人均非管理员，请先将机器人设为管理员'
          : undefined
      }
    >
      <Select
        placeholder={loading ? '正在检查群组权限…' : '不选 = 全部群组生效'}
        loading={loading}
        allowClear
        showSearch
        optionFilterProp="label"
        optionLabelProp="label"
      >
        {groups.map((g) => {
          const label = g.title + (g.username ? ` (@${g.username})` : '');
          const disabled = g.isAdmin === false;

          return (
            <Select.Option key={g._id} value={g._id} label={label} disabled={disabled}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ color: disabled ? '#bfbfbf' : undefined, flex: 1 }}>{label}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  {disabled && (
                    <Tag color="error" style={{ marginRight: 0, fontSize: 11, lineHeight: '18px' }}>
                      非管理员
                    </Tag>
                  )}
                  {renderStatus(g)}
                </span>
              </div>
            </Select.Option>
          );
        })}
      </Select>
    </Form.Item>
  );
};

export default AdRemovalGroupSelect;
