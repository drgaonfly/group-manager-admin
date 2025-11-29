import React from 'react';
import { Modal } from 'antd';
import { useIntl } from '@umijs/max';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';

export interface BotUserListModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  data: any[]; // 直接传入的 BotUserConfig 数据
}

const BotUserListModal: React.FC<BotUserListModalProps> = ({ open, title, onClose, data }) => {
  const intl = useIntl();

  const columns: ProColumns<any>[] = [
    {
      title: intl.formatMessage({ id: 'id', defaultMessage: 'ID' }),
      dataIndex: ['botUser', 'id'],
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'user', defaultMessage: '用户' }),
      dataIndex: ['botUser', 'userName'],
      hideInSearch: true,
      render: (_, record: any) =>
        record?.botUser?.userName || record?.botUser?.firstName || record?.botUser?.lastName || '-',
    },
    {
      title: intl.formatMessage({ id: 'bot', defaultMessage: '机器人' }),
      dataIndex: ['bot', 'botName'],
      hideInSearch: true,
      render: (_, record: any) => record?.bot?.botName || record?.bot?.userName || '-',
    },
    {
      title: intl.formatMessage({ id: 'createdAt', defaultMessage: '创建时间' }),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
    },
  ];

  return (
    <Modal
      open={open}
      title={title || intl.formatMessage({ id: 'user', defaultMessage: '用户' })}
      footer={null}
      width={900}
      onCancel={onClose}
    >
      <ProTable<any, API.PageParams>
        rowKey="_id"
        search={false}
        options={false}
        toolBarRender={false}
        pagination={{ pageSize: 10, total: data.length }}
        dataSource={data}
        columns={columns}
      />
    </Modal>
  );
};

export default BotUserListModal;
