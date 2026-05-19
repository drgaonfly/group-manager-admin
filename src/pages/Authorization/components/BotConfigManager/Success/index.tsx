import React, { useState, useEffect } from 'react';
import { Button, Card, Table, Space, Popconfirm, message, Tag, Empty } from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { queryList, removeItem } from '@/services/ant-design-pro/api';
import dayjs from 'dayjs';

interface SuccessTabProps {
  currentRow: any;
}

const SuccessTab: React.FC<SuccessTabProps> = ({ currentRow }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const pageSize = 20;

  const fetchData = async (page = 1) => {
    if (!currentRow?._id) return;
    setLoading(true);
    try {
      const res = await queryList('/successes', {
        bot: currentRow.botName || currentRow.userName,
        current: page,
        pageSize,
      });
      if (res?.success) {
        setData(res.data || []);
        setTotal(res.total || 0);
      }
    } catch {
      message.error('获取继承记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    setCurrent(1);
  }, [currentRow?._id]);

  const handleDelete = async (id: string) => {
    try {
      await removeItem(`/successes/${id}`);
      message.success('删除成功');
      fetchData(current);
    } catch {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '继承码',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: '来源用户',
      dataIndex: 'botUser',
      key: 'botUser',
      render: (botUser: any) =>
        botUser
          ? botUser.userName
            ? `@${botUser.userName}`
            : `${botUser.firstName || ''} ${botUser.lastName || ''}`.trim() || '-'
          : '-',
    },
    {
      title: '继承目标',
      dataIndex: 'targetBotUser',
      key: 'targetBotUser',
      render: (targetBotUser: any) =>
        targetBotUser
          ? targetBotUser.userName
            ? `@${targetBotUser.userName}`
            : `${targetBotUser.firstName || ''} ${targetBotUser.lastName || ''}`.trim() || '-'
          : '-',
    },
    {
      title: '继承前积分',
      dataIndex: 'amountBefore',
      key: 'amountBefore',
      render: (val: number) => (val !== undefined && val !== null ? `${val} USDT` : '-'),
    },
    {
      title: '状态',
      dataIndex: 'used',
      key: 'used',
      render: (used: boolean) =>
        used ? <Tag color="success">已继承</Tag> : <Tag color="default">未使用</Tag>,
    },
    {
      title: '继承时间',
      dataIndex: 'usedAt',
      key: 'usedAt',
      render: (usedAt: string) => (usedAt ? dayjs(usedAt).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) =>
        createdAt ? dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: any) => (
        <Popconfirm title="确定删除该记录吗？" onConfirm={() => handleDelete(record._id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card
      size="small"
      title="积分继承记录"
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchData(current)} loading={loading}>
            刷新
          </Button>
        </Space>
      }
    >
      <Table
        dataSource={data}
        columns={columns}
        rowKey="_id"
        size="small"
        loading={loading}
        locale={{ emptyText: <Empty description="暂无继承记录" /> }}
        pagination={{
          current,
          pageSize,
          total,
          onChange: (page) => {
            setCurrent(page);
            fetchData(page);
          },
          showTotal: (t) => `共 ${t} 条`,
          showSizeChanger: false,
        }}
      />
    </Card>
  );
};

export default SuccessTab;
