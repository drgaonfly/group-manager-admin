import React, { useEffect, useState } from 'react';
import { Drawer, Table, Tag, Typography, Spin } from 'antd';
import { useIntl } from '@umijs/max';
import { request } from '@umijs/max';

const { Text } = Typography;

interface Props {
  open: boolean;
  redPacket: API.ItemData | null;
  onClose: () => void;
}

const ClaimsDrawer: React.FC<Props> = ({ open, redPacket, onClose }) => {
  const intl = useIntl();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !redPacket?._id) return;
    setLoading(true);
    request(`/api/red-packets/${redPacket._id}/claims`, {
      method: 'GET',
      params: { pageSize: 100 },
    })
      .then((res: any) => setClaims(res?.data || []))
      .catch(() => setClaims([]))
      .finally(() => setLoading(false));
  }, [open, redPacket?._id]);

  // 关闭时清空
  const handleClose = () => {
    setClaims([]);
    onClose();
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'assignedNumber',
      width: 60,
      render: (num: number, record: any) => (
        <Tag color={record.isBomb ? 'red' : 'green'}>{num}</Tag>
      ),
    },
    {
      title: intl.formatMessage({ id: 'user', defaultMessage: '用户' }),
      dataIndex: 'botUser',
      render: (u: any) => u?.userName || u?.firstName || '-',
    },
    {
      title: intl.formatMessage({ id: 'isBomb', defaultMessage: '是否炸弹' }),
      dataIndex: 'isBomb',
      render: (v: boolean) =>
        v ? (
          <Tag color="red">💣 {intl.formatMessage({ id: 'bomb', defaultMessage: '炸弹' })}</Tag>
        ) : (
          <Tag color="green">✅ {intl.formatMessage({ id: 'safe', defaultMessage: '安全' })}</Tag>
        ),
    },
    {
      title: intl.formatMessage({ id: 'pointsDelta', defaultMessage: '积分变动' }),
      dataIndex: 'pointsDelta',
      render: (v: number) => (
        <Text type={v >= 0 ? 'success' : 'danger'}>{v >= 0 ? `+${v}` : v}</Text>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pointsBefore', defaultMessage: '领取前' }),
      dataIndex: 'pointsBefore',
    },
    {
      title: intl.formatMessage({ id: 'pointsAfter', defaultMessage: '领取后' }),
      dataIndex: 'pointsAfter',
    },
    {
      title: intl.formatMessage({ id: 'createdAt', defaultMessage: '领取时间' }),
      dataIndex: 'createdAt',
      render: (v: string) => new Date(v).toLocaleString(),
    },
  ];

  return (
    <Drawer
      title={intl.formatMessage({ id: 'redPacket_claims', defaultMessage: '领取记录' })}
      open={open}
      onClose={handleClose}
      width={820}
      destroyOnClose
    >
      {redPacket && (
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span>
            <Text type="secondary">
              {intl.formatMessage({ id: 'totalSlots', defaultMessage: '份数' })}：
            </Text>
            <Text strong>{redPacket.totalSlots}</Text>
          </span>
          <span>
            <Text type="secondary">
              {intl.formatMessage({ id: 'totalPoints', defaultMessage: '总积分' })}：
            </Text>
            <Text strong>{redPacket.totalPoints}</Text>
          </span>
          <span>
            <Text type="secondary">
              {intl.formatMessage({ id: 'claimed', defaultMessage: '已领' })}：
            </Text>
            <Text strong>
              {claims.length} / {redPacket.totalSlots}
            </Text>
          </span>
          <span>
            <Text type="secondary">
              {intl.formatMessage({ id: 'bombNumbers', defaultMessage: '炸弹数字' })}：
            </Text>
            {redPacket.bombNumbers?.length > 0 ? (
              redPacket.bombNumbers.map((n: number) => (
                <Tag key={n} color="red">
                  {n}
                </Tag>
              ))
            ) : (
              <Text type="secondary">无</Text>
            )}
          </span>
          {redPacket.allBombed && (
            <Tag color="volcano">
              💥 {intl.formatMessage({ id: 'allBombed', defaultMessage: '全炸！' })}
            </Tag>
          )}
        </div>
      )}

      <Spin spinning={loading}>
        <Table
          rowKey="_id"
          dataSource={claims}
          columns={columns}
          pagination={false}
          size="small"
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: loading ? ' ' : '暂无领取记录' }}
        />
      </Spin>
    </Drawer>
  );
};

export default ClaimsDrawer;
