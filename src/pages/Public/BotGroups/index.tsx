import React, { useEffect, useState } from 'react';
import { useParams } from '@umijs/max';
import { Card, List, Tag, Typography, Spin, Result, Avatar } from 'antd';
import { TeamOutlined, RobotOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';

const { Title, Text } = Typography;

interface Group {
  _id: string;
  title: string;
  username?: string;
  type: string;
}

interface BotInfo {
  _id: string;
  botName: string;
  userName: string;
}

interface BotUserInfo {
  _id: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
}

const BotGroupsPage: React.FC = () => {
  const { id: botId, username } = useParams<{ id: string; username: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bot, setBot] = useState<BotInfo | null>(null);
  const [botUser, setBotUser] = useState<BotUserInfo | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (!botId || !username) return;

    setLoading(true);
    request(`/public/bots/${botId}/${encodeURIComponent(username)}`)
      .then((res: any) => {
        if (res?.success) {
          setBot(res.data.bot);
          setBotUser(res.data.botUser);
          setGroups(res.data.groups || []);
        } else {
          setError('加载失败');
        }
      })
      .catch((e: any) => {
        setError(e?.response?.data?.message || '加载失败');
      })
      .finally(() => setLoading(false));
  }, [botId, username]);

  if (loading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Result status="404" title={error} />;
  }

  const displayName = botUser
    ? `${botUser.firstName || ''} ${botUser.lastName || ''}`.trim() || `@${botUser.userName}`
    : `@${username}`;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 16px' }}>
      {/* Bot 信息 */}
      <Card style={{ marginBottom: 24, textAlign: 'center' }}>
        <Avatar
          size={64}
          icon={<RobotOutlined />}
          style={{ backgroundColor: '#1677ff', marginBottom: 12 }}
        />
        <Title level={4} style={{ margin: 0 }}>
          {bot?.botName || `@${bot?.userName}`}
        </Title>
        <Text type="secondary">@{bot?.userName}</Text>
        <br />
        <Text style={{ marginTop: 8, display: 'block' }}>
          当前用户：<strong>{displayName}</strong>
        </Text>
      </Card>

      {/* 群组列表 */}
      <Card
        title={
          <span>
            <TeamOutlined style={{ marginRight: 8 }} />
            我参与的群组（{groups.length}）
          </span>
        }
      >
        {groups.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: '24px 0' }}>
            暂无群组，请先将机器人加入您管理的群组并设为管理员
          </div>
        ) : (
          <List
            dataSource={groups}
            renderItem={(group) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<TeamOutlined />} />}
                  title={group.title}
                  description={
                    <span>
                      {group.username && <Tag color="blue">@{group.username}</Tag>}
                      <Tag>{group.type}</Tag>
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default BotGroupsPage;
