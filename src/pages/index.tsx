import React, { useEffect, useState } from 'react';
import { useParams, history, useIntl, useModel } from '@umijs/max';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Badge, Button, Card, Col, Layout, Row, Skeleton, Space, Tag, message } from 'antd';
import { ArrowLeftOutlined, RobotOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons';
import { simpleGet } from '@/services/ant-design-pro/api';
import GroupFeaturesModal from '@/pages/Authorization/components/BotConfigManager/GroupFeaturesModal';

const { Header, Content } = Layout;

const BotDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;

  const [bot, setBot] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groupFeaturesOpen, setGroupFeaturesOpen] = useState(false);

  const loadBot = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res: any = await simpleGet(`/bots/${id}`);
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

  const groups: any[] = (bot?.groups || []).filter((g: any) => g.type !== 'channel');

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
      title: intl.formatMessage({ id: 'isOnline', defaultMessage: '状态' }),
      dataIndex: 'isOnline',
      width: 90,
      render: (isOnline: any) => (
        <Badge
          status={isOnline ? 'success' : 'default'}
          text={
            isOnline
              ? intl.formatMessage({ id: 'platform.online', defaultMessage: '在线' })
              : intl.formatMessage({ id: 'platform.offline', defaultMessage: '离线' })
          }
        />
      ),
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
            setSelectedGroup(record);
            setGroupFeaturesOpen(true);
          }}
        >
          {intl.formatMessage({ id: 'manage', defaultMessage: '管理' })}
        </Button>,
      ],
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f6fa' }}>
      {/* 顶部导航栏 */}
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => history.back()}
          style={{ fontWeight: 500 }}
        >
          {intl.formatMessage({ id: 'back', defaultMessage: '返回' })}
        </Button>
        <div style={{ width: 1, height: 20, background: '#e8e8e8' }} />
        <RobotOutlined style={{ color: '#1677ff', fontSize: 18 }} />
        <span style={{ fontSize: 16, fontWeight: 600, color: '#222' }}>
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
      </Header>

      <Content style={{ padding: '24px', width: '100%' }}>
        {loading ? (
          <Card>
            <Skeleton active paragraph={{ rows: 5 }} />
          </Card>
        ) : !bot ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
              {intl.formatMessage({ id: 'bot_not_found', defaultMessage: '机器人不存在' })}
            </div>
          </Card>
        ) : (
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            {/* 统计卡片 */}
            <Row gutter={[12, 12]}>
              {[
                {
                  label: intl.formatMessage({ id: 'groups', defaultMessage: '群组数' }),
                  value: groups.length,
                  icon: <TeamOutlined />,
                  color: '#1677ff',
                  bg: '#e6f4ff',
                },
                {
                  label: intl.formatMessage({ id: 'user_count', defaultMessage: '用户数' }),
                  value: bot.botUserConfigs?.length ?? 0,
                  icon: <TeamOutlined />,
                  color: '#52c41a',
                  bg: '#f6ffed',
                },
              ].map((s) => (
                <Col xs={12} sm={6} key={s.label}>
                  <div
                    style={{
                      background: s.bg,
                      border: `1px solid ${s.color}22`,
                      borderRadius: 8,
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: `${s.color}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        color: s.color,
                        flexShrink: 0,
                      }}
                    >
                      {s.icon}
                    </div>
                    <div>
                      <div
                        style={{ fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1.2 }}
                      >
                        {s.value}
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{s.label}</div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>

            {/* 群组列表 */}
            <Card
              title={
                <Space>
                  <TeamOutlined style={{ color: '#1677ff' }} />
                  {intl.formatMessage({ id: 'group_list', defaultMessage: '群组列表' })}
                  <Tag color="blue">{groups.length}</Tag>
                </Space>
              }
            >
              <ProTable<any>
                rowKey="_id"
                dataSource={groups}
                columns={groupColumns}
                search={false}
                pagination={{ pageSize: 20 }}
                toolBarRender={false}
                size="middle"
                scroll={{ x: 'max-content' }}
                locale={{
                  emptyText: (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                      {intl.formatMessage({ id: 'no_groups', defaultMessage: '该机器人暂无群组' })}
                    </div>
                  ),
                }}
              />
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
    </Layout>
  );
};

export default BotDetail;
