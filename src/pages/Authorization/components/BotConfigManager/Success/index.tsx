import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Empty,
  Button,
  message,
  Space,
  Input,
  Select,
  Popconfirm,
  Tag,
  Row,
  Col,
} from 'antd';
import { ReloadOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
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

  // 搜索条件
  const [botUserSearch, setBotUserSearch] = useState('');
  const [usedFilter, setUsedFilter] = useState<string | undefined>(undefined);

  const fetchData = async (page = 1) => {
    if (!currentRow?._id) return;
    setLoading(true);
    try {
      const params: any = {
        botId: currentRow._id,
        current: page,
        pageSize,
      };
      if (botUserSearch) params.botUser = botUserSearch;
      if (usedFilter !== undefined) params.used = usedFilter;

      const res = await queryList('/successes', params);
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
    setCurrent(1);
    fetchData(1);
  }, [currentRow?._id]);

  const handleSearch = () => {
    setCurrent(1);
    fetchData(1);
  };

  const handleReset = () => {
    setBotUserSearch('');
    setUsedFilter(undefined);
    setCurrent(1);
    // 用 setTimeout 等 state 更新后再查
    setTimeout(() => fetchData(1), 0);
  };

  const handleDelete = async (id: string) => {
    try {
      await removeItem(`/successes/${id}`);
      message.success('删除成功');
      fetchData(current);
    } catch {
      message.error('删除失败');
    }
  };

  const formatUser = (user: any) => {
    if (!user) return '-';
    if (user.userName) return `@${user.userName}`;
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || '-';
  };

  const columns = [
    {
      title: '继承码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: '来源用户',
      dataIndex: 'botUser',
      key: 'botUser',
      render: formatUser,
    },
    {
      title: '继承目标',
      dataIndex: 'targetBotUser',
      key: 'targetBotUser',
      render: (val: any) => (val ? formatUser(val) : <span style={{ color: '#bbb' }}>未使用</span>),
    },
    {
      title: '继承前积分',
      dataIndex: 'amountBefore',
      key: 'amountBefore',
      width: 110,
      render: (val: number) =>
        val !== undefined && val !== null ? (
          <span style={{ fontWeight: 500 }}>{val} USDT</span>
        ) : (
          '-'
        ),
    },
    {
      title: '状态',
      dataIndex: 'used',
      key: 'used',
      width: 90,
      render: (used: boolean) =>
        used ? <Tag color="success">已继承</Tag> : <Tag color="default">未使用</Tag>,
    },
    {
      title: '继承时间',
      dataIndex: 'usedAt',
      key: 'usedAt',
      width: 160,
      render: (val: string) => (val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (val: string) => (val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'),
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
        <Button icon={<ReloadOutlined />} onClick={() => fetchData(current)} loading={loading}>
          刷新
        </Button>
      }
    >
      {/* 搜索栏 */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col>
          <Input
            placeholder="来源用户名"
            value={botUserSearch}
            onChange={(e) => setBotUserSearch(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            style={{ width: 180 }}
          />
        </Col>
        <Col>
          <Select
            placeholder="继承状态"
            value={usedFilter}
            onChange={setUsedFilter}
            allowClear
            style={{ width: 130 }}
            options={[
              { label: '已继承', value: 'true' },
              { label: '未使用', value: 'false' },
            ]}
          />
        </Col>
        <Col>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              查询
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Col>
      </Row>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="_id"
        size="small"
        loading={loading}
        scroll={{ x: 'max-content' }}
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
