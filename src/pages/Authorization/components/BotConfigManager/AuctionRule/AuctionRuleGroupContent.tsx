import React, { useState, useEffect } from 'react';
import { Button, Table, Space, message, Tag, Dropdown, Modal } from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  UserOutlined,
  PushpinOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { queryList } from '@/services/ant-design-pro/api';
import { request } from '@umijs/max';
import AuctionForm from './AuctionForm';

interface Props {
  open: boolean;
  bot: any;
  group: any;
}

const AuctionRuleGroupContent: React.FC<Props> = ({ open, bot, group }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [bidsModalOpen, setBidsModalOpen] = useState(false);
  const [bidsData, setBidsData] = useState<any[]>([]);

  const fetchData = async () => {
    if (!bot?._id || !group?._id) return;
    setLoading(true);
    try {
      const res = await queryList('/auctions', {
        current: 1,
        pageSize: 100,
        botId: bot._id,
        groupId: group._id,
      });
      if (res?.data) setData(res.data);
    } catch {
      message.error('获取竞拍列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open, bot?._id, group?._id]);

  const handleSubmit = async (values: any) => {
    try {
      const url = editingRecord ? `/auctions/${editingRecord._id}` : '/auctions';
      const method = editingRecord ? 'PUT' : 'POST';
      await request(url, { method, data: { ...values, bot: bot._id, group: group._id } });
      message.success(editingRecord ? '更新成功' : '创建成功');
      setFormModalOpen(false);
      fetchData();
    } catch (e: any) {
      throw new Error(e?.message || '操作失败');
    }
  };

  const handleEnd = async (record: any) => {
    try {
      await request(`/auctions/${record._id}/end`, { method: 'POST' });
      message.success('竞拍已结束');
      fetchData();
    } catch {
      message.error('结束竞拍失败');
    }
  };

  const handleDelete = async (record: any) => {
    try {
      await request(`/auctions/${record._id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchData();
    } catch {
      message.error('删除失败');
    }
  };

  const showBids = async (record: any) => {
    try {
      const res = await request(`/auctions/${record._id}/bids`);
      if (res.success) {
        setBidsData(res.data);
        setBidsModalOpen(true);
      }
    } catch {
      message.error('获取出价记录失败');
    }
  };

  const getStatusTag = (status: string, endTime: string) => {
    if (status === 'completed') return <Tag color="red">已结束</Tag>;
    if (moment(endTime).isBefore(moment())) return <Tag color="orange">已过期</Tag>;
    return <Tag color="green">进行中</Tag>;
  };

  const columns = [
    { title: '活动标题', dataIndex: 'title', ellipsis: true, width: 140 },
    { title: '起拍价', dataIndex: 'startingPrice', width: 80, render: (v: number) => `${v}积分` },
    {
      title: '加价区间',
      width: 100,
      render: (_: any, r: any) => `${r.minBidIncrement || 0}-${r.maxBidIncrement || 0}积分`,
    },
    { title: '出价次数', dataIndex: 'bids', width: 80, render: (b: any[]) => b?.length || 0 },
    {
      title: '置顶',
      dataIndex: 'isPinned',
      width: 70,
      render: (v: boolean) =>
        v ? (
          <Tag color="blue" icon={<PushpinOutlined />}>
            置顶
          </Tag>
        ) : (
          <Tag>否</Tag>
        ),
    },
    {
      title: '状态',
      width: 80,
      render: (_: any, r: any) => getStatusTag(r.status, r.endTime),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      width: 100,
      render: (t: string) => moment(t).format('MM-DD HH:mm'),
    },
    {
      title: '操作',
      width: 100,
      render: (_: any, record: any) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: '编辑',
            onClick: () => {
              setEditingRecord(record);
              setFormModalOpen(true);
            },
          },
          ...(record.status === 'ongoing' && moment(record.endTime).isAfter(moment())
            ? [
                {
                  key: 'end',
                  icon: <StopOutlined />,
                  label: '结束竞拍',
                  danger: true,
                  onClick: () => handleEnd(record),
                },
              ]
            : []),
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: '删除',
            danger: true,
            onClick: () => Modal.confirm({ title: '确定删除？', onOk: () => handleDelete(record) }),
          },
        ];
        return (
          <Space size="small">
            <Button icon={<UserOutlined />} size="small" onClick={() => showBids(record)} />
            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
              <Button icon={<MoreOutlined />} size="small" />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingRecord(null);
            setFormModalOpen(true);
          }}
        >
          创建竞拍活动
        </Button>
      </div>
      <Table
        rowKey="_id"
        dataSource={data}
        columns={columns}
        loading={loading}
        size="small"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 900 }}
      />

      <Modal
        title={editingRecord ? '编辑竞拍活动' : '创建竞拍活动'}
        open={formModalOpen}
        onCancel={() => setFormModalOpen(false)}
        footer={null}
        width="80%"
        style={{ maxWidth: 1000 }}
        destroyOnClose
      >
        <AuctionForm
          currentRow={editingRecord}
          botId={bot?._id}
          fixedGroupId={editingRecord ? undefined : group?._id}
          onSubmit={handleSubmit}
          onCancel={() => setFormModalOpen(false)}
        />
      </Modal>

      <Modal
        title="出价记录"
        open={bidsModalOpen}
        onCancel={() => setBidsModalOpen(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Table
          rowKey={(r, i) => `${r.telegramId}_${i}`}
          dataSource={bidsData}
          columns={[
            {
              title: '用户名',
              key: 'user',
              render: (_: any, r: any) => r.firstName || r.username || `用户${r.telegramId}`,
            },
            { title: 'Telegram ID', dataIndex: 'telegramId' },
            { title: '出价金额', dataIndex: 'bidAmount', render: (v: number) => `${v}积分` },
            {
              title: '状态',
              dataIndex: 'isWinning',
              render: (v: boolean) => (v ? <Tag color="green">领先</Tag> : <Tag>出局</Tag>),
            },
            {
              title: '出价时间',
              dataIndex: 'bidTime',
              render: (d: string) => moment(d).format('YYYY-MM-DD HH:mm:ss'),
            },
          ]}
          size="small"
          pagination={{ pageSize: 10 }}
        />
      </Modal>
    </>
  );
};

export default AuctionRuleGroupContent;
