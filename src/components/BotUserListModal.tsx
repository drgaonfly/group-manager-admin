import React from 'react';
import { Modal } from 'antd';
import { useIntl } from '@umijs/max';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { simpleGet } from '@/services/ant-design-pro/api';

export type BotUserListModalQueryType = 'bot' | 'promotionLink';

export interface BotUserListModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  queryType: BotUserListModalQueryType;
  id?: string;
}

const BotUserListModal: React.FC<BotUserListModalProps> = ({
  open,
  title,
  onClose,
  queryType,
  id,
}) => {
  const intl = useIntl();
  const actionRef = React.useRef<ActionType>();

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

  const getEndpoint = () => {
    if (!id) return '';
    if (queryType === 'promotionLink') {
      return `/bot-user-configs/by-promotion-link/${id}`;
    }
    return `/bot-user-configs/by-bot/${id}`;
  };

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
        actionRef={actionRef}
        pagination={{ pageSize: 10 }}
        request={async (params) => {
          const endpoint = getEndpoint();
          if (!endpoint) {
            return { data: [], success: true, total: 0 } as any;
          }
          const res = await simpleGet<{
            success: boolean;
            data: any[];
            total: number;
          }>(endpoint, {
            current: params.current,
            pageSize: params.pageSize,
          });
          return {
            data: Array.isArray(res.data) ? res.data : (res as any).data?.data ?? [],
            success: (res as any).success ?? true,
            total: (res as any).total ?? 0,
          } as any;
        }}
        columns={columns}
      />
    </Modal>
  );
};

export default BotUserListModal;
