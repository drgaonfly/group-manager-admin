import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, message, Tag, Dropdown } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  UserOutlined,
  PushpinOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import moment from 'moment';
import { queryList } from '@/services/ant-design-pro/api';
import { request } from '@umijs/max';
import AuctionForm from './AuctionForm';

interface AuctionRecord {
  _id: string;
  title: string;
  keywords: string[];
  status: 'pending' | 'ongoing' | 'completed';
  startingPrice: number;
  minBidIncrement: number;
  maxBidIncrement: number;
  endTime: string;
  group: {
    _id: string;
    title: string;
    username?: string;
  };
  bids: any[];
  winner?: {
    telegramId: number;
    username?: string;
    firstName?: string;
  };
  winningBid?: number;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuctionRuleProps {
  currentRow: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const AuctionRule: React.FC<AuctionRuleProps> = ({ currentRow, onBotUpdate }) => {
  console.log('AuctionRule - onBotUpdate:', onBotUpdate);
  const [data, setData] = useState<AuctionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AuctionRecord | null>(null);
  const [bidsModalVisible, setBidsModalVisible] = useState(false);
  const [bidsData, setBidsData] = useState<any[]>([]);

  const fetchAuctions = async () => {
    if (!currentRow?._id) return;

    setLoading(true);
    try {
      const response = await queryList('/auctions', {
        current: 1,
        pageSize: 100,
        botId: currentRow._id,
      });
      if (response?.data) {
        setData(response.data as any);
      }
    } catch (error) {
      console.error('获取竞拍列表失败:', error);
      message.error('获取竞拍列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentRow?._id) {
      fetchAuctions();
    }
  }, [currentRow]);

  const handleCreate = () => {
    setEditingRecord(null);
    setModalVisible(true);
  };

  const handleEdit = (record: AuctionRecord) => {
    setEditingRecord(record);
    setModalVisible(true);
  };

  const handleDelete = async (record: AuctionRecord) => {
    try {
      await request(`/auctions/${record._id}`, {
        method: 'DELETE',
      });
      message.success('删除成功');
      fetchAuctions();
      // 通知父组件更新
      if (onBotUpdate) {
        console.log('AuctionRule - calling onBotUpdate after delete');
        await onBotUpdate({ _id: currentRow._id });
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleEnd = async (record: AuctionRecord) => {
    try {
      await request(`/auctions/${record._id}/end`, {
        method: 'POST',
      });
      message.success('竞拍已结束');
      fetchAuctions();
      // 通知父组件更新
      if (onBotUpdate) {
        console.log('AuctionRule - calling onBotUpdate after end');
        await onBotUpdate({ _id: currentRow._id });
      }
    } catch (error) {
      message.error('结束竞拍失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const url = editingRecord ? `/auctions/${editingRecord._id}` : '/auctions';
      const method = editingRecord ? 'PUT' : 'POST';

      await request(url, {
        method,
        data: {
          ...values,
          bot: currentRow._id,
        },
      });

      message.success(editingRecord ? '更新成功' : '创建成功');
      setModalVisible(false);
      fetchAuctions();
      // 通知父组件更新
      if (onBotUpdate) {
        console.log('AuctionRule - calling onBotUpdate after submit');
        await onBotUpdate({ _id: currentRow._id });
      }
    } catch (error: any) {
      throw new Error(error.message || '操作失败');
    }
  };

  const showBids = async (record: AuctionRecord) => {
    try {
      const result = await request(`/auctions/${record._id}/bids`);
      if (result.success) {
        setBidsData(result.data);
        setBidsModalVisible(true);
      }
    } catch (error) {
      message.error('获取出价记录失败');
    }
  };

  const getStatusTag = (status: string, endTime: string) => {
    const now = moment();
    const end = moment(endTime);

    if (status === 'completed') {
      return <Tag color="red">已结束</Tag>;
    } else if (end.isBefore(now)) {
      return <Tag color="orange">已过期</Tag>;
    } else {
      return <Tag color="green">进行中</Tag>;
    }
  };

  const columns = [
    {
      title: '活动标题',
      dataIndex: 'title',
      key: 'title',
      width: 150,
      ellipsis: true,
    },
    {
      title: '群组',
      dataIndex: 'group',
      key: 'group',
      width: 120,
      ellipsis: true,
      render: (group: any) => group?.title || '未知群组',
    },
    {
      title: '起拍价',
      dataIndex: 'startingPrice',
      key: 'startingPrice',
      width: 80,
      render: (price: number) => `${price}积分`,
    },
    {
      title: '加价区间',
      key: 'bidIncrement',
      width: 100,
      render: (_: any, record: AuctionRecord) =>
        `${record.minBidIncrement || 0}-${record.maxBidIncrement || 0}积分`,
    },
    {
      title: '出价次数',
      dataIndex: 'bids',
      key: 'bids',
      width: 80,
      render: (bids: any[]) => bids?.length || 0,
    },
    {
      title: '当前最高价',
      key: 'currentHighest',
      width: 100,
      render: (_: any, record: AuctionRecord) => {
        if (!record.bids || record.bids.length === 0) {
          return `${record.startingPrice}积分`;
        }
        const highest = Math.max(...record.bids.map((b) => b.bidAmount));
        return `${highest}积分`;
      },
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 100,
      render: (time: string) => moment(time).format('MM-DD HH:mm'),
    },
    {
      title: '置顶',
      dataIndex: 'isPinned',
      key: 'isPinned',
      width: 80,
      render: (isPinned: boolean) =>
        isPinned ? (
          <Tag color="blue" icon={<PushpinOutlined />}>
            置顶
          </Tag>
        ) : (
          <Tag>不置顶</Tag>
        ),
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: (_: any, record: AuctionRecord) => getStatusTag(record.status, record.endTime),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      render: (time: string) => moment(time).format('MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: AuctionRecord) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'bids',
            icon: <UserOutlined />,
            label: '出价记录',
            onClick: () => showBids(record),
          },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: '编辑',
            onClick: () => handleEdit(record),
          },
        ];

        // 只有进行中的竞拍才显示结束按钮
        if (record.status === 'ongoing' && moment(record.endTime).isAfter(moment())) {
          menuItems.push({
            key: 'end',
            icon: <StopOutlined />,
            label: '结束竞拍',
            onClick: () => handleEnd(record),
            danger: true,
          });
        }

        menuItems.push({
          key: 'delete',
          icon: <DeleteOutlined />,
          label: '删除',
          onClick: () => {
            Modal.confirm({
              title: '确定删除这个竞拍活动吗？',
              content: '删除后无法恢复',
              okText: '确定',
              cancelText: '取消',
              onOk: () => handleDelete(record),
            });
          },
          danger: true,
        });

        return (
          <div style={{ display: 'flex', gap: '4px' }}>
            <Button
              icon={<UserOutlined />}
              onClick={() => showBids(record)}
              size="small"
              title="出价记录"
            />
            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
              <Button icon={<MoreOutlined />} size="small" title="更多操作" />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  const bidsColumns = [
    {
      title: '用户名',
      key: 'username',
      render: (_: any, record: any) =>
        record.firstName || record.username || `用户${record.telegramId}`,
    },
    {
      title: 'Telegram ID',
      dataIndex: 'telegramId',
      key: 'telegramId',
    },
    {
      title: '出价金额',
      dataIndex: 'bidAmount',
      key: 'bidAmount',
      render: (amount: number) => `${amount}积分`,
    },
    {
      title: '状态',
      dataIndex: 'isWinning',
      key: 'isWinning',
      render: (isWinning: boolean) => (isWinning ? <Tag color="green">领先</Tag> : <Tag>出局</Tag>),
    },
    {
      title: '出价时间',
      dataIndex: 'bidTime',
      key: 'bidTime',
      render: (date: string) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  return (
    <div>
      <Card
        title="竞拍活动管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建竞拍活动
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      </Card>

      {/* 创建/编辑竞拍活动模态框 */}
      <Modal
        title={editingRecord ? '编辑竞拍活动' : '创建竞拍活动'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width="80%"
        style={{ maxWidth: 1000 }}
        destroyOnClose
      >
        <AuctionForm
          currentRow={editingRecord}
          botId={currentRow?._id}
          onSubmit={handleSubmit}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>

      {/* 出价记录模态框 */}
      <Modal
        title="出价记录"
        open={bidsModalVisible}
        onCancel={() => setBidsModalVisible(false)}
        footer={null}
        width="80%"
        style={{ maxWidth: 1000 }}
      >
        <Table
          columns={bidsColumns}
          dataSource={bidsData}
          rowKey={(record, index) => `${record.telegramId}_${index}`}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      </Modal>
    </div>
  );
};

export default AuctionRule;
