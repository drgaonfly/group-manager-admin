import React, { useEffect, useState } from 'react';
import { useParams, history, useIntl, useModel } from '@umijs/max';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Badge, Button, Card, Col, Layout, Row, Skeleton, Space, Tag, message } from 'antd';
import { ArrowLeftOutlined, RobotOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons';
import { simpleGet } from '@/services/ant-design-pro/api';
import GroupFeaturesModal from '@/pages/Authorization/components/BotConfigManager/GroupFeaturesModal';
import ChannelFeaturesModal from '@/pages/Authorization/components/BotConfigManager/ChannelFeaturesModal';

const { Header, Content } = Layout;

const BotDetail: React.FC = () => {
  const { id, username } = useParams<{ id: string; username?: string }>();
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;

  const [bot, setBot] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groupFeaturesOpen, setGroupFeaturesOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [channelFeaturesOpen, setChannelFeaturesOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'groups' | 'channels'>('groups');

  const loadBot = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // 有 username 时传给后端过滤群组（public bot 场景）
      const decodedUsername = username ? decodeURIComponent(username) : '';
      const res: any = await simpleGet(
        `/bots/${id}`,
        decodedUsername ? { username: decodedUsername } : undefined,
      );
      setBot(res?.data ?? res);
    } catch (err: any) {
      message.error(
        err?.response?.data?.message ??
          intl.formatMessage({ id: 'load_failed', defaultMessage: '加载失败' }),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBot();
  }, [id]);

  // 后端已按 username 过滤群组，直接用
  const allGroups: any[] = (bot?.groups || []).filter((g: any) => g.type !== 'channel');
  const allChannels: any[] = (bot?.groups || []).filter((g: any) => g.type === 'channel');
  const decodedUsername = username ? decodeURIComponent(username) : '';
  const groups = allGroups;
  const channels = allChannels;

  const groupColumns: ProColumns<any>[] = [
    {
      title: intl.formatMessage({ id: 'title', defaultMessage: '群名' }),
      dataIndex: 'title',
      width: 180,
      ellipsis: true,
    },
    {
      title: intl.formatMessage({ id: 'username', defaultMessage: '群组用户名' }),
      dataIndex: 'username',
      width: 140,
      render: (username: any) =>
        username ? <Tag color="blue">@{username}</Tag> : <span style={{ color: '#bbb' }}>-</span>,
    },
    {
      title: intl.formatMessage({ id: 'type', defaultMessage: '类型' }),
      dataIndex: 'type',
      width: 100,
      render: (type: any) => <Tag>{type}</Tag>,
    },
    {
      title: intl.formatMessage({ id: 'members', defaultMessage: '成员数' }),
      dataIndex: 'botUsers',
      width: 90,
      render: (botUsers: any) => botUsers?.length ?? 0,
    },
    {
      title: intl.formatMessage({ id: 'pages.searchTable.titleOption', defaultMessage: '操作' }),
      valueType: 'option',
      width: 100,
      fixed: 'right',
      render: (_: any, record: any) => [
        <Button
          key="manage"
          type="primary"
          size="small"
          icon={<SettingOutlined />}
          onClick={() => {
            setSelectedChannel(record);
            setChannelFeaturesOpen(true);
          }}
        >
          {intl.formatMessage({ id: 'manage', defaultMessage: '管理' })}
        </Button>,
      ],
    },
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <Header className="bg-white px-4 sm:px-6 flex items-center gap-3 shadow-sm sticky top-0 z-100">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => history.back()}
          className="font-medium"
        >
          {intl.formatMessage({ id: 'back', defaultMessage: '返回' })}
        </Button>
        <div className="w-px h-5 bg-gray-200" />
        <RobotOutlined className="text-blue-500 text-lg" />
        <span className="text-base sm:text-lg font-semibold text-gray-800 truncate flex-1">
          {loading
            ? intl.formatMessage({ id: 'bot_detail', defaultMessage: '机器人详情' })
            : bot
            ? `${bot.botName || bot.userName}`
            : intl.formatMessage({ id: 'bot_not_found', defaultMessage: '机器人不存在' })}
        </span>
        {bot && (
          <Badge
            status={bot.isOnline ? 'success' : 'default'}
            text={
              bot.isOnline
                ? intl.formatMessage({ id: 'platform.online', defaultMessage: '在线' })
                : intl.formatMessage({ id: 'platform.offline', defaultMessage: '离线' })
            }
          />
        )}
        {username && (
          <Tag color="geekblue" style={{ marginLeft: 8 }}>
            @{decodedUsername}
          </Tag>
        )}
      </Header>

      <Content className="p-4 sm:p-6 w-full">
        {loading ? (
          <Card>
            <Skeleton active paragraph={{ rows: 5 }} />
          </Card>
        ) : !bot ? (
          <Card>
            <div className="text-center py-20 text-gray-400">
              {intl.formatMessage({ id: 'bot_not_found', defaultMessage: '机器人不存在' })}
            </div>
          </Card>
        ) : (
          <Space direction="vertical" size={8} className="w-full">
            {/* 统计卡片 */}
            <Row gutter={[12, 12]}>
              {[
                {
                  key: 'groups',
                  label: intl.formatMessage({ id: 'groups', defaultMessage: '群组数' }),
                  value: groups.length,
                  icon: <TeamOutlined />,
                  color: '#1677ff',
                  bg: activeTab === 'groups' ? '#bae0ff' : '#e6f4ff',
                  borderColor: activeTab === 'groups' ? '#1677ff' : '#1677ff22',
                },
                {
                  key: 'channels',
                  label: intl.formatMessage({ id: 'channels', defaultMessage: '频道数' }),
                  value: channels.length,
                  icon: <TeamOutlined />,
                  color: '#722ed1',
                  bg: activeTab === 'channels' ? '#d8adf0' : '#f9f0ff',
                  borderColor: activeTab === 'channels' ? '#722ed1' : '#722ed122',
                },
                {
                  key: 'users',
                  label: intl.formatMessage({ id: 'user_count', defaultMessage: '用户数' }),
                  value: bot.botUserConfigs?.length ?? 0,
                  icon: <TeamOutlined />,
                  color: '#52c41a',
                  bg: '#f6ffed',
                  borderColor: '#52c41a22',
                },
              ].map((s) => (
                <Col xs={12} sm={6} key={s.key}>
                  <div
                    className="rounded-lg p-3.5 sm:p-4 flex items-center gap-2.5 sm:gap-3 cursor-pointer transition-all hover:shadow-md"
                    style={{ background: s.bg, border: `1px solid ${s.borderColor}` }}
                    onClick={() => {
                      if (s.key === 'groups') setActiveTab('groups');
                      if (s.key === 'channels') setActiveTab('channels');
                    }}
                  >
                    <div
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
                      style={{ background: `${s.color}18`, color: s.color }}
                    >
                      {s.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-xl sm:text-2xl font-bold leading-tight"
                        style={{ color: s.color }}
                      >
                        {s.value}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>

            {/* 群组/频道列表 */}
            <Card
              title={
                <Space>
                  <TeamOutlined
                    className={activeTab === 'groups' ? 'text-blue-500' : 'text-purple-500'}
                  />
                  {activeTab === 'groups'
                    ? intl.formatMessage({ id: 'group_list', defaultMessage: '群组列表' })
                    : intl.formatMessage({ id: 'channel_list', defaultMessage: '频道列表' })}
                  <Tag color={activeTab === 'groups' ? 'blue' : 'purple'}>
                    {activeTab === 'groups' ? groups.length : channels.length}
                  </Tag>
                </Space>
              }
              className="overflow-hidden"
            >
              <div className="overflow-x-auto">
                <ProTable<any>
                  rowKey="_id"
                  dataSource={activeTab === 'groups' ? groups : channels}
                  columns={groupColumns}
                  search={false}
                  pagination={{ pageSize: 20 }}
                  toolBarRender={false}
                  size="middle"
                  scroll={{ x: 'max-content' }}
                  locale={{
                    emptyText: (
                      <div className="text-center py-10 text-gray-400">
                        {activeTab === 'groups'
                          ? intl.formatMessage({
                              id: 'no_groups',
                              defaultMessage: '该机器人暂无群组',
                            })
                          : intl.formatMessage({
                              id: 'no_channels',
                              defaultMessage: '该机器人暂无频道',
                            })}
                      </div>
                    ),
                  }}
                />
              </div>
            </Card>
          </Space>
        )}
      </Content>

      <GroupFeaturesModal
        open={groupFeaturesOpen}
        onClose={() => {
          setGroupFeaturesOpen(false);
          setSelectedGroup(null);
        }}
        bot={bot}
        group={selectedGroup}
        currentUser={currentUser}
      />

      <ChannelFeaturesModal
        open={channelFeaturesOpen}
        onClose={() => {
          setChannelFeaturesOpen(false);
          setSelectedChannel(null);
        }}
        bot={bot}
        channel={selectedChannel}
        currentUser={currentUser}
      />
    </Layout>
  );
};

export default BotDetail;
