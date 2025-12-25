import { Modal, Table, Tag, Image, Space, message } from 'antd';
import { useIntl } from '@umijs/max';
import React, { useEffect, useState } from 'react';
import { queryList } from '@/services/ant-design-pro/api';
import type { ColumnsType } from 'antd/es/table';

interface Props {
  open: boolean;
  onClose: () => void;
  channelPostId?: string;
}

const HistoryModal: React.FC<Props> = ({ open, onClose, channelPostId }) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchData = async (page = 1, pageSize = 10) => {
    if (!channelPostId) return;
    setLoading(true);
    try {
      const res = await queryList('/channel-post-histories', {
        channelPost: channelPostId,
        current: page,
        pageSize,
      });
      setData(res.data || []);
      setPagination({ current: page, pageSize, total: res.total || 0 });
    } catch (error) {
      message.error('获取历史记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && channelPostId) {
      fetchData(1, 10);
    }
  }, [open, channelPostId]);

  const columns: ColumnsType<any> = [
    {
      title: '内容',
      dataIndex: 'content',
      width: 200,
      ellipsis: true,
      render: (_, record) => (
        <div
          style={{ maxWidth: 200 }}
          dangerouslySetInnerHTML={{ __html: record.content || '-' }}
        />
      ),
    },
    {
      title: '媒体',
      dataIndex: 'medias',
      width: 100,
      render: (_, record) =>
        record?.medias?.length > 0 ? (
          <Space>
            {record.medias.slice(0, 1).map((url: string, idx: number) => {
              const fullUrl = url.startsWith('http') ? url : `/api/static/${url}`;
              return <Image key={idx} src={fullUrl} width={40} height={40} />;
            })}
            {record.medias.length > 1 && <span>+{record.medias.length - 1}</span>}
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: '消息ID',
      dataIndex: 'messageId',
      width: 100,
      render: (_, record) => record?.messageId || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (_, record) =>
        record.status === 'success' ? (
          <Tag color="success">成功</Tag>
        ) : (
          <Tag color="error">失败</Tag>
        ),
    },
    {
      title: '错误信息',
      dataIndex: 'errorMessage',
      width: 150,
      ellipsis: true,
      render: (_, record) => record?.errorMessage || '-',
    },
    {
      title: '发送时间',
      dataIndex: 'sentAt',
      width: 160,
      render: (_, record) => (record?.sentAt ? new Date(record.sentAt).toLocaleString() : '-'),
    },
  ];

  return (
    <Modal
      title={intl.formatMessage({ id: 'send_history', defaultMessage: '发送历史' })}
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      destroyOnClose
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => fetchData(page, pageSize),
        }}
        scroll={{ x: 'max-content' }}
        size="small"
      />
    </Modal>
  );
};

export default HistoryModal;
