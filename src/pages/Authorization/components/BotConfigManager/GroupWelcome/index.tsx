import React, { useState, useEffect } from 'react';
import { Button, Card, Table, Space, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from '@umijs/max';
import { request } from '@umijs/max';
import GroupWelcomeForm from './GroupWelcomeForm';

interface GroupWelcomeRecord {
  _id: string;
  group?: { _id: string; title: string; username?: string };
  contents: string[];
  medias: string[];
  menus: any[];
  deleteAfterSeconds: number;
  pinNewMember: boolean;
  createdAt: string;
}

interface GroupWelcomeTabProps {
  currentRow: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const GroupWelcomeTab: React.FC<GroupWelcomeTabProps> = ({ currentRow }) => {
  const intl = useIntl();
  const [data, setData] = useState<GroupWelcomeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GroupWelcomeRecord | null>(null);

  const fetchData = async () => {
    if (!currentRow?._id) return;
    setLoading(true);
    try {
      const res = await request('/group-welcomes', {
        method: 'GET',
        params: { botId: currentRow._id, pageSize: 200 },
      });
      if (res.success) setData(res.data || []);
    } catch (e) {
      message.error('获取群欢迎配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentRow?._id) fetchData();
  }, [currentRow]);

  const handleCreate = () => {
    setEditingRecord(null);
    setFormOpen(true);
  };

  const handleEdit = (record: GroupWelcomeRecord) => {
    setEditingRecord(record);
    setFormOpen(true);
  };

  const handleDelete = async (record: GroupWelcomeRecord) => {
    try {
      await request(`/group-welcomes/${record._id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchData();
    } catch (e) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: intl.formatMessage({ id: 'group', defaultMessage: '群组' }),
      dataIndex: 'group',
      key: 'group',
      render: (group: any) =>
        group ? (
          <span>
            {group.title}
            {group.username && (
              <span style={{ color: '#999', marginLeft: 4 }}>@{group.username}</span>
            )}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: intl.formatMessage({ id: 'welcome_message', defaultMessage: '欢迎消息' }),
      dataIndex: 'contents',
      key: 'contents',
      ellipsis: true,
      render: (contents: string[]) =>
        contents?.length ? (
          <span style={{ color: '#333' }}>{contents[0].replace(/<[^>]+>/g, '').slice(0, 40)}…</span>
        ) : (
          <span style={{ color: '#bbb' }}>默认消息</span>
        ),
    },
    {
      title: intl.formatMessage({ id: 'welcome_medias', defaultMessage: '媒体' }),
      dataIndex: 'medias',
      key: 'medias',
      render: (medias: string[]) =>
        medias?.length ? <Tag color="blue">{medias.length} 个</Tag> : '-',
    },
    {
      title: intl.formatMessage({ id: 'delete_after_seconds', defaultMessage: '阅后即焚' }),
      dataIndex: 'deleteAfterSeconds',
      key: 'deleteAfterSeconds',
      render: (v: number) => (v > 0 ? `${v}秒` : <span style={{ color: '#bbb' }}>关闭</span>),
    },
    {
      title: intl.formatMessage({ id: 'pin_new_member', defaultMessage: '置顶新成员' }),
      dataIndex: 'pinNewMember',
      key: 'pinNewMember',
      render: (v: boolean) => (v ? <Tag color="green">开启</Tag> : <Tag>关闭</Tag>),
    },
    {
      title: intl.formatMessage({ id: 'pages.searchTable.titleOption', defaultMessage: '操作' }),
      key: 'action',
      render: (_: any, record: GroupWelcomeRecord) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>
            <FormattedMessage id="edit" defaultMessage="编辑" />
          </Button>
          <Popconfirm
            title={intl.formatMessage({
              id: 'confirm_delete',
              defaultMessage: '确定删除该群欢迎配置吗？',
            })}
            onConfirm={() => handleDelete(record)}
            okText={intl.formatMessage({ id: 'yes', defaultMessage: '确定' })}
            cancelText={intl.formatMessage({ id: 'no', defaultMessage: '取消' })}
          >
            <Button icon={<DeleteOutlined />} size="small" danger>
              <FormattedMessage id="delete" defaultMessage="删除" />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={intl.formatMessage({ id: 'group_welcome', defaultMessage: '群欢迎' })}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            <FormattedMessage id="configure_group_welcome" defaultMessage="新建群欢迎" />
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          locale={{
            emptyText: (
              <span style={{ color: '#999' }}>
                <FormattedMessage
                  id="group_welcome_not_configured"
                  defaultMessage="暂无群欢迎配置，点击右上角新建"
                />
              </span>
            ),
          }}
        />
      </Card>

      <GroupWelcomeForm
        open={formOpen}
        onCancel={setFormOpen}
        botId={currentRow?._id}
        currentRow={editingRecord}
        onSuccess={() => {
          setFormOpen(false);
          fetchData();
        }}
      />
    </div>
  );
};

export default GroupWelcomeTab;
