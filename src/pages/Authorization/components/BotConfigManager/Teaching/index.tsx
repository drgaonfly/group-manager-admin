import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Empty, Button, message, Popconfirm } from 'antd';
import { useIntl } from '@umijs/max';
import dayjs from 'dayjs';
import { queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';

interface TeachingTabProps {
  currentRow: any;
}

const TeachingTab: React.FC<TeachingTabProps> = ({ currentRow }) => {
  const intl = useIntl();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTeachers = async () => {
    if (!currentRow?._id) return;
    try {
      setLoading(true);
      const res = await queryList('/teachers', { botId: currentRow._id });
      if (res?.success) {
        setTeachers(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      message.error('获取老师列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setLoading(true);
      const res = await updateItem(`/teachers/${id}/approve`, {});
      if ((res as any)?.success || (res as any)?.data) {
        message.success('已通过审核');
        fetchTeachers();
      }
    } catch (error) {
      console.error('Failed to approve teacher:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setLoading(true);
      const res = await updateItem(`/teachers/${id}/reject`, { remark: '未通过审核' });
      if ((res as any)?.success || (res as any)?.data) {
        message.success('已拒绝申请');
        fetchTeachers();
      }
    } catch (error) {
      console.error('Failed to reject teacher:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const res = await removeItem(`/teachers/${id}`);
      if ((res as any)?.success || (res as any)?.data) {
        message.success('操作成功');
        fetchTeachers();
      }
    } catch (error) {
      console.error('Failed to delete teacher:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [currentRow?._id]);

  const columns = [
    {
      title: intl.formatMessage({ id: 'teacher' }),
      dataIndex: 'botUser',
      key: 'botUser',
      render: (botUser: any) => {
        if (!botUser) return '未知';
        const name = botUser.userName
          ? `@${botUser.userName}`
          : `${botUser.firstName || ''} ${botUser.lastName || ''}`.trim();
        return name || '未知用户';
      },
    },
    {
      title: intl.formatMessage({ id: 'contact' }),
      dataIndex: 'contactLink',
      key: 'contactLink',
      render: (link: string) =>
        link ? (
          <a href={link} target="_blank" rel="noreferrer">
            {link}
          </a>
        ) : (
          '-'
        ),
    },
    {
      title: intl.formatMessage({ id: 'isAvailable' }),
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      render: (available: boolean) => (
        <Tag color={available ? 'green' : 'red'}>{available ? '可预约' : '忙碌'}</Tag>
      ),
    },
    {
      title: intl.formatMessage({ id: 'reviews' }),
      dataIndex: 'reviews',
      key: 'reviewsCount',
      render: (reviews: any[]) => reviews?.length || 0,
    },
    {
      title: intl.formatMessage({ id: 'createdAt' }),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: intl.formatMessage({ id: 'status' }),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let text = status;
        if (status === 'approved') {
          color = 'success';
          text = '已通过';
        } else if (status === 'rejected') {
          color = 'error';
          text = '已拒绝';
        } else if (status === 'pending') {
          color = 'processing';
          text = '待审核';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: intl.formatMessage({ id: 'options' }),
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <>
              <Button type="link" size="small" onClick={() => handleApprove(record._id)}>
                通过
              </Button>
              <Button type="link" danger size="small" onClick={() => handleReject(record._id)}>
                拒绝
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Popconfirm
              title="确定要取消该老师的认证吗？"
              onConfirm={() => handleDelete(record._id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger size="small">
                取消认证
              </Button>
            </Popconfirm>
          )}
          {record.status === 'rejected' && (
            <Popconfirm
              title="确定要删除此条拒绝记录吗？"
              onConfirm={() => handleDelete(record._id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger size="small">
                删除记录
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card title="认证老师管理" size="small">
      <Table
        dataSource={teachers}
        columns={columns}
        rowKey="_id"
        size="small"
        loading={loading}
        locale={{ emptyText: <Empty description="暂无老师数据" /> }}
      />
    </Card>
  );
};

export default TeachingTab;
