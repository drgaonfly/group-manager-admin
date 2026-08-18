import React, { useState, useEffect } from 'react';
import { Button, message, Tag, Descriptions } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';
import NightModeForm from './Form';

/** UTC 分钟数 → 本地时间 "HH:mm" 展示 */
const minutesToLabel = (utcMinutes: number) => {
  const now = new Date();
  const d = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      Math.floor(utcMinutes / 60),
      utcMinutes % 60,
      0,
    ),
  );
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

interface Props {
  open: boolean;
  bot: any;
  group: any;
}

const NightModeContent: React.FC<Props> = ({ open, bot, group }) => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const fetchConfig = async () => {
    if (!bot?._id || !group?._id) return;
    setLoading(true);
    try {
      const res = await request('/night-modes', {
        method: 'GET',
        params: { botId: bot._id, groupId: group._id, current: 1, pageSize: 1 },
      });
      setConfig(res?.data?.[0] ?? null);
    } catch {
      message.error('获取夜间模式配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchConfig();
  }, [open, bot?._id, group?._id]);

  return (
    <>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<EditOutlined />}
          loading={loading}
          onClick={() => setFormOpen(true)}
        >
          {config ? '修改配置' : '新建配置'}
        </Button>
      </div>

      {config ? (
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="状态">
            <Tag color={config.isActive ? 'blue' : 'default'}>
              {config.isActive ? '启用' : '禁用'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="开始时间（UTC）">
            {typeof config.startAt === 'number' ? minutesToLabel(config.startAt) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="结束时间（UTC）">
            {typeof config.endAt === 'number' ? minutesToLabel(config.endAt) : '-'}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <div style={{ textAlign: 'center', color: '#999', padding: '32px 0' }}>
          该群组暂未配置夜间模式，点击「新建配置」开始设置
        </div>
      )}

      <NightModeForm
        visible={formOpen}
        record={config}
        bot={bot}
        group={group}
        onClose={(refresh) => {
          setFormOpen(false);
          if (refresh) fetchConfig();
        }}
      />
    </>
  );
};

export default NightModeContent;
