import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Empty,
  Button,
  message,
  Space,
  Select,
  Popconfirm,
  Tag,
  Drawer,
  Typography,
} from 'antd';
import { ReloadOutlined, DeleteOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { queryList, removeItem } from '@/services/ant-design-pro/api';
import { request } from '@umijs/max';
import dayjs from 'dayjs';

const { Text } = Typography;

const STATUS_COLOR: Record<string, string> = {
  active: 'processing',
  completed: 'success',
  expired: 'default',
  cancelled: 'error',
};

const STATUS_LABEL: Record<string, string> = {
  active: '进行中',
  completed: '已领完',
  expired: '已过期',
  cancelled: '已取消',
};

interface RedPacketTabProps {
  currentRow: any;
}

const RedPacketTab: React.FC<RedPacketTabProps> = ({ currentRow }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const pageSize = 20;

  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // 领取记录 Drawer
  const [claimsOpen, setClaimsOpen] = useState(false);
  const [claimsRecord, setClaimsRecord] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);

  const fetchData = async (page = 1) => {
    if (!currentRow?._id) return;
    setLoading(true);
    try {
      const params: any = { botId: currentRow._id, current: page, pageSize };
      if (statusFilter) params.status = statusFilter;
      const res = await queryList('/red-packets', params);
      if (res?.success) {
        setData(res.data || []);
        setTotal(res.total || 0);
      }
    } catch {
      message.error('获取红包记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrent(1);
    fetchData(1);
  }, [currentRow?._id]);

  const handleDelete = async (id: string) => {
    try {
      await removeItem(`/red-packets/${id}`);
      message.success('删除成功');
      fetchData(current);
    } catch {
      message.error('删除失败');
    }
  };

  const openClaims = async (record: any) => {
    setClaimsRecord(record);
    setClaimsOpen(true);
    setClaimsLoading(true);
    try {
      const res = await request(`/api/red-packets/${record._id}/claims`, {
        method: 'GET',
        params: { pageSize: 100 },
      });
      setClaims(res?.data || []);
    } catch {
      setClaims([]);
    } finally {
      setClaimsLoading(false);
    }
  };

  const formatUser = (user: any) => {
    if (!user) return '-';
    if (user.userName) return `@${user.userName}`;
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || '-';
  };

  const columns = [
    {
      title: '发起人',
      dataIndex: 'creator',
      key: 'creator',
      render: formatUser,
    },
    {
      title: '总积分',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
      width: 80,
      render: (v: number) => <Text strong>{v}</Text>,
    },
    {
      title: '份数',
      dataIndex: 'totalSlots',
      key: 'totalSlots',
      width: 70,
    },
    {
      title: '每份',
      dataIndex: 'pointsPerSlot',
      key: 'pointsPerSlot',
      width: 70,
    },
    {
      title: '炸弹',
      dataIndex: 'bombNumbers',
      key: 'bombNumbers',
      width: 120,
      render: (arr: number[]) =>
        arr?.length > 0 ? (
          arr.map((n) => (
            <Tag key={n} color="red" style={{ marginBottom: 2 }}>
              💣 {n}
            </Tag>
          ))
        ) : (
          <Text type="secondary">无</Text>
        ),
    },
    {
      title: '倍率',
      dataIndex: 'bombMultiplier',
      key: 'bombMultiplier',
      width: 70,
      render: (v: number) => `×${v}`,
    },
    {
      title: '已领',
      dataIndex: 'claimedCount',
      key: 'claimedCount',
      width: 80,
      render: (_: any, r: any) => `${r.claimedCount ?? 0} / ${r.totalSlots}`,
    },
    {
      title: '全炸',
      dataIndex: 'allBombed',
      key: 'allBombed',
      width: 60,
      render: (v: boolean) => (v ? <Tag color="volcano">💥</Tag> : <Tag color="default">否</Tag>),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (v: string) => <Tag color={STATUS_COLOR[v] ?? 'default'}>{STATUS_LABEL[v] ?? v}</Tag>,
    },
    {
      title: '过期时间',
      dataIndex: 'expiredAt',
      key: 'expiredAt',
      width: 140,
      render: (v: string) => (v ? dayjs(v).format('MM-DD HH:mm') : '-'),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (v: string) => (v ? dayjs(v).format('MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<UnorderedListOutlined />}
            onClick={() => openClaims(record)}
          >
            领取
          </Button>
          <Popconfirm title="确定删除该红包记录吗？" onConfirm={() => handleDelete(record._id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const claimsColumns = [
    {
      title: '数字',
      dataIndex: 'assignedNumber',
      width: 60,
      render: (n: number, r: any) => <Tag color={r.isBomb ? 'red' : 'green'}>{n}</Tag>,
    },
    {
      title: '领取人',
      dataIndex: 'botUser',
      render: formatUser,
    },
    {
      title: '炸弹',
      dataIndex: 'isBomb',
      width: 70,
      render: (v: boolean) => (v ? <Tag color="red">💣</Tag> : <Tag color="green">✅</Tag>),
    },
    {
      title: '积分变动',
      dataIndex: 'pointsDelta',
      width: 90,
      render: (v: number) => (
        <Text type={v >= 0 ? 'success' : 'danger'}>{v >= 0 ? `+${v}` : v}</Text>
      ),
    },
    {
      title: '领取前',
      dataIndex: 'pointsBefore',
      width: 80,
    },
    {
      title: '领取后',
      dataIndex: 'pointsAfter',
      width: 80,
    },
    {
      title: '领取时间',
      dataIndex: 'createdAt',
      width: 140,
      render: (v: string) => (v ? dayjs(v).format('MM-DD HH:mm:ss') : '-'),
    },
  ];

  return (
    <>
      <Card
        size="small"
        title="红包记录"
        extra={
          <Space>
            <Select
              placeholder="状态筛选"
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setCurrent(1);
                setTimeout(() => fetchData(1), 0);
              }}
              allowClear
              style={{ width: 110 }}
              options={[
                { label: '进行中', value: 'active' },
                { label: '已领完', value: 'completed' },
                { label: '已过期', value: 'expired' },
                { label: '已取消', value: 'cancelled' },
              ]}
            />
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
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: <Empty description="暂无红包记录" /> }}
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

      {/* 领取记录 Drawer */}
      <Drawer
        title={`领取记录${
          claimsRecord
            ? ` — 总积分 ${claimsRecord.totalPoints}，共 ${claimsRecord.totalSlots} 份`
            : ''
        }`}
        open={claimsOpen}
        onClose={() => {
          setClaimsOpen(false);
          setClaims([]);
        }}
        width={700}
        destroyOnClose
      >
        {claimsRecord?.allBombed && (
          <Tag color="volcano" style={{ marginBottom: 12 }}>
            💥 全炸！所有扣款已退还发起人
          </Tag>
        )}
        <Table
          rowKey="_id"
          dataSource={claims}
          columns={claimsColumns}
          loading={claimsLoading}
          pagination={false}
          size="small"
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: <Empty description="暂无领取记录" /> }}
        />
      </Drawer>
    </>
  );
};

export default RedPacketTab;
