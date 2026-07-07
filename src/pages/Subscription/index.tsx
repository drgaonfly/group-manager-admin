import { useIntl } from '@umijs/max';
import { queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { message, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import Update from './components/Update';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
import ActionButton from '@/components/ActionButton';

const STATUS_TAG: Record<string, { color: string; text: string }> = {
  pending: { color: 'processing', text: '待付款' },
  paid: { color: 'success', text: '已付款' },
  expired: { color: 'default', text: '已到期' },
  timeout: { color: 'error', text: '订单超时' },
};

const handleUpdate = async (fields: any) => {
  const hide = message.loading(<FormattedMessage id="updating" defaultMessage="Updating..." />);
  try {
    await updateItem(`/subscriptions/${fields._id}`, fields);
    hide();
    message.success(<FormattedMessage id="update_successful" defaultMessage="Update successful" />);
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? 'Failed to update subscription');
    return false;
  }
};

const handleRemove = async (ids: any) => {
  const hide = message.loading(<FormattedMessage id="deleting" defaultMessage="Deleting..." />);
  try {
    await removeItem('/subscriptions', { ids });
    hide();
    message.success(
      <FormattedMessage id="delete_successful" defaultMessage="Deleted successfully" />,
    );
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? 'Failed to delete subscription');
    return false;
  }
};

const SubscriptionTableList: React.FC = () => {
  const intl = useIntl();
  const [updateModalOpen, handleUpdateModalOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const [activeKey, setActiveKey] = useState<string | undefined>('');
  const access = useAccess();

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'bot', defaultMessage: '机器人' }),
      dataIndex: 'bot',
      hideInSearch: true,
      render: (_, record) => {
        return record.bot?.botName || '-';
      },
    },
    {
      title: intl.formatMessage({ id: 'user', defaultMessage: 'Bot User' }),
      dataIndex: 'botUser',
      hideInSearch: true,
      render: (_, record) => {
        return (
          record.botUser?.userName ||
          record.botUser?.firstName + ' ' + record.botUser?.lastName ||
          '-'
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'months', defaultMessage: '订阅月数' }),
      dataIndex: 'months',
      hideInSearch: true,
      render: (months) => `${months} 个月`,
    },
    {
      title: intl.formatMessage({ id: 'status', defaultMessage: 'Status' }),
      dataIndex: 'status',
      hideInSearch: true,
      render: (_, record) => {
        const status = record.status || 'pending';
        const cfg = STATUS_TAG[status] ?? { color: 'default', text: status };
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
      },
    },
    {
      title: intl.formatMessage({ id: 'amount', defaultMessage: 'Amount' }),
      dataIndex: 'amount',
      hideInSearch: true,
      render: (amount) => `${amount} USDT`,
    },
    {
      title: intl.formatMessage({ id: 'paidAmount', defaultMessage: 'Paid Amount' }),
      dataIndex: 'paidAmount',
      hideInSearch: true,
      render: (paidAmount) => (paidAmount ? `${paidAmount} USDT` : '-'),
    },
    {
      title: intl.formatMessage({ id: 'toAddress', defaultMessage: 'To Address' }),
      dataIndex: 'toAddress',
      hideInSearch: true,
      copyable: true,
      ellipsis: true,
    },
    {
      title: intl.formatMessage({ id: 'txHash', defaultMessage: 'Tx Hash' }),
      dataIndex: 'txHash',
      hideInSearch: true,
      copyable: true,
      ellipsis: true,
      render: (txHash) => txHash || '-',
    },
    {
      title: intl.formatMessage({ id: 'orderExpiredAt', defaultMessage: 'Order Expired At' }),
      dataIndex: 'orderExpiredAt',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: intl.formatMessage({ id: 'startDate', defaultMessage: 'Start Date' }),
      dataIndex: 'startDate',
      hideInSearch: true,
      valueType: 'dateTime',
      render: (_, record) => record.startDate || '-',
    },
    {
      title: intl.formatMessage({ id: 'endDate', defaultMessage: 'End Date' }),
      dataIndex: 'endDate',
      hideInSearch: true,
      valueType: 'dateTime',
      render: (_, record) => record.endDate || '-',
    },
    {
      title: intl.formatMessage({ id: 'paidAt', defaultMessage: 'Paid At' }),
      dataIndex: 'paidAt',
      hideInSearch: true,
      valueType: 'dateTime',
      render: (_, record) => record.paidAt || '-',
    },
    {
      title: intl.formatMessage({ id: 'createdAt', defaultMessage: 'Created At' }),
      dataIndex: 'createdAt',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Actions" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <ActionButton
          key="detail"
          type="detail"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          <FormattedMessage id="detail" defaultMessage="Detail" />
        </ActionButton>,
        access.canUpdateSubscription && (
          <ActionButton
            key="edit"
            type="edit"
            onClick={() => {
              handleUpdateModalOpen(true);
              setCurrentRow(record);
            }}
          >
            {intl.formatMessage({ id: 'edit' })}
          </ActionButton>
        ),
        access.canDeleteSubscription && (
          <DeleteLink
            onOk={async () => {
              await handleRemove([record._id!]);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />
        ),
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.ItemData, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'subscription_list',
          defaultMessage: 'Subscription List',
        })}
        actionRef={actionRef}
        rowKey="_id"
        toolbar={{
          menu: {
            type: 'tab',
            activeKey: activeKey,
            items: [
              {
                label: <FormattedMessage id="platform.all" defaultMessage="all" />,
                key: '',
              },
              {
                label: <FormattedMessage id="pending" defaultMessage="pending" />,
                key: 'pending',
              },
              {
                label: <FormattedMessage id="paid" defaultMessage="paid" />,
                key: 'paid',
              },
              {
                label: <FormattedMessage id="expired" defaultMessage="expired" />,
                key: 'expired',
              },
              {
                label: <FormattedMessage id="timeout" defaultMessage="timeout" />,
                key: 'timeout',
              },
            ],
            onChange: (key: any) => {
              setActiveKey(key);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            },
          },
        }}
        request={(params, sort, filter) =>
          queryList('/subscriptions', { ...params, status: activeKey }, sort, filter)
        }
        columns={columns}
        rowSelection={
          access.canUpdateSubscription && {
            onChange: (_, selectedRows) => setSelectedRows(selectedRows),
          }
        }
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="items" />
            </div>
          }
        >
          <DeleteButton
            onOk={async () => {
              await handleRemove(selectedRowsState.map((item) => item._id!));
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />
        </FooterToolbar>
      )}
      {access.canUpdateSubscription && (
        <Update
          onSubmit={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalOpen(false);
              setCurrentRow(undefined);
              actionRef.current?.reload();
            }
          }}
          onCancel={handleUpdateModalOpen}
          updateModalOpen={updateModalOpen}
          values={currentRow || {}}
        />
      )}
      <Show
        open={showDetail}
        currentRow={currentRow}
        columns={columns as ProDescriptionsItemProps<any>[]}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />
    </PageContainer>
  );
};

export default SubscriptionTableList;
